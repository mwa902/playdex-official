import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './interfaces/create.user.interfaces';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('migrate')
  @HttpCode(HttpStatus.OK)
  async migrateDatabase() {
    return this.userService.runUserMigration();
  }

  @Get()
  async getAllUsers() {
    return this.userService.findAll();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() userData: Partial<User>) {
    return this.userService.create(userData);
  }

  @Put(':id')
  async updateUser(
      @Param('id') id: string,
      @Body() updateData: Partial<User>
  ) {
    return this.userService.update(id, updateData);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
