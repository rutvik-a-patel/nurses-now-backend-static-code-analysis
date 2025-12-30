import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { Timecard } from '@/timecards/entities/timecard.entity';
import { InvoiceTimecards } from './entities/invoice-timecards.entity';
import { AccountingSetting } from '@/facility/entities/accounting-setting.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { PaymentInvoice } from '@/payments/entities/payment-invoice.entity';
import { Activity } from '@/activity/entities/activity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      Timecard,
      InvoiceTimecards,
      AccountingSetting,
      FacilityUser,
      PaymentInvoice,
      Activity,
    ]),
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
})
export class InvoicesModule {}
