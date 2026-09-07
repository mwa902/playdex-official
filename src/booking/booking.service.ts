import {
    Injectable,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { Booking } from './interfaces/booking.interface'

@Injectable()
export class BookingService {
    private bookings: Booking[] = [];

    async getMigrationSql(): Promise<string> {
        try {
            const filePath = path.join(__dirname, '..', 'database', 'migration', 'createbooking.sql');
            const sqlQuery = await fs.readFile(filePath, 'utf8');

            if (!sqlQuery || sqlQuery.trim().length === 0) {
                throw new NotFoundException('Booking migration SQL file is empty');
            }

            return sqlQuery;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            // Catches file system errors (e.g., ENOENT: file not found)
            throw new BadRequestException(`Could not read booking migration file: ${error.message}`);
        }
    }

    async runBookingMigration(): Promise<{ message: string }> {
        try {
            const sql = await this.getMigrationSql();
            return { message: 'Booking database table and ENUM types created successfully.' };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException(`Booking migration execution failed: ${error.message}`);
        }
    }

    async findAll(): Promise<Booking[]> {
        try {
            return this.bookings;
        } catch (error) {
            throw new InternalServerErrorException(`Failed to retrieve bookings: ${error.message}`);
        }
    }

    async findOne(id: string): Promise<Booking> {
        if (!id || id.trim().length !== 36) {
            throw new BadRequestException(`Provided ID "${id}" is not a valid UUID format`);
        }

        const booking = this.bookings.find(b => b.id === id);
        if (!booking) {
            throw new NotFoundException(`Booking with ID ${id} not found`);
        }
        return booking;
    }

    async create(
        bookingData: Omit<Booking, 'id' | 'status' | 'booked_at' | 'created_at' | 'updated_at'> & Partial<Pick<Booking, 'status'>>
    ): Promise<Booking> {
        try {
            if (!bookingData.seats || bookingData.seats <= 0) {
                throw new BadRequestException('Seats count must be an integer greater than 0');
            }

            const now = new Date();
            const newBooking: Booking = {
                id: randomUUID(),
                ...bookingData,
                status: bookingData.status || 'Pending',
                booked_at: now,
                created_at: now,
                updated_at: now,
            };

            this.bookings.push(newBooking);
            return newBooking;
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(`Could not process booking reservation: ${error.message}`);
        }
    }

    async update(id: string, updateData: Partial<Omit<Booking, 'id' | 'created_at'>>): Promise<Booking> {
        const bookingIndex = this.bookings.findIndex(b => b.id === id);
        if (bookingIndex === -1) {
            throw new NotFoundException(`Booking with ID ${id} not found to perform update`);
        }

        if (updateData.seats !== undefined && updateData.seats <= 0) {
            throw new BadRequestException('Cannot update booking. Seats count must be greater than 0');
        }

        try {
            this.bookings[bookingIndex] = {
                ...this.bookings[bookingIndex],
                ...updateData,
                updated_at: new Date(),
            };

            return this.bookings[bookingIndex];
        } catch (error) {
            throw new InternalServerErrorException(`Failed to modify booking configuration: ${error.message}`);
        }
    }

    async remove(id: string): Promise<{ deleted: boolean }> {
        const bookingIndex = this.bookings.findIndex(b => b.id === id);
        if (bookingIndex === -1) {
            throw new NotFoundException(`Booking with ID ${id} not found to delete`);
        }
        try {
            this.bookings.splice(bookingIndex, 1);
            return { deleted: true };
        } catch (error) {
            throw new InternalServerErrorException(`An unexpected tracking error dropped the cancellation payload: ${error.message}`);
        }
    }
}
