import { Test, TestingModule } from '@nestjs/testing';
import { TimecardsService } from './timecards.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Timecard } from './entities/timecard.entity';

describe('TimecardsService', () => {
  let service: TimecardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimecardsService,
        {
          provide: getRepositoryToken(Timecard),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<TimecardsService>(TimecardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
