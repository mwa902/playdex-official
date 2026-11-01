import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { Pool, PoolClient } from "pg";
import { Migration } from "./migration";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(DatabaseService.name);
    private pool: Pool;

    constructor() {
        const connectionString = process.env.DATABASE_URL ||
            `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || 'postgres'}@localhost:5432/${process.env.POSTGRES_DB || 'playdex'}`;

        this.pool = new Pool({
            connectionString,
            idleTimeoutMillis: 3000,
            max: 7,
            connectionTimeoutMillis: 10000,
        });
    }
    async onModuleInit() {
        this.logger.log("Initializing database module...");
        let client: PoolClient | undefined;

        try {
            client = await this.pool.connect();
            this.logger.log("Connected to database successfully. Checking migrations...");
            const migrationRunner = new Migration(this.pool);
            await migrationRunner.runMigrations();

        } catch (err) {
            this.logger.error("Database starting failed", err);
        } finally {
            if (client) {
                client.release();
            }
        }
    }

    async query(text: string, params?: any[]) {
        return this.pool.query(text, params);
    }
    async onModuleDestroy() {
        this.logger.log('Draining active native database connections...');
        await this.pool.end();
    }
}
