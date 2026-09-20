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
}
