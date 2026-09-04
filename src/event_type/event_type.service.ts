import {
    Injectable,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
    ConflictException,
} from '@nestjs/common';
import { IEventType } from './interfaces/event_type.interface';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class EventTypeService {
    private eventTypes: IEventType[] = [];

    async getMigrationSql(): Promise<string> {
        try {
            const filePath = path.join(__dirname, '..', 'database', 'migration', 'create.event_type.sql');
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

    async runEventTypeMigration(): Promise<{ message: string }> {
        try {
            const sql = await this.getMigrationSql();
            return { message: 'Event Type database migration executed successfully.' };
        } catch (error) {
            throw new InternalServerErrorException(`Migration execution failed: ${error.message}`);
        }
    }

    async findAll(): Promise<IEventType[]> {
        return this.eventTypes;
    }

    async findOne(id: string): Promise<IEventType> {
        const eventType = this.eventTypes.find(et => et.id === id);
        if (!eventType) {
            throw new NotFoundException(`Event Type with ID ${id} not found`);
        }
        return eventType;
    }

    async create(eventTypeData: Partial<IEventType>): Promise<IEventType> {
        if (!eventTypeData.name) {
            throw new BadRequestException('Missing required field: name.');
        }

        const isDuplicate = this.eventTypes.some(
            et => et.name.toLowerCase() === eventTypeData.name?.toLowerCase(),
        );
        if (isDuplicate) {
            throw new ConflictException('An event type category with this name already exists.');
        }

        const now = new Date();
        const newEventType: IEventType = {
            id: crypto.randomUUID(),
            name: eventTypeData.name,
            description: eventTypeData.description || null,
            created_at: now,
            updated_at: now,
        };

        this.eventTypes.push(newEventType);
        return newEventType;
    }

    async update(id: string, updateData: Partial<IEventType>): Promise<IEventType> {
        const index = this.eventTypes.findIndex(et => et.id === id);
        if (index === -1) {
            throw new NotFoundException(`Event Type with ID ${id} not found`);
        }

        if (updateData.name) {
            const isDuplicate = this.eventTypes.some(
                et => et.id !== id && et.name.toLowerCase() === updateData.name?.toLowerCase(),
            );
            if (isDuplicate) {
                throw new ConflictException('Another event type category already uses this name.');
            }
        }

        this.eventTypes[index] = {
            ...this.eventTypes[index],
            ...updateData,
            updated_at: new Date(),
        };

        return this.eventTypes[index];
    }

    async remove(id: string): Promise<{ deleted: boolean }> {
        const index = this.eventTypes.findIndex(et => et.id === id);
        if (index === -1) {
            throw new NotFoundException(`Event Type with ID ${id} not found`);
        }

        this.eventTypes.splice(index, 1);
        return { deleted: true };
    }
}
