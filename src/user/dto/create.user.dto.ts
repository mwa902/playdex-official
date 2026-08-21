import { IsEmail, IsString, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class createuser {
  @ApiProperty({ description: 'Here name must come', example: 'Wahad Ahmed' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Unqiue email not repeatble',
    example: 'wahad@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'Strong password and must be greater than equal to EIGHT characters',
    example: ' ********',
  })
  @IsStrongPassword()
  password: string;

  @ApiProperty({ description: 'Roles must be defined', example: 'user' })
  @IsString()
  role: 'user';
}
