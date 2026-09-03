// src/app.module.ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { LoginMiddleware } from './middlewares/login/login.middleware';
import { DatabaseModule } from "@app/database";
import { OrganizationModule } from './organization/organization.module';
import { VenueModule } from './venue/venue.module';
import { EventModule } from './event/event.module';
import { BookingModule } from './booking/booking.module';
import { EventTypeModule } from './event_type/event_type.module';

@Module({
  imports: [
    UserModule,
    DatabaseModule,
    OrganizationModule,
    VenueModule,
    ConfigModule.forRoot({ isGlobal: true }),
    EventModule,
    BookingModule,
    EventTypeModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    console.log(
        process.env.DATABASE_USERNAME,
        typeof process.env.DATABASE_USERNAME,
    );
    console.log(process.env.DATABASE_PASSWORD);
    consumer.apply(LoginMiddleware).forRoutes('*');
  }
}
