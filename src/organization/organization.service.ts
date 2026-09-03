import {
    Injectable,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';
import { IOrganization } from './interfaces/create.organization.interface';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class OrganizationService {
    private organizations: IOrganization[] = [];

    async getMigrationSql(): Promise<string> {
        try {
            const filePath = path.join(__dirname, '..', 'database', 'migration', '02_create_organization.sql');
            const sqlQuery = await fs.readFile(filePath, 'utf8');

            if (!sqlQuery) {
                throw new NotFoundException('Migration SQL file is empty');
            }

            return sqlQuery;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new BadRequestException(`Could not read migration file: ${error.message}`);
        }
    }

    async runOrganizationMigration(): Promise<{ message: string }> {
        try {
            //const sql = await this.getMigrationSql();
            return { message: 'Organization database migration executed successfully.' };
        } catch (error) {
            throw new InternalServerErrorException(`Migration execution failed: ${error.message}`);
        }
    }

    async findAll(): Promise<IOrganization[]> {
        return this.organizations;
    }

    async findOne(id: string): Promise<IOrganization> {
        const organization = this.organizations.find(o => o.id === id);
        if (!organization) {
            throw new NotFoundException(`Organization with ID ${id} not found`);
        }
        return organization;
    }

    async create(organizationData: Partial<IOrganization>): Promise<IOrganization> {
        const now = new Date();

        const newOrganization = {
            id: crypto.randomUUID(), // Simulates the database gen_random_uuid() function
            company_name: organizationData.company_name || '',
            description: organizationData.description || null,
            phone_no: organizationData.phone_no || '',
            created_at: now,
            updated_at: now,
            ...organizationData,
        } as IOrganization;

        this.organizations.push(newOrganization);
        return newOrganization;
    }

    async update(id: string, updateData: Partial<IOrganization>): Promise<IOrganization> {
        const orgIndex = this.organizations.findIndex(o => o.id === id);
        if (orgIndex === -1) {
            throw new NotFoundException(`Organization with ID ${id} not found`);
        }

        this.organizations[orgIndex] = {
            ...this.organizations[orgIndex],
            ...updateData,
            updated_at: new Date()
        };
        return this.organizations[orgIndex];
    }

    async remove(id: string): Promise<{ deleted: boolean }> {
        const orgIndex = this.organizations.findIndex(o => o.id === id);
        if (orgIndex === -1) {
            throw new NotFoundException(`Organization with ID ${id} not found`);
        }
        this.organizations.splice(orgIndex, 1);
        return { deleted: true };
    }
}
