import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Booking } from './interfaces/booking.interface';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(): Promise<Booking[]> {
    const { rows } = await this.db.query<Booking>(
      'SELECT * FROM booking ORDER BY booked_at DESC',
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
      'SELECT * FROM booking WHERE event_id = $1 ORDER BY booked_at DESC',
      [eventId],
    );
    return rows;
  }

  async create(dto: CreateBookingDto): Promise<Booking> {
    // Verify event exists
    const ev = await this.db.query(
      'SELECT capacity FROM events WHERE id = $1',
      [dto.event_id],
    );
    if (!ev.rows.length) {
      throw new BadRequestException(`Event ${dto.event_id} does not exist`);
    }

    const { rows } = await this.db.query<Booking>(
      `INSERT INTO booking
         (event_id, customer_name, customer_email, customer_phone, seats, status)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [
        dto.event_id,
        dto.customer_name,
        dto.customer_email,
        dto.customer_phone,
        dto.seats,
        dto.status ?? 'Pending',
      ],
    );
    return rows[0];
  }

  async update(id: string, dto: UpdateBookingDto): Promise<Booking> {
    await this.findOne(id);

    const fields: string[] = [];
    const values: any[]    = [];
    let   idx = 1;

    const map: Record<string, any> = {
      customer_name:  dto.customer_name,
      customer_email: dto.customer_email,
      customer_phone: dto.customer_phone,
      seats:          dto.seats,
      status:         dto.status,
    };

    for (const [col, val] of Object.entries(map)) {
      if (val !== undefined) {
        fields.push(`${col} = $${idx++}`);
        values.push(val);
      }
    }

    if (!fields.length) throw new BadRequestException('No fields to update');
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const { rows } = await this.db.query<Booking>(
      `UPDATE booking SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    return rows[0];
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    await this.findOne(id);
    await this.db.query('DELETE FROM booking WHERE id = $1', [id]);
    return { deleted: true };
  }
}
