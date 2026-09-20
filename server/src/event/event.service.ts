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
          started_at, ended_at, capacity, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
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
