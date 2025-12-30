import { Test, TestingModule } from '@nestjs/testing';
import { RateGroupsService } from './rate-groups.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RateGroup } from './entities/rate-group.entity';
import { RateSheet } from './entities/rate-sheet.entity';
import { Certificate } from '@/certificate/entities/certificate.entity';

describe('RateGroupsService', () => {
  let service: RateGroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateGroupsService,
        { provide: getRepositoryToken(RateGroup), useValue: {} },
        { provide: getRepositoryToken(RateSheet), useValue: {} },
        { provide: getRepositoryToken(Certificate), useValue: {} },
      ],
    }).compile();

    service = module.get<RateGroupsService>(RateGroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
