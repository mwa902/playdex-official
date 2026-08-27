import {Pool} from "pg";
import {DatabaseService} from "@app/database/database.service";
import {Logger} from "@nestjs/common";


export  class Migration {
        private readonly logger = new Logger("Migration");

        async runMigration(pool: Pool): Promise<void> {

        }
}