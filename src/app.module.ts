import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { LoginMiddleware } from './middlewares/login/login.middleware';
import { DatabaseModule } from "@app/database";

@Module({
  imports: [UserModule, DatabaseModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    (console.log(
      process.env.DATABASE_USERNAME,
      typeof process.env.DATABASE_USERNAME,
    ),
      console.log(process.env.DATABASE_PASSWORD));
    consumer.apply(LoginMiddleware).forRoutes('*');
  }
}
