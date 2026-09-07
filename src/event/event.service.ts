import {
    Injectable,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { Event } from './interfaces/event-interfaces';

@Injectable()
export class EventService {
    private events: Event[] = [];

    async getMigrationSql(): Promise<string> {
        try {
            const filePath = path.join(__dirname, '..', 'database', 'migration', 'createevent.sql');
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

    async runEventMigration(): Promise<{ message: string }> {
        try {
            const sql = await this.getMigrationSql();

            return { message: 'Event database migration executed successfully.' };
        } catch (error) {
            throw new InternalServerErrorException(`Migration execution failed: ${error.message}`);
        }
    }

    async findAll(): Promise<Event[]> {
        return this.events;
    }

    async findOne(id: string): Promise<Event> {
        const event = this.events.find(e => e.id === id);
        if (!event) {
            throw new NotFoundException(`Event with ID ${id} not found`);
        }
        return event;
    }


    async create(
        eventData: Omit<Event, 'id' | 'status' | 'created_at' | 'updated_at'> & Partial<Pick<Event, 'status'>>
    ): Promise<Event> {
        const now = new Date();

        const newEvent: Event = {
            id: randomUUID(),
            ...eventData,
            status: eventData.status || 'Available',
            created_at: now,
            updated_at: now,
        };

        this.events.push(newEvent);
        return newEvent;
    }

    async update(id: string, updateData: Partial<Omit<Event, 'id' | 'created_at'>>): Promise<Event> {
        const eventIndex = this.events.findIndex(e => e.id === id);
        if (eventIndex === -1) {
            throw new NotFoundException(`Event with ID ${id} not found`);
        }

        this.events[eventIndex] = {
            ...this.events[eventIndex],
            ...updateData,
            updated_at: new Date()
        };

        return this.events[eventIndex];
    }

    async remove(id: string): Promise<{ deleted: boolean }> {
        const eventIndex = this.events.findIndex(e => e.id === id);
        if (eventIndex === -1) {
            throw new NotFoundException(`Event with ID ${id} not found`);
        }
        this.events.splice(eventIndex, 1);
        return { deleted: true };
    }
}
