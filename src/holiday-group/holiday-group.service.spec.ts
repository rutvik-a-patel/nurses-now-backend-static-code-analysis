import { Test, TestingModule } from '@nestjs/testing';
import { HolidayGroupService } from './holiday-group.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HolidayGroup } from './entities/holiday-group.entity';
import { FacilityHoliday } from '@/facility-holiday/entities/facility-holiday.entity';
import { FacilityHolidayService } from '@/facility-holiday/facility-holiday.service';

describe('HolidayGroupService', () => {
  let service: HolidayGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HolidayGroupService,
        FacilityHolidayService,
        {
          provide: getRepositoryToken(HolidayGroup),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(FacilityHoliday),
          useValue: {
            save: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<HolidayGroupService>(HolidayGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
