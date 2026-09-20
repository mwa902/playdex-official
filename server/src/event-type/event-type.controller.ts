import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Post, Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EventTypeService } from './event-type.service';
import { CreateEventTypeDto } from './dto/create-event-type.dto';
import { UpdateEventTypeDto } from './dto/update-event-type.dto';

@ApiTags('Event Types')
@Controller('event-types')
export class EventTypeController {
  constructor(private readonly service: EventTypeService) {}

  @Get()
  @ApiOperation({ summary: 'List all event types' })
  findAll() { return this.service.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get event type by ID' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create event type' })
  create(@Body() dto: CreateEventTypeDto) { return this.service.create(dto); }

  @Put(':id')
  @ApiOperation({ summary: 'Update event type' })
  update(@Param('id') id: string, @Body() dto: UpdateEventTypeDto) { return this.service.update(id, dto); }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete event type' })
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
