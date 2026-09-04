import {
    Injectable,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
    ConflictException,
} from '@nestjs/common';
import { Venue } from './interfaces/venue.interface';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class VenueService {
    private venues: Venue[] = [];

    async getMigrationSql(): Promise<string> {
        try {
            const filePath = path.join(__dirname, '..', 'database', 'migration', 'create.venue.sql');
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

    async runVenueMigration(): Promise<{ message: string }> {
        try {
            const sql = await this.getMigrationSql();
            return { message: 'Venue database migration executed successfully.' };
        } catch (error) {
            throw new InternalServerErrorException(`Migration execution failed: ${error.message}`);
        }
    }

    async findAll(): Promise<Venue[]> {
        return this.venues;
    }

    async findOne(id: string): Promise<Venue> {
        const venue = this.venues.find(v => v.id === id);
        if (!venue) {
            throw new NotFoundException(`Venue with ID ${id} not found`);
        }
        return venue;
    }

    async create(venueData: Partial<Venue>): Promise<Venue> {
        if (!venueData.organization_id || !venueData.name || !venueData.address || venueData.capacity === undefined) {
            throw new BadRequestException('Missing required fields: organization_id, name, address, or capacity.');
        }

        const isDuplicate = this.venues.some(
            v => v.name === venueData.name || v.address === venueData.address,
        );
        if (isDuplicate) {
            throw new ConflictException('A venue with this name or address already exists.');
        }

        const now = new Date();
        const newVenue: Venue = {
            id: crypto.randomUUID(),
            organization_id: venueData.organization_id,
            name: venueData.name,
            description: venueData.description || null,
            address: venueData.address,
            city: venueData.city || 'Lahore',
            capacity: venueData.capacity,
            created_at: now,
            updated_at: now,
        };

        this.venues.push(newVenue);
        return newVenue;
    }

    async update(id: string, updateData: Partial<Venue>): Promise<Venue> {
        const venueIndex = this.venues.findIndex(v => v.id === id);
        if (venueIndex === -1) {
            throw new NotFoundException(`Venue with ID ${id} not found`);
        }

        if (updateData.name || updateData.address) {
            const isDuplicate = this.venues.some(
                v => v.id !== id && (v.name === updateData.name || v.address === updateData.address),
            );
            if (isDuplicate) {
                throw new ConflictException('Another venue already uses this name or address.');
            }
        }

        this.venues[venueIndex] = {
            ...this.venues[venueIndex],
            ...updateData,
            updated_at: new Date(),
        };

        return this.venues[venueIndex];
    }

    async remove(id: string): Promise<{ deleted: boolean }> {
        const venueIndex = this.venues.findIndex(v => v.id === id);
        if (venueIndex === -1) {
            throw new NotFoundException(`Venue with ID ${id} not found`);
        }

        this.venues.splice(venueIndex, 1);
        return { deleted: true };
    }
}
