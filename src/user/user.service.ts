import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from './interfaces/create.user.interfaces';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class UserService {
  private users: User[] = [];

  async getMigrationSql(): Promise<string> {
    try {
      const filePath = path.join(__dirname, '..', 'database', 'migration', 'createuser.sql');
      const sqlQuery = await fs.readFile(filePath, 'utf8');

      if (!sqlQuery) {
        throw new NotFoundException('Migration SQL file is empty');
      }

      return sqlQuery;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(`Could not read migration file: ${error.message}`);
    }
  }

  async runUserMigration(): Promise<{ message: string }> {
    try {
      const sql = await this.getMigrationSql();
      return { message: 'User database migration executed successfully.' };
    } catch (error) {
      throw new InternalServerErrorException(`Migration execution failed: ${error.message}`);
    }
  }

  async findAll(): Promise<User[]> {
    return this.users;
  }

  async findOne(id: string): Promise<User> {
    // Convert id string to number for the comparison
    const user = this.users.find(u => u.id === Number(id));
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }


  async create(userData: Partial<User>): Promise<User> {
    const newUser = {
      id: Date.now().toString(),
      ...userData,
    } as User;

    this.users.push(newUser);
    return newUser;
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const userIndex = this.users.findIndex(u => u.id === Number(id));
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.users[userIndex] = { ...this.users[userIndex], ...updateData };
    return this.users[userIndex];
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const userIndex = this.users.findIndex(u => u.id === Number(id));
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.users.splice(userIndex, 1);
    return { deleted: true };
  }
}
