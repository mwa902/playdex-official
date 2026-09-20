import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventTypeDto {
  @ApiProperty({ example: 'Football' }) @IsString() @IsNotEmpty() @MaxLength(60) name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}
