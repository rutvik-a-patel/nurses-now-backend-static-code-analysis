import { INVOICE_STATE, INVOICE_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { InvoiceTimecards } from './invoice-timecards.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { PaymentInvoice } from '@/payments/entities/payment-invoice.entity';

@Entity('invoices')
export class Invoice extends BaseEntity {
  @Column({
    type: 'character varying',
    default: () => 'generate_unique_invoice_number()',
  })
  @Index()
  invoice_number: string;

  @Column('numeric', { precision: 10, scale: 2, default: 0 })
  total: number;

  @Column('numeric', { precision: 10, scale: 2, default: 0 })
  outstanding: number;

  @Column('numeric', { precision: 10, scale: 2, default: 0 })
  received: number;

  @Column('numeric', { precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column({
    type: 'enum',
    enum: INVOICE_STATUS,
    default: INVOICE_STATUS.unpaid,
  })
  invoice_status: INVOICE_STATUS;

  @Column({
    type: 'enum',
    enum: INVOICE_STATE,
    default: INVOICE_STATE.generated,
  })
  status: INVOICE_STATE;

  @Index()
  @ManyToOne(() => Facility, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;

  @OneToMany(
    () => InvoiceTimecards,
    (invoiceTimecards) => invoiceTimecards.invoice,
    { cascade: true },
  )
  invoice_timecards: InvoiceTimecards[];

  @Column({ type: 'timestamptz', nullable: true })
  billed_date: Date;

  @Column({ type: 'date', nullable: true })
  billing_cycle_start_date: Date;

  @Column({ type: 'date', nullable: true })
  billing_cycle_end_date: Date;

  @Column({ type: 'integer', default: 0 })
  aging: number;

  @OneToMany(() => PaymentInvoice, (payment) => payment.invoice)
  invoice_payments: PaymentInvoice[];
}
