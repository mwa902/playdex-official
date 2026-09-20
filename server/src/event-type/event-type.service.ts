import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { EventType } from './interfaces/event-type.interface';
import { CreateEventTypeDto } from './dto/create-event-type.dto';
import { UpdateEventTypeDto } from './dto/update-event-type.dto';

@Injectable()
export class EventTypeService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(): Promise<EventType[]> {
    const { rows } = await this.db.query<EventType>(
      'SELECT * FROM event_type ORDER BY name ASC',
    );
    return rows;
  }

  async findOne(id: string): Promise<EventType> {
    const { rows } = await this.db.query<EventType>(
      'SELECT * FROM event_type WHERE id = $1',
      [id],
    );
    if (!rows.length) throw new NotFoundException(`Event type ${id} not found`);
    return rows[0];
  }

  async create(dto: CreateEventTypeDto): Promise<EventType> {
    const dup = await this.db.query(
      'SELECT 1 FROM event_type WHERE LOWER(name) = LOWER($1)',
      [dto.name],
    );
    if (dup.rows.length) {
      throw new ConflictException(`Event type "${dto.name}" already exists`);
    }

    const { rows } = await this.db.query<EventType>(
      `INSERT INTO event_type (name, description) VALUES ($1, $2) RETURNING *`,
      [dto.name, dto.description ?? null],
    );
    return rows[0];
  }

  async update(id: string, dto: UpdateEventTypeDto): Promise<EventType> {
    await this.findOne(id);

    const fields: string[] = [];
    const values: any[]    = [];
    let   idx = 1;

    if (dto.name !== undefined) {
      const dup = await this.db.query(
        'SELECT 1 FROM event_type WHERE LOWER(name) = LOWER($1) AND id <> $2',
        [dto.name, id],
      );
      if (dup.rows.length) throw new ConflictException(`Event type "${dto.name}" already exists`);
      fields.push(`name = $${idx++}`); values.push(dto.name);
    }
    if (dto.description !== undefined) { fields.push(`description = $${idx++}`); values.push(dto.description); }

    if (!fields.length) throw new BadRequestException('No fields to update');
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const { rows } = await this.db.query<EventType>(
      `UPDATE event_type SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    return rows[0];
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    await this.findOne(id);
    await this.db.query('DELETE FROM event_type WHERE id = $1', [id]);
    return { deleted: true };
  }
}
