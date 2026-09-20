import { IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEventDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID('4') organization_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID('4') venue_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID('4') event_type_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(150) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() started_at?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() ended_at?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) capacity?: number;
  @ApiPropertyOptional() @IsOptional() @IsEnum(['Available', 'Not-Available']) status?: 'Available' | 'Not-Available';
}
