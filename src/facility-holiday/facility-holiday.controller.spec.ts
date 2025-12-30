import { Test, TestingModule } from '@nestjs/testing';
import { FacilityHolidayController } from './facility-holiday.controller';
import { FacilityHolidayService } from './facility-holiday.service';

describe('FacilityHolidayController', () => {
  let controller: FacilityHolidayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacilityHolidayController],
      providers: [
        {
          provide: FacilityHolidayService,
          useValue: {
            create: jest.fn(),
            findOneWhere: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FacilityHolidayController>(
      FacilityHolidayController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
