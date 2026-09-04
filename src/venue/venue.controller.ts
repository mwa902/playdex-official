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
import { VenueService } from './venue.service';
import { Venue } from './interfaces/venue.interface';

@Controller('venues')
export class VenueController {
    constructor(private readonly venueService: VenueService) {}

    @Post('migration')
    async runMigration(): Promise<{ message: string }> {
        try {
            return await this.venueService.runVenueMigration();
        } catch (error) {
            if (error instanceof InternalServerErrorException) throw error;
            throw new InternalServerErrorException(`Migration failed: ${error.message}`);
        }
    }

    @Get('migration/sql')
    async getMigrationSql(): Promise<string> {
        try {
            return await this.venueService.getMigrationSql();
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(`Failed to retrieve SQL: ${error.message}`);
        }
    }

    @Get()
    async findAll(): Promise<Venue[]> {
        try {
            return await this.venueService.findAll();
        } catch (error) {
            throw new InternalServerErrorException(`Failed to retrieve venues: ${error.message}`);
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Venue> {
        try {
            return await this.venueService.findOne(id);
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException(`Error fetching venue: ${error.message}`);
        }
    }

    @Post()
    async create(@Body() venueData: Partial<Venue>): Promise<Venue> {
        try {
            return await this.venueService.create(venueData);
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof ConflictException) throw error;
            throw new InternalServerErrorException(`Failed to create venue: ${error.message}`);
        }
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateData: Partial<Venue>,
    ): Promise<Venue> {
        try {
            return await this.venueService.update(id, updateData);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException) throw error;
            throw new InternalServerErrorException(`Failed to update venue: ${error.message}`);
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
        try {
            return await this.venueService.remove(id);
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException(`Failed to delete venue: ${error.message}`);
        }
    }
}
