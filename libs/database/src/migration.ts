import { Pool } from 'pg';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export class Migration {
    private readonly logger = new Logger(Migration.name);
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async runMigrations() {
        this.logger.log('Starting file-based database migrations...');

        await this.pool.query(`
                    CREATE TABLE IF NOT EXISTS schema_migrations (
                        id SERIAL PRIMARY KEY,
                        version VARCHAR(255) UNIQUE NOT NULL,
                        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                `);

        const migrationsDir = path.join(process.cwd(), 'libs', 'database', 'migrations');

        if (!fs.existsSync(migrationsDir)) {
            this.logger.error(`Migrations directory not found at: ${migrationsDir}`);
            throw new Error('Migrations directory missing');
        }

        const sqlFiles = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();

        for (const file of sqlFiles) {
            const alreadyRun = await this.pool.query(
                'SELECT 1 FROM schema_migrations WHERE version = $1',
                [file]
            );

            if (alreadyRun.rows.length === 0) {
                this.logger.log(`Applying migration file not yet executed: ${file}`);

                const filePath = path.join(migrationsDir, file);
                const sqlContent = fs.readFileSync(filePath, 'utf8');
                const client = await this.pool.connect();

                try {
                    await client.query('BEGIN');
                    await client.query(sqlContent);
                    await client.query(
                        'INSERT INTO schema_migrations (version) VALUES ($1)',
                        [file]
                    );
                    await client.query('COMMIT');
                    this.logger.log(`Successfully applied migration file: ${file}`);
                } catch (error) {
                    await client.query('ROLLBACK');
                    this.logger.error(`Failed to apply migration file: ${file}`, error);
                    throw error;
                } finally {
                    client.release();
                }
            } else {
                this.logger.verbose(`Migration file ${file} already applied. Skipping.`);
            }
        }
        this.logger.log('All file-based migrations checked and completed.');
    }
}
