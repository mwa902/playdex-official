import { Pool } from 'pg';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export class Migration {
  private readonly logger = new Logger(Migration.name);

  constructor(private readonly pool: Pool) {}

  async runMigrations(): Promise<void> {
    this.logger.log('Running database migrations...');

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id         SERIAL PRIMARY KEY,
        version    VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const migrationsDir = path.join(__dirname, 'migrations');

    if (!fs.existsSync(migrationsDir)) {
      this.logger.error(`Migrations directory not found: ${migrationsDir}`);
      throw new Error('Migrations directory missing');
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const already = await this.pool.query(
        'SELECT 1 FROM schema_migrations WHERE version = $1',
        [file],
      );

      if (already.rows.length > 0) {
        this.logger.verbose(`Skipping already-applied migration: ${file}`);
        continue;
      }

      this.logger.log(`Applying migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      const client = await this.pool.connect();

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (version) VALUES ($1)',
          [file],
        );
        await client.query('COMMIT');
        this.logger.log(`Migration applied: ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        this.logger.error(`Migration failed: ${file}`, err);
        throw err;
      } finally {
        client.release();
      }
    }

    this.logger.log('All migrations complete.');
  }
}
