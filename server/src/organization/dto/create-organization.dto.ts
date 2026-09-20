import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Lahore Sports Club' })
  @IsString() @IsNotEmpty() @MaxLength(60)
  company_name: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  description?: string;

  @ApiProperty({ example: '+92 300 0000000' })
  @IsString() @IsNotEmpty() @MaxLength(20)
  phone_no: string;
}
