import { Body, Controller, Get, Param, Patch, Post, UseFilters, UseGuards } from '@nestjs/common';
import { UserService } from "./user.service";
import { ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../guards/auth/auth.guard";
import { HttpExceptionFilter } from "../filter/http-exception/http-exception.filter";

@ApiTags('User service')
@Controller('user')
@UseGuards(AuthGuard)
@UseFilters(HttpExceptionFilter)
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    getUser() {
        return this.userService.getAllUsers();
    }

    @Get(':id')
    getSpecificUser(@Param('id') id: string) { // Fixed: keeping it consistent with string parsing
        return this.userService.getUserById(Number(id));
    }

    @Post()
    create(@Body() body: { name: string; email: string; password: string, role: "user" }) {
        return this.userService.createUser(body);
    }

    @Patch(':id')
    updateUser(
        @Param("id") id: string, // ✅ FIXED: Removed the accidental colon ":" from inside @Param
        @Body() body: Partial<{ name: string; email: string; password: string, role: "user" }>
    ) {
        return this.userService.updateUserById(Number(id), body);
    }
}
