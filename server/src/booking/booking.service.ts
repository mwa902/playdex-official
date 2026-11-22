import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Booking } from './interfaces/booking.interface';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

const BOOKING_SUMMARY_COLUMNS = `
  id, event_id, customer_name, customer_email, customer_phone, seats, status,
  payment_method, membership_monthly_fee, membership_joining_fee,
  booked_at, created_at, updated_at
`;

const GYM_JOINING_FEE = 1000;

function monthlyGymFee(address: string): number {
  const area = address.toLowerCase();
  if (/\bdha\b|\bcantt\b|gulberg/.test(area)) return 2500;
  if (/johar town|model town|bahria town/.test(area)) return 1500;
  return 500;
}

@Injectable()
export class BookingService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(): Promise<Booking[]> {
    const { rows } = await this.db.query<Booking>(
      `SELECT ${BOOKING_SUMMARY_COLUMNS} FROM booking ORDER BY booked_at DESC`,
    );
    return rows;
  }

  async findOne(id: string): Promise<Booking> {
    const { rows } = await this.db.query<Booking>(
      'SELECT * FROM booking WHERE id = $1',
      [id],
    );
    if (!rows.length) throw new NotFoundException(`Booking ${id} not found`);
    return rows[0];
  }

  async findByEvent(eventId: string): Promise<Booking[]> {
    const { rows } = await this.db.query<Booking>(
      `SELECT ${BOOKING_SUMMARY_COLUMNS} FROM booking WHERE event_id = $1 ORDER BY booked_at DESC`,
      [eventId],
    );
    return rows;
  }

  async create(dto: CreateBookingDto): Promise<Booking> {
    return this.db.transaction(async (client) => {
      const eventResult = await client.query<{
        id: string;
        venue_id: string;
        capacity: number;
        status: string;
        started_at: Date;
        sport_type: string;
        address: string;
      }>(
        `SELECT e.id, e.venue_id, e.capacity, e.status, e.started_at,
                v.sport_type, v.address
           FROM events e
           JOIN venue v ON v.id = e.venue_id
          WHERE e.id = $1
          FOR UPDATE OF e`,
        [dto.event_id],
      );
      if (!eventResult.rows.length) {
        throw new BadRequestException(`Event ${dto.event_id} does not exist`);
      }

      const event = eventResult.rows[0];
      if (event.status !== 'Available' || new Date(event.started_at) <= new Date()) {
        throw new ConflictException('This slot is no longer available. Choose another time.');
      }

      const bookedResult = await client.query<{ seats: string }>(
        `SELECT COALESCE(SUM(seats), 0)::text AS seats
           FROM booking
          WHERE event_id = $1 AND status <> 'Cancelled'`,
        [dto.event_id],
      );
      if (Number(bookedResult.rows[0].seats) + dto.seats > event.capacity) {
        throw new ConflictException('Not enough seats remain in this slot.');
      }

      const normalizedEmail = dto.customer_email.trim().toLowerCase();
      let monthlyFee = 0;
      let joiningFee = 0;
      if (event.sport_type === 'Gym') {
        if (dto.seats !== 1) {
          throw new BadRequestException('Gym memberships are booked one person at a time.');
        }
        await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
          `${normalizedEmail}:${event.venue_id}`,
        ]);
        const quote = await this.membershipQuote(
          normalizedEmail,
          event.venue_id,
          event.address,
        );
        if (quote.pending) {
          throw new ConflictException('Complete your pending gym membership payment first.');
        }
        monthlyFee = quote.monthly_fee;
        joiningFee = quote.joining_fee;
      }

      const { rows } = await client.query<Booking>(
        `INSERT INTO booking
           (event_id, customer_name, customer_email, customer_phone, seats, status,
            membership_monthly_fee, membership_joining_fee)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING *`,
        [
          dto.event_id,
          dto.customer_name,
          normalizedEmail,
          dto.customer_phone,
          dto.seats,
          dto.status ?? 'Pending',
          monthlyFee,
          joiningFee,
        ],
      );

      if (event.sport_type === 'Gym' && monthlyFee > 0) {
        await client.query(
          `INSERT INTO gym_membership
             (customer_email, venue_id, booking_id, monthly_fee, joining_fee)
           VALUES ($1,$2,$3,$4,$5)`,
          [normalizedEmail, event.venue_id, rows[0].id, monthlyFee, joiningFee],
        );
      }

      return rows[0];
    });
  }

  async getMembershipQuote(email: string, venueId: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const venueResult = await this.db.query<{ sport_type: string; address: string }>(
      'SELECT sport_type, address FROM venue WHERE id = $1',
      [venueId],
    );
    if (!venueResult.rows.length) throw new NotFoundException(`Venue ${venueId} not found`);
    if (venueResult.rows[0].sport_type !== 'Gym') {
      throw new BadRequestException('Memberships are only available for gyms.');
    }

    return this.membershipQuote(
      normalizedEmail,
      venueId,
      venueResult.rows[0].address,
    );
  }

  private async membershipQuote(
    email: string,
    venueId: string,
    address: string,
  ) {
    const pendingResult = await this.db.query(
      `SELECT 1 FROM gym_membership
        WHERE LOWER(customer_email) = $1 AND venue_id = $2
          AND status = 'Pending'
          AND created_at > CURRENT_TIMESTAMP - INTERVAL '2 hours'
        LIMIT 1`,
      [email, venueId],
    );
    const activeResult = await this.db.query(
      `SELECT expires_at FROM gym_membership
        WHERE LOWER(customer_email) = $1 AND venue_id = $2
          AND status = 'Active' AND expires_at > CURRENT_TIMESTAMP
        ORDER BY expires_at DESC LIMIT 1`,
      [email, venueId],
    );
    const joinedResult = await this.db.query(
      `SELECT 1 FROM gym_membership
        WHERE LOWER(customer_email) = $1 AND venue_id = $2
          AND status = 'Active' LIMIT 1`,
      [email, venueId],
    );
    const active = activeResult.rows.length > 0;

    return {
      monthly_fee: active ? 0 : monthlyGymFee(address),
      joining_fee: active || joinedResult.rows.length ? 0 : GYM_JOINING_FEE,
      active,
      pending: pendingResult.rows.length > 0,
      expires_at: activeResult.rows[0]?.expires_at ?? null,
    };
  }

  async update(id: string, dto: UpdateBookingDto): Promise<Booking> {
    return this.db.transaction(async (client) => {
      const existing = await client.query<Booking>(
        'SELECT * FROM booking WHERE id = $1 FOR UPDATE',
        [id],
      );
      if (!existing.rows.length) throw new NotFoundException(`Booking ${id} not found`);

      const fields: string[] = [];
      const values: unknown[] = [];
      let idx = 1;
      const map: Record<string, unknown> = {
        customer_name: dto.customer_name,
        customer_email: dto.customer_email,
        customer_phone: dto.customer_phone,
        seats: dto.seats,
        status: dto.status,
        payment_method: dto.payment_method,
        payment_slip: dto.payment_slip,
      };

      for (const [column, value] of Object.entries(map)) {
        if (value !== undefined) {
          fields.push(`${column} = $${idx++}`);
          values.push(value);
        }
      }
      if (!fields.length) throw new BadRequestException('No fields to update');

      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      const { rows } = await client.query<Booking>(
        `UPDATE booking SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
        values,
      );

      if (dto.payment_method) {
        await client.query(
          `UPDATE gym_membership
              SET status = 'Active',
                  started_at = CURRENT_TIMESTAMP,
                  expires_at = CURRENT_TIMESTAMP + INTERVAL '1 month',
                  payment_method = $2
            WHERE booking_id = $1 AND status = 'Pending'`,
          [id, dto.payment_method],
        );
      }

      return rows[0];
    });
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    await this.findOne(id);
    await this.db.query('DELETE FROM booking WHERE id = $1', [id]);
    return { deleted: true };
  }
}
