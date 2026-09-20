import {
  IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional,
  IsString, IsUUID, MaxLength, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty() @IsUUID('4') @IsNotEmpty() event_id: string;

  @ApiProperty({ example: 'Ahmed Ali' })
  @IsString() @IsNotEmpty() @MaxLength(100) customer_name: string;

  @ApiProperty({ example: 'ahmed@example.com' })
  @IsEmail() @IsNotEmpty() customer_email: string;

  @ApiProperty({ example: '+923001234567' })
  @IsString() @IsNotEmpty() @MaxLength(20) customer_phone: string;

  @ApiProperty({ example: 2 })
  @IsNotEmpty() @Type(() => Number) @IsInt() @Min(1) seats: number;

  @ApiPropertyOptional({ enum: ['Pending', 'Confirm Booking', 'Cancelled'], default: 'Pending' })
  @IsOptional() @IsEnum(['Pending', 'Confirm Booking', 'Cancelled'])
  status?: 'Pending' | 'Confirm Booking' | 'Cancelled';
}
