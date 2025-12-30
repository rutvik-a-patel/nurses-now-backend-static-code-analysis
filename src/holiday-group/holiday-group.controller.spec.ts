import { Test, TestingModule } from '@nestjs/testing';
import { HolidayGroupController } from './holiday-group.controller';
import { HolidayGroupService } from './holiday-group.service';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('HolidayGroupController', () => {
  let controller: HolidayGroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HolidayGroupController],
      providers: [
        {
          provide: HolidayGroupService,
          useValue: {
            create: jest.fn(),
            findOneWhere: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
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

    controller = module.get<HolidayGroupController>(HolidayGroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
