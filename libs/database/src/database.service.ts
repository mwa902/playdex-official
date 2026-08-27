import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { Pool } from "pg";
import { Migration } from "./migration";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(DatabaseService.name);
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            connectionString: process.env.DB_URL,
            idleTimeoutMillis: 3000,
            max: 20,
            connectionTimeoutMillis: 3000,
        });
    }

    async onModuleInit() {
        this.logger.log("Initializing database module...");

        const result = await this.pool.connect();
        try {
            const migrationRunner = new Migration(this.pool);
            await migrationRunner.runMigrations();
        } catch (err) {
            this.logger.error("Database starting failed", err);
        } finally {
            result.release();
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
