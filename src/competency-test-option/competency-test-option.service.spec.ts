import { Test, TestingModule } from '@nestjs/testing';
import { CompetencyTestOptionService } from './competency-test-option.service';

describe('CompetencyTestOptionService', () => {
  let service: CompetencyTestOptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompetencyTestOptionService],
    }).compile();

    service = module.get<CompetencyTestOptionService>(
      CompetencyTestOptionService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
