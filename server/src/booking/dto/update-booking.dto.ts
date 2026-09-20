import { IsEmail, IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBookingDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) customer_name?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() customer_email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20) customer_phone?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) seats?: number;
  @ApiPropertyOptional() @IsOptional() @IsEnum(['Pending', 'Confirm Booking', 'Cancelled'])
  status?: 'Pending' | 'Confirm Booking' | 'Cancelled';
}
