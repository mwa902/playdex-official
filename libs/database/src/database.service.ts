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

        const parsedUrl = connectionString.startsWith('postgresql://') || connectionString.startsWith('postgres://')
            ? new URL(connectionString)
            : undefined;

        this.pool = new Pool({
            connectionString: parsedUrl ? undefined : connectionString,
            host: parsedUrl?.hostname ?? process.env.DB_HOST ?? 'localhost',
            port: parsedUrl ? Number(parsedUrl.port || 5432) : (process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432),
            user: parsedUrl?.username ?? process.env.DB_USERNAME ?? process.env.POSTGRES_USER ?? 'postgres',
            database: parsedUrl?.pathname.replace(/^\//, '') || process.env.DB_DATABASE || process.env.POSTGRES_DB || 'playdex',
            password: parsedUrl?.password ?? process.env.DB_PASSWORD ?? process.env.POSTGRES_PASSWORD ?? 'postgres',
            idleTimeoutMillis: 3000,
            max: 7,
            connectionTimeoutMillis: 3000,
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
