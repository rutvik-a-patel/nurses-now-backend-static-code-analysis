import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('InvoicesController', () => {
  let controller: InvoicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoicesController],
      providers: [
        InvoicesService,
        {
          provide: InvoicesService,
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

    controller = module.get<InvoicesController>(InvoicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
