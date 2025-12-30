import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Invoice } from '@/invoices/entities/invoice.entity';
import { Timecard } from '@/timecards/entities/timecard.entity';
import { Activity } from '@/activity/entities/activity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Invoice, Timecard, Activity])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
