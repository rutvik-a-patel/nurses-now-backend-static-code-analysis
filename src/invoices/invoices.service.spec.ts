import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesService } from './invoices.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { Timecard } from '@/timecards/entities/timecard.entity';
import { AccountingSetting } from '@/facility/entities/accounting-setting.entity';
import { InvoiceTimecards } from './entities/invoice-timecards.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { PaymentInvoice } from '@/payments/entities/payment-invoice.entity';
import { Activity } from '@/activity/entities/activity.entity';

describe('InvoicesService', () => {
  let service: InvoicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: getRepositoryToken(Invoice), useValue: {} },
        { provide: getRepositoryToken(Timecard), useValue: {} },
        { provide: getRepositoryToken(InvoiceTimecards), useValue: {} },
        { provide: getRepositoryToken(AccountingSetting), useValue: {} },
        { provide: getRepositoryToken(FacilityUser), useValue: {} },
        { provide: getRepositoryToken(PaymentInvoice), useValue: {} },
        { provide: getRepositoryToken(Activity), useValue: {} },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
