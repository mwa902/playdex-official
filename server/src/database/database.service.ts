import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Pool, PoolClient, QueryResult } from 'pg';
import { Migration } from './migration';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool;

  constructor() {
    const connectionString =
      process.env.DATABASE_URL ||
      `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || 'postgres'}@localhost:5432/${process.env.POSTGRES_DB || 'localdev'}`;

    this.pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    this.pool.on('error', (err) => {
      this.logger.error('Unexpected pg pool error', err);
    });
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('Connecting to PostgreSQL...');
    let client: PoolClient | undefined;
    try {
      client = await this.pool.connect();
      this.logger.log('PostgreSQL connected successfully.');
      const migrator = new Migration(this.pool);
      await migrator.runMigrations();
    } catch (err) {
      this.logger.error('Database initialisation failed', err);
      // Don't crash the app — let it start and handle query errors per-request
    } finally {
      client?.release();
    }
  }

  async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      this.logger.debug(`Query [${duration}ms]: ${text.slice(0, 80)}`);
      return result;
    } catch (err) {
      this.logger.error(`Query failed: ${text.slice(0, 120)}`, err);
      throw err;
    }
  }

  /** Run multiple queries inside a single transaction */
  async transaction<T>(
    fn: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Closing PostgreSQL pool...');
    await this.pool.end();
  }
}
