import { BaseEntity } from '@/shared/entity/base.entity';
import { Entity, Index, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Invoice } from './invoice.entity';
import { Timecard } from '@/timecards/entities/timecard.entity';

@Entity('invoice_timecards')
export class InvoiceTimecards extends BaseEntity {
  @Index()
  @ManyToOne(() => Invoice, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Index()
  @OneToOne(() => Timecard, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'timecard_id' })
  timecard: Timecard;
}
