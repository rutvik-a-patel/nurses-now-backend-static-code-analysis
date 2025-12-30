import { Test, TestingModule } from '@nestjs/testing';
import { CredentialsService } from './credentials.service';
import { Credential } from './entities/credential.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProviderCredential } from '@/provider-credentials/entities/provider-credential.entity';
import { CompetencyTestScore } from '@/competency-test-response/entities/competency-test-score.entity';
import { SkillChecklistResponse } from '@/skill-checklist-module/entities/skill-checklist-response.entity';

describe('CredentialsService', () => {
  let service: CredentialsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CredentialsService,
        {
          provide: getRepositoryToken(Credential),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ProviderCredential),
          useValue: {},
        },
        {
          provide: getRepositoryToken(SkillChecklistResponse),
          useValue: {},
        },
        {
          provide: getRepositoryToken(CompetencyTestScore),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CredentialsService>(CredentialsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
