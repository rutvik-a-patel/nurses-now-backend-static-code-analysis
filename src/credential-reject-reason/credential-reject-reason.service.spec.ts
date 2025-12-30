import { Test, TestingModule } from '@nestjs/testing';
import { CredentialRejectReasonService } from './credential-reject-reason.service';

describe('CredentialRejectReasonService', () => {
  let service: CredentialRejectReasonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CredentialRejectReasonService,
        {
          provide: CredentialRejectReasonService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CredentialRejectReasonService>(
      CredentialRejectReasonService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
