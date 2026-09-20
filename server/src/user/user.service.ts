import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService implements OnModuleInit {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly db: DatabaseService) {}

  /** Seed superadmin account once on startup if no users exist */
  async onModuleInit(): Promise<void> {
    try {
      const { rows } = await this.db.query<{ count: string }>(
        'SELECT COUNT(*)::text AS count FROM users',
      );
      if (parseInt(rows[0].count, 10) === 0) {
        const email    = process.env.SUPERADMIN_EMAIL    || 'superadmin@playdex.io';
        const password = process.env.SUPERADMIN_PASSWORD || 'SuperAdmin@2024';
        const name     = process.env.SUPERADMIN_NAME     || 'Super Admin';
        const hash     = await bcrypt.hash(password, 10);

        await this.db.query(
          `INSERT INTO users (name, email, password, role, is_active)
           VALUES ($1, $2, $3, 'superadmin', 'Active')
           ON CONFLICT (email) DO NOTHING`,
          [name, email, hash],
        );
        this.logger.log(`Superadmin seeded: ${email}`);
      }
    } catch (err) {
      this.logger.error('Superadmin seeding failed', err);
    }
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const { rows } = await this.db.query<Omit<User, 'password'>>(
      'SELECT id, name, email, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC',
    );
    return rows;
  }

  async findOne(id: string): Promise<Omit<User, 'password'>> {
    const { rows } = await this.db.query<Omit<User, 'password'>>(
      'SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE id = $1',
      [id],
    );
    if (!rows.length) throw new NotFoundException(`User ${id} not found`);
    return rows[0];
  }

  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await this.db.query<User>(
      'SELECT * FROM users WHERE email = $1',
      [email],
    );
    return rows[0] ?? null;
  }

  async create(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const exists = await this.findByEmail(dto.email);
    if (exists) throw new ConflictException(`Email ${dto.email} is already registered`);

    const hash = await bcrypt.hash(dto.password, 10);
    const role = dto.role || 'user';

    const { rows } = await this.db.query<Omit<User, 'password'>>(
      `INSERT INTO users (name, email, password, role, is_active)
       VALUES ($1, $2, $3, $4, 'Active')
       RETURNING id, name, email, role, is_active, created_at, updated_at`,
      [dto.name, dto.email, hash, role],
    );
    return rows[0];
  }

  async update(id: string, dto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    await this.findOne(id); // throws 404 if missing

    const fields: string[] = [];
    const values: any[]    = [];
    let   idx = 1;

    if (dto.name)      { fields.push(`name = $${idx++}`);       values.push(dto.name); }
    if (dto.email)     { fields.push(`email = $${idx++}`);      values.push(dto.email); }
    if (dto.password)  { fields.push(`password = $${idx++}`);   values.push(await bcrypt.hash(dto.password, 10)); }
    if (dto.role)      { fields.push(`role = $${idx++}`);       values.push(dto.role); }
    if (dto.is_active) { fields.push(`is_active = $${idx++}`);  values.push(dto.is_active); }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const { rows } = await this.db.query<Omit<User, 'password'>>(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING id, name, email, role, is_active, created_at, updated_at`,
      values,
    );
    return rows[0];
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    await this.findOne(id);
    await this.db.query('DELETE FROM users WHERE id = $1', [id]);
    return { deleted: true };
  }

  /** Used by login — returns user with hashed password for bcrypt compare */
  async validateCredentials(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;
    const match = await bcrypt.compare(password, user.password);
    if (!match) return null;
    const { password: _p, ...safe } = user;
    return safe;
  }
}
