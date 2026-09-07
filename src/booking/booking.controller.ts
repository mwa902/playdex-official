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
import { BookingService } from './booking.service';
import { Booking } from "./interfaces/booking.interface";
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Controller('bookings')
export class BookingController {
    constructor(private readonly bookingService: BookingService) {}

    @Post('migration')
    @HttpCode(HttpStatus.OK)
    async runMigration() {
        return await this.bookingService.runBookingMigration();
    }

    @Get()
    async findAll(): Promise<Booking[]> {
        return await this.bookingService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Booking> {
        return await this.bookingService.findOne(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createBookingDto: CreateBookingDto): Promise<Booking> {
        return await this.bookingService.create(createBookingDto);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateBookingDto: UpdateBookingDto,
    ): Promise<Booking> {
        return await this.bookingService.update(id, updateBookingDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
        return await this.bookingService.remove(id);
    }
}
