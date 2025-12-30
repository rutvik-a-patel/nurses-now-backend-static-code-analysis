import { Test, TestingModule } from '@nestjs/testing';
import { FacilityHolidayService } from './facility-holiday.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FacilityHoliday } from './entities/facility-holiday.entity';

describe('FacilityHolidayService', () => {
  let service: FacilityHolidayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacilityHolidayService,
        {
          provide: getRepositoryToken(FacilityHoliday),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FacilityHolidayService>(FacilityHolidayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
