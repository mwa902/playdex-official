import { IsEnum, IsOptional, IsString, MinLength, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, ActiveStatus } from '../interfaces/user.interface';

export class UpdateUserDto {
  @ApiPropertyOptional() @IsOptional() @IsString()  name?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail()   email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(6) password?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(['superadmin','admin','user','Event Organization']) role?: UserRole;
  @ApiPropertyOptional() @IsOptional() @IsEnum(['Active','Not-Active']) is_active?: ActiveStatus;
}
