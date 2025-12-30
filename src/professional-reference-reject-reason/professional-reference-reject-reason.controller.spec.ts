import { Test, TestingModule } from '@nestjs/testing';
import { ProfessionalReferenceRejectReasonController } from './professional-reference-reject-reason.controller';
import { ProfessionalReferenceRejectReasonService } from './professional-reference-reject-reason.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProfessionalReferenceRejectReason } from './entities/professional-reference-reject-reason.entity';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('ProfessionalReferenceRejectReasonController', () => {
  let controller: ProfessionalReferenceRejectReasonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfessionalReferenceRejectReasonController],
      providers: [
        ProfessionalReferenceRejectReasonService,
        {
          provide: getRepositoryToken(ProfessionalReferenceRejectReason),
          useValue: {},
        },
        {
          provide: AccessControlGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
      ],
    })
      .overrideGuard(AccessControlGuard)
      .useValue({
        canActivate: jest.fn().mockReturnValue(true),
      })
      .compile();

    controller = module.get<ProfessionalReferenceRejectReasonController>(
      ProfessionalReferenceRejectReasonController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
