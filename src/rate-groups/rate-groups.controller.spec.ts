import { Test, TestingModule } from '@nestjs/testing';
import { RateGroupsController } from './rate-groups.controller';
import { RateGroupsService } from './rate-groups.service';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('RateGroupsController', () => {
  let controller: RateGroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RateGroupsController],
      providers: [
        RateGroupsService,
        { provide: RateGroupsService, useValue: {} },
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

    controller = module.get<RateGroupsController>(RateGroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
