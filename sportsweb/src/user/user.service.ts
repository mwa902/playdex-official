import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { User } from "./interfaces/create.user.interfaces";

@Injectable()
export class UserService {
    private users: User[] = [];

    getAllUsers() {
        return this.users;
    }

    getUserById(id: number) {
        if (id <= 0) {
            throw new BadRequestException("User id must be greater than 0");
        }

        const user = this.users.find((u) => u.id === id);

        if (!user) {
            throw new NotFoundException("User Not Found");
        }
        return user;
    }
    async createUser(data: Omit<User, 'id'>) {
        const { email, password } = data;

        const emailExists = this.users.some((user) => user.email === email);
        if (emailExists) {
            throw new BadRequestException("User email already exists!!!");
        }
        if (password.length < 8) {
            throw new BadRequestException("User password must be at least 8 characters long");
        }
        const newUser: User = {
            id: Date.now(),
            ...data,
        };

        this.users.push(newUser);
        return newUser;
    }

    updateUserById(id: number, data: Partial<Omit<User, 'id'>>) {
        const userToUpdate = this.getUserById(id);

        Object.assign(userToUpdate, data);
        return userToUpdate;
    }
}
