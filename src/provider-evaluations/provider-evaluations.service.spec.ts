import { Test, TestingModule } from '@nestjs/testing';
import { ProviderEvaluationsService } from './provider-evaluations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProviderEvaluation } from './entities/provider-evaluation.entity';
import { EvaluationResponse } from './entities/evaluation-response.entity';
import { FacilityProvider } from '@/facility-provider/entities/facility-provider.entity';

describe('ProviderEvaluationsService', () => {
  let service: ProviderEvaluationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderEvaluationsService,
        {
          provide: getRepositoryToken(ProviderEvaluation),
          useValue: {},
        },
        {
          provide: getRepositoryToken(EvaluationResponse),
          useValue: {},
        },
        {
          provide: getRepositoryToken(FacilityProvider),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ProviderEvaluationsService>(
      ProviderEvaluationsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
