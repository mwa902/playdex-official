import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {UserModule} from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import {LoginMiddleware} from "./middlewares/login/login.middleware";
import { DatabaseController } from './database/database.controller';
import { DatabaseService } from './database/database.service';
import {TypeOrmModule} from "@nestjs/typeorm";


@Module({
  imports: [UserModule, ConfigModule.forRoot({ isGlobal: true,}),TypeOrmModule.forRoot({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    autoLoadEntities: true,
    synchronize: true,
  })],
  controllers: [AppController, DatabaseController],
  providers: [AppService, DatabaseService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoginMiddleware).forRoutes("*");
  }
}

