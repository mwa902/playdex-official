import { Test, TestingModule } from '@nestjs/testing';
import { EventTypeController } from './event_type.controller';
import { EventTypeService } from './event_type.service';

describe('EventTypeController', () => {
  let controller: EventTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventTypeController],
      providers: [
        {
          provide: EventTypeService,
          useValue: {
            runEventTypeMigration: jest.fn(),
            getMigrationSql: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EventTypeController>(EventTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
