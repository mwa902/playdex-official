import { Test, TestingModule } from '@nestjs/testing';
import { VenueController } from './venue.controller';
import { VenueService } from './venue.service';

describe('VenueController', () => {
  let controller: VenueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VenueController],
      providers: [
        {
          provide: VenueService,
          useValue: {
            runVenueMigration: jest.fn(),
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

    controller = module.get<VenueController>(VenueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
