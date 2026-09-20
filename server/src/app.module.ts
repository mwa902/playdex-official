import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';

import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { OrganizationModule } from './organization/organization.module';
import { VenueModule } from './venue/venue.module';
import { EventTypeModule } from './event-type/event-type.module';
import { EventModule } from './event/event.module';
import { BookingModule } from './booking/booking.module';

import { LoggerMiddleware } from './middlewares/logger.middleware';
import { GlobalExceptionFilter } from './filters/http-exception.filter';
import { ApiKeyGuard } from './guards/auth.guard';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UserModule,
    OrganizationModule,
    VenueModule,
    EventTypeModule,
    EventModule,
    BookingModule,
  ],
  providers: [
    Reflector,
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    // ApiKeyGuard disabled by default — enable by setting AUTH_TOKEN in .env
    // { provide: APP_GUARD, useClass: ApiKeyGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
