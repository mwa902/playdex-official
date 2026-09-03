import { Module } from '@nestjs/common';
import { EventTypeController } from './event_type.controller';
import { EventTypeService } from './event_type.service';

@Module({
  controllers: [EventTypeController],
  providers: [EventTypeService]
})
export class EventTypeModule {}
