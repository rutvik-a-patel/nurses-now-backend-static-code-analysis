import { Test, TestingModule } from '@nestjs/testing';
import { CredentialRejectReasonController } from './credential-reject-reason.controller';
import { CredentialRejectReasonService } from './credential-reject-reason.service';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('CredentialRejectReasonController', () => {
  let controller: CredentialRejectReasonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CredentialRejectReasonController],
      providers: [
        CredentialRejectReasonService,
        { provide: CredentialRejectReasonService, useValue: {} },
        {
          provide: AccessControlGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
      ],
    })
      .overrideGuard(AccessControlGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<CredentialRejectReasonController>(
      CredentialRejectReasonController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
