import { Test, TestingModule } from '@nestjs/testing';
import { ProfessionalReferenceResponseService } from './professional-reference-response.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProfessionalReferenceResponse } from './entities/professional-reference-response.entity';
import { ReferenceFormDesign } from '@/reference-form-design/entities/reference-form-design.entity';
import { ProviderProfessionalReference } from '@/provider-professional-reference/entities/provider-professional-reference.entity';

describe('ProfessionalReferenceResponseService', () => {
  let service: ProfessionalReferenceResponseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfessionalReferenceResponseService,
        {
          provide: getRepositoryToken(ProfessionalReferenceResponse),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ReferenceFormDesign),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProviderProfessionalReference),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProfessionalReferenceResponseService>(
      ProfessionalReferenceResponseService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
