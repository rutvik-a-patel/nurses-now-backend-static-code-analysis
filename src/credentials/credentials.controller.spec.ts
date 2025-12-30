import { Test, TestingModule } from '@nestjs/testing';
import { CredentialsController } from './credentials.controller';
import { CredentialsService } from './credentials.service';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('CredentialsController', () => {
  let controller: CredentialsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CredentialsController],
      providers: [
        { provide: CredentialsService, useValue: {} },
        {
          provide: AccessControlGuard,
          useValue: {
            canActivate: jest.fn(() => true),
          },
        },
      ],
    })
      .overrideGuard(AccessControlGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<CredentialsController>(CredentialsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
