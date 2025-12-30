import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Invoice } from '@/invoices/entities/invoice.entity';
import { Timecard } from '@/timecards/entities/timecard.entity';
import { Activity } from '@/activity/entities/activity.entity';

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getRepositoryToken(Payment), useValue: {} },
        { provide: getRepositoryToken(Invoice), useValue: {} },
        { provide: getRepositoryToken(Timecard), useValue: {} },
        { provide: getRepositoryToken(Activity), useValue: {} },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
