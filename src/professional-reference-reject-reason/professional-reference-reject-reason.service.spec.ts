import { Test, TestingModule } from '@nestjs/testing';
import { ProfessionalReferenceRejectReasonService } from './professional-reference-reject-reason.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProfessionalReferenceRejectReason } from './entities/professional-reference-reject-reason.entity';

describe('ProfessionalReferenceRejectReasonService', () => {
  let service: ProfessionalReferenceRejectReasonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfessionalReferenceRejectReasonService,
        {
          provide: getRepositoryToken(ProfessionalReferenceRejectReason),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ProfessionalReferenceRejectReasonService>(
      ProfessionalReferenceRejectReasonService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
