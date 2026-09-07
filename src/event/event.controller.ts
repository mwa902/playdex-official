import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { EventService } from './event.service';
import { Event } from './interfaces/event-interfaces'
import { CreateEventDto } from './dto/createevent.interface.dto'


type UpdateEventDto = Partial<CreateEventDto>;

@Controller('events')
export class EventController {
    constructor(private readonly eventService: EventService) {}

    @Post('migration')
    @HttpCode(HttpStatus.OK)
    async runMigration() {
        return await this.eventService.runEventMigration();
    }

    @Get()
    async findAll(): Promise<Event[]> {
        return await this.eventService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Event> {
        return await this.eventService.findOne(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createEventDto: CreateEventDto): Promise<Event> {
        return await this.eventService.create(createEventDto);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateEventDto: UpdateEventDto,
    ): Promise<Event> {
        return await this.eventService.update(id, updateEventDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
        return await this.eventService.remove(id);
    }
}
