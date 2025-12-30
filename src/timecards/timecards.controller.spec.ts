import { Test, TestingModule } from '@nestjs/testing';
import { TimecardsController } from './timecards.controller';
import { TimecardsService } from './timecards.service';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('TimecardsController', () => {
  let controller: TimecardsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimecardsController],
      providers: [
        { provide: TimecardsService, useValue: {} },
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

    controller = module.get<TimecardsController>(TimecardsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
