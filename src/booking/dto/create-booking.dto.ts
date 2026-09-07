import {
    IsNotEmpty,
    IsString,
    IsUUID,
    IsInt,
    Min,
    IsEmail,
    IsPhoneNumber,
    IsEnum,
    IsOptional
} from 'class-validator';
import { Type } from 'class-transformer';

export enum BookingStatus {
    PENDING = 'Pending',
    CONFIRM_BOOKING = 'Confirm Booking',
    CANCELLED = 'Cancelled',
}

export class CreateBookingDto {
    @IsNotEmpty()
    @IsUUID('4', { message: 'event_id must be a valid UUID v4' })
    event_id: string;

    @IsNotEmpty()
    @IsString()
    customer_name: string;

    @IsNotEmpty()
    @IsEmail({}, { message: 'customer_email must be a valid email address' })
    customer_email: string;

    @IsNotEmpty()
    @IsString()
    @IsPhoneNumber(undefined, { message: 'customer_phone must be a valid international phone number' })
    customer_phone: string;

    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    @Min(1, { message: 'seats must be at least 1' })
    seats: number;

    @IsOptional()
    @IsEnum(BookingStatus, { message: 'status must be: Pending, Confirm Booking, or Cancelled' })
    status?: 'Pending' | 'Confirm Booking' | 'Cancelled';
}
