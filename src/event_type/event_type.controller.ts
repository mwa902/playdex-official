import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    NotFoundException,
    BadRequestException,
    ConflictException,
    InternalServerErrorException,
} from '@nestjs/common';
import { EventTypeService } from './event_type.service';
import { IEventType } from './interfaces/event_type.interface';

@Controller('event-types')
export class EventTypeController {
    constructor(private readonly eventTypeService: EventTypeService) {}

    @Post('migration')
    async runMigration(): Promise<{ message: string }> {
        try {
            return await this.eventTypeService.runEventTypeMigration();
        } catch (error) {
            if (error instanceof InternalServerErrorException) throw error;
            throw new InternalServerErrorException(`Migration execution failed: ${error.message}`);
        }
    }

    @Get('migration/sql')
    async getMigrationSql(): Promise<string> {
        try {
            return await this.eventTypeService.getMigrationSql();
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(`Failed to retrieve SQL: ${error.message}`);
        }
    }

    @Get()
    async findAll(): Promise<IEventType[]> {
        try {
            return await this.eventTypeService.findAll();
        } catch (error) {
            throw new InternalServerErrorException(`Failed to retrieve event types: ${error.message}`);
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<IEventType> {
        try {
            return await this.eventTypeService.findOne(id);
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException(`Error fetching event type: ${error.message}`);
        }
    }

    @Post()
    async create(@Body() eventTypeData: Partial<IEventType>): Promise<IEventType> {
        try {
            return await this.eventTypeService.create(eventTypeData);
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof ConflictException) throw error;
            throw new InternalServerErrorException(`Failed to create event type: ${error.message}`);
        }
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateData: Partial<IEventType>,
    ): Promise<IEventType> {
        try {
            return await this.eventTypeService.update(id, updateData);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException) throw error;
            throw new InternalServerErrorException(`Failed to update event type: ${error.message}`);
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
        try {
            return await this.eventTypeService.remove(id);
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException(`Failed to delete event type: ${error.message}`);
        }
    }
}
