import { Test, TestingModule } from '@nestjs/testing';
import { ProviderEvaluationsController } from './provider-evaluations.controller';
import { ProviderEvaluationsService } from './provider-evaluations.service';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('ProviderEvaluationsController', () => {
  let controller: ProviderEvaluationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProviderEvaluationsController],
      providers: [
        {
          provide: ProviderEvaluationsService,
          useValue: {},
        },
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

    controller = module.get<ProviderEvaluationsController>(
      ProviderEvaluationsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
