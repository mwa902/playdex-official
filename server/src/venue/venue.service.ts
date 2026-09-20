import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Venue } from './interfaces/venue.interface';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';

@Injectable()
export class VenueService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(): Promise<Venue[]> {
    const { rows } = await this.db.query<Venue>(
      'SELECT * FROM venue ORDER BY created_at DESC',
    );
    return rows;
  }

  async findOne(id: string): Promise<Venue> {
    const { rows } = await this.db.query<Venue>(
      'SELECT * FROM venue WHERE id = $1',
      [id],
    );
    if (!rows.length) throw new NotFoundException(`Venue ${id} not found`);
    return rows[0];
  }

  async create(dto: CreateVenueDto): Promise<Venue> {
    const dup = await this.db.query(
      'SELECT 1 FROM venue WHERE name = $1 OR address = $2',
      [dto.name, dto.address],
    );
    if (dup.rows.length) {
      throw new ConflictException('A venue with this name or address already exists');
    }

    const { rows } = await this.db.query<Venue>(
      `INSERT INTO venue (organization_id, name, description, address, city, capacity)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        dto.organization_id,
        dto.name,
        dto.description ?? null,
        dto.address,
        dto.city || 'Lahore',
        dto.capacity,
      ],
    );
    return rows[0];
  }

  async update(id: string, dto: UpdateVenueDto): Promise<Venue> {
    await this.findOne(id);

    if (dto.name || dto.address) {
      const dup = await this.db.query(
        'SELECT 1 FROM venue WHERE (name = $1 OR address = $2) AND id <> $3',
        [dto.name ?? '', dto.address ?? '', id],
      );
      if (dup.rows.length) {
        throw new ConflictException('Another venue already uses this name or address');
      }
    }

    const fields: string[] = [];
    const values: any[]    = [];
    let   idx = 1;

    if (dto.organization_id !== undefined) { fields.push(`organization_id = $${idx++}`); values.push(dto.organization_id); }
    if (dto.name            !== undefined) { fields.push(`name            = $${idx++}`); values.push(dto.name); }
    if (dto.description     !== undefined) { fields.push(`description     = $${idx++}`); values.push(dto.description); }
    if (dto.address         !== undefined) { fields.push(`address         = $${idx++}`); values.push(dto.address); }
    if (dto.city            !== undefined) { fields.push(`city            = $${idx++}`); values.push(dto.city); }
    if (dto.capacity        !== undefined) { fields.push(`capacity        = $${idx++}`); values.push(dto.capacity); }

    if (!fields.length) throw new BadRequestException('No fields to update');

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const { rows } = await this.db.query<Venue>(
      `UPDATE venue SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    return rows[0];
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    await this.findOne(id);
    await this.db.query('DELETE FROM venue WHERE id = $1', [id]);
    return { deleted: true };
  }
}
