import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { FacilityProvider } from '@/facility-provider/entities/facility-provider.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ReportsService', () => {
  let service: ReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: getRepositoryToken(FacilityProvider),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
