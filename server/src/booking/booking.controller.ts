import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Post, Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingController {
  constructor(private readonly service: BookingService) {}

  @Get()
  @ApiOperation({ summary: 'List all bookings' })
  findAll() { return this.service.findAll(); }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'List bookings for a specific event' })
  findByEvent(@Param('eventId') eventId: string) { return this.service.findByEvent(eventId); }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create booking' })
  create(@Body() dto: CreateBookingDto) { return this.service.create(dto); }

  @Put(':id')
  @ApiOperation({ summary: 'Update booking' })
  update(@Param('id') id: string, @Body() dto: UpdateBookingDto) { return this.service.update(id, dto); }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete booking' })
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
