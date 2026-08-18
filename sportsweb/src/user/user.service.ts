import { Injectable, NotFoundException, BadRequestException  } from '@nestjs/common';

@Injectable()
export class UserService {
    private User = [
        {id: 1, name: "Wahad", email: "ahmed.wahad213@gmail.com", password: "123456", role: "admin"},
        {id: 2, name: "Hussnain", email: "hussnain.baber@gmail.com", password: "12345", role: "User"},
        {id: 3, name: "Ali", email: "ali.akmal@gmail.com", password: "1234", role: "Event Organization"},
    ];
    getAllUsers(){
        return this.User;
    }
    getUserById(id: number){
        const user = this.User.find((User) => User.id === id);
        if(id <= 0){
            throw new BadRequestException("User id must be greater than 0");
        }
        if(!user){
            throw new NotFoundException("User Not Found");
        }
        return user;
    }
    // Post
    createUser(data:{name: string, email: string, password: string, role: "user"}){
     const newUser = {
         id: Date.now(),
         ...data,
         }
         this.User.push(newUser);
         return newUser;
    }

    //Patch
    updateUserById(id: number, data:Partial<{ name: string, email: string, password: string }>){
       const updatedUser = this.getUserById(id);
           Object.assign(updatedUser, data);
           return updatedUser;
    }

}
