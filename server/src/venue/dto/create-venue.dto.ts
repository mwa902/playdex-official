import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVenueDto {
  @ApiProperty() @IsUUID('4') @IsNotEmpty() organization_id: string;
  @ApiProperty({ example: 'Gulberg Sports Complex' }) @IsString() @IsNotEmpty() @MaxLength(100) name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty({ example: '12 Main Boulevard, Lahore' }) @IsString() @IsNotEmpty() address: string;
  @ApiPropertyOptional({ default: 'Lahore' }) @IsOptional() @IsString() @MaxLength(60) city?: string;
  @ApiProperty({ example: 500 }) @IsNotEmpty() @Type(() => Number) @IsInt() @Min(1) capacity: number;
  @ApiPropertyOptional({ example: 'Arena', description: 'Arena | Gym | Pool' }) @IsOptional() @IsString() @MaxLength(60) sport_type?: string;
  @ApiPropertyOptional({ example: '0317 9993993' }) @IsOptional() @IsString() @MaxLength(30) phone?: string;
  @ApiPropertyOptional({ example: 'https://maps.google.com/...' }) @IsOptional() @IsString() google_maps_url?: string;
}
