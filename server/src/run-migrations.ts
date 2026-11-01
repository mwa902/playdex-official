import { Pool } from 'pg';
import { Migration } from './database/migration';

async function runMigrations(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('Set DATABASE_URL before running production migrations.');
  }

  const pool = new Pool({ connectionString, max: 1 });
  try {
    await new Migration(pool).runMigrations();
  } finally {
    await pool.end();
  }
}

void runMigrations().catch((error: unknown) => {
  console.error('Database migrations failed.', error);
  process.exitCode = 1;
});