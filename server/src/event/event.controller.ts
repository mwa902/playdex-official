import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Post, Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@ApiTags('Events')
@Controller('events')
export class EventController {
  constructor(private readonly service: EventService) {}

  @Get()
  @ApiOperation({ summary: 'List all events' })
  findAll() { return this.service.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create event' })
  create(@Body() dto: CreateEventDto) { return this.service.create(dto); }

  @Put(':id')
  @ApiOperation({ summary: 'Update event' })
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) { return this.service.update(id, dto); }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete event' })
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
