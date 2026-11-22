import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Event } from './interfaces/event.interface';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(): Promise<Event[]> {
    const { rows } = await this.db.query<Event>(
      'SELECT * FROM events ORDER BY started_at ASC',
    );
    return rows;
  }

  async findVenueSchedule(venueId: string): Promise<Event[]> {
    const venueResult = await this.db.query<{
      id: string;
      sport_type: string;
    }>('SELECT id, sport_type FROM venue WHERE id = $1', [venueId]);
    if (!venueResult.rows.length) {
      throw new NotFoundException(`Venue ${venueId} not found`);
    }

    const venue = venueResult.rows[0];
    if (venue.sport_type === 'Arena' || venue.sport_type === 'Gym') {
      await this.db.query(
        `INSERT INTO events
           (organization_id, venue_id, event_type_id, name, description,
            started_at, ended_at, capacity, status, price, schedule_key)
         SELECT v.organization_id, v.id, et.id,
                CASE
                  WHEN slots.started_at::time < TIME '12:00' THEN 'Morning '
                  WHEN slots.started_at::time < TIME '17:00' THEN 'Afternoon '
                  ELSE 'Evening '
                END || et.name || ' — ' || v.name,
                'Hourly booking slot',
                slots.started_at, slots.started_at + INTERVAL '1 hour',
                v.capacity, 'Available',
                CASE WHEN v.sport_type = 'Gym' THEN NULL ELSE 2500 END,
                v.id::text || ':' || TO_CHAR(slots.started_at, 'YYYYMMDDHH24')
           FROM venue v
           JOIN event_type et ON et.name = CASE
             WHEN v.sport_type = 'Gym' THEN 'Gym Session'
             ELSE 'Multi-Sport'
           END
           CROSS JOIN LATERAL (
             SELECT ((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Karachi')::date + day_offset)
                      + TIME '08:00' + hour_offset * INTERVAL '1 hour' AS started_at
               FROM GENERATE_SERIES(0, 29) AS day_offset
               CROSS JOIN GENERATE_SERIES(0, 13) AS hour_offset
           ) slots
          WHERE v.id = $1
            AND slots.started_at > CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Karachi'
         ON CONFLICT (schedule_key) WHERE schedule_key IS NOT NULL DO NOTHING`,
        [venueId],
      );
    }

    const { rows } = await this.db.query<Event>(
      'SELECT * FROM events WHERE venue_id = $1 ORDER BY started_at ASC',
      [venueId],
    );
    return rows;
  }

  async findOne(id: string): Promise<Event> {
    const { rows } = await this.db.query<Event>(
      'SELECT * FROM events WHERE id = $1',
      [id],
    );
    if (!rows.length) throw new NotFoundException(`Event ${id} not found`);
    return rows[0];
  }

  async create(dto: CreateEventDto): Promise<Event> {
    const start = new Date(dto.started_at);
    const end   = new Date(dto.ended_at);
    if (end <= start) {
      throw new BadRequestException('ended_at must be after started_at');
    }

    const { rows } = await this.db.query<Event>(
      `INSERT INTO events
         (organization_id, venue_id, event_type_id, name, description,
          started_at, ended_at, capacity, status, price)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        dto.organization_id,
        dto.venue_id,
        dto.event_type_id,
        dto.name,
        dto.description ?? '',
        dto.started_at,
        dto.ended_at,
        dto.capacity,
        dto.status ?? 'Available',
        dto.price ?? null,
      ],
    );
    return rows[0];
  }

  async update(id: string, dto: UpdateEventDto): Promise<Event> {
    const existing = await this.findOne(id);

    const start = dto.started_at ? new Date(dto.started_at) : existing.started_at;
    const end   = dto.ended_at   ? new Date(dto.ended_at)   : existing.ended_at;
    if (end <= start) {
      throw new BadRequestException('ended_at must be after started_at');
    }

    const fields: string[] = [];
    const values: any[]    = [];
    let   idx = 1;

    const map: Record<string, any> = {
      organization_id: dto.organization_id,
      venue_id:        dto.venue_id,
      event_type_id:   dto.event_type_id,
      name:            dto.name,
      description:     dto.description,
      started_at:      dto.started_at,
      ended_at:        dto.ended_at,
      capacity:        dto.capacity,
      status:          dto.status,
      price:           dto.price,
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

    const { rows } = await this.db.query<Event>(
      `UPDATE events SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    return rows[0];
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    await this.findOne(id);
    await this.db.query('DELETE FROM events WHERE id = $1', [id]);
    return { deleted: true };
  }
}
