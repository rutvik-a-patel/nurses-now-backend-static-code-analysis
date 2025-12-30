import { Test, TestingModule } from '@nestjs/testing';
import { OrientationRejectReasonController } from './orientation-reject-reason.controller';
import { OrientationRejectReasonService } from './orientation-reject-reason.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrientationRejectReason } from './entities/orientation-reject-reason.entity';
import { ProviderOrientation } from '@/provider-orientation/entities/provider-orientation.entity';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('OrientationRejectReasonController', () => {
  let controller: OrientationRejectReasonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrientationRejectReasonController],
      providers: [
        OrientationRejectReasonService,
        { provide: getRepositoryToken(OrientationRejectReason), useValue: {} },
        { provide: getRepositoryToken(ProviderOrientation), useValue: {} },
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

    controller = module.get<OrientationRejectReasonController>(
      OrientationRejectReasonController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
