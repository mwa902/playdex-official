import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Organization } from './interfaces/organization.interface';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(): Promise<Organization[]> {
    const { rows } = await this.db.query<Organization>(
      'SELECT * FROM organization ORDER BY created_at DESC',
    );
    return rows;
  }

  async findOne(id: string): Promise<Organization> {
    const { rows } = await this.db.query<Organization>(
      'SELECT * FROM organization WHERE id = $1',
      [id],
    );
    if (!rows.length) throw new NotFoundException(`Organization ${id} not found`);
    return rows[0];
  }

  async create(dto: CreateOrganizationDto): Promise<Organization> {
    const dup = await this.db.query(
      'SELECT 1 FROM organization WHERE company_name = $1',
      [dto.company_name],
    );
    if (dup.rows.length) {
      throw new ConflictException(`Organization "${dto.company_name}" already exists`);
    }

    const { rows } = await this.db.query<Organization>(
      `INSERT INTO organization (company_name, description, phone_no)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [dto.company_name, dto.description ?? null, dto.phone_no],
    );
    return rows[0];
  }

  async update(id: string, dto: UpdateOrganizationDto): Promise<Organization> {
    await this.findOne(id);

    const fields: string[] = [];
    const values: any[]    = [];
    let   idx = 1;

    if (dto.company_name !== undefined) { fields.push(`company_name = $${idx++}`); values.push(dto.company_name); }
    if (dto.description  !== undefined) { fields.push(`description  = $${idx++}`); values.push(dto.description); }
    if (dto.phone_no     !== undefined) { fields.push(`phone_no     = $${idx++}`); values.push(dto.phone_no); }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const { rows } = await this.db.query<Organization>(
      `UPDATE organization SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    return rows[0];
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    await this.findOne(id);
    await this.db.query('DELETE FROM organization WHERE id = $1', [id]);
    return { deleted: true };
  }
}
