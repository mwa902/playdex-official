import {
  IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional,
  IsString, IsUUID, MaxLength, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty() @IsUUID('4') @IsNotEmpty() organization_id: string;
  @ApiProperty() @IsUUID('4') @IsNotEmpty() venue_id: string;
  @ApiProperty() @IsUUID('4') @IsNotEmpty() event_type_id: string;

  @ApiProperty({ example: 'Summer Football League' })
  @IsString() @IsNotEmpty() @MaxLength(150) name: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() description?: string;

  @ApiProperty({ example: '2025-01-15T09:00:00Z' })
  @IsDateString() @IsNotEmpty() started_at: string;

  @ApiProperty({ example: '2025-01-15T18:00:00Z' })
  @IsDateString() @IsNotEmpty() ended_at: string;

  @ApiProperty({ example: 100 })
  @IsNotEmpty() @Type(() => Number) @IsInt() @Min(1) capacity: number;

  @ApiPropertyOptional({ enum: ['Available', 'Not-Available'], default: 'Available' })
  @IsOptional() @IsEnum(['Available', 'Not-Available']) status?: 'Available' | 'Not-Available';
}
