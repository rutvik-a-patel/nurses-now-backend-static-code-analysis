import { Facility } from '@/facility/entities/facility.entity';
import { BaseEntity } from '@/shared/entity/base.entity';
import {
  Index,
  ManyToOne,
  JoinColumn,
  Column,
  Entity,
  OneToMany,
} from 'typeorm';
import { PaymentInvoice } from './payment-invoice.entity';
import { PAYMENT_TYPE } from '@/shared/constants/enum';

@Entity('payments')
export class Payment extends BaseEntity {
  @Index()
  @ManyToOne(() => Facility, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;

  @Index()
  @Column({
    type: 'character varying',
    default: () => 'generate_unique_payment_id()',
  })
  payment_id: string;

  @Column({ type: 'date', nullable: false })
  payment_date: Date;

  @Column({ type: 'character varying', nullable: false })
  transaction_number: string;

  @Column({ type: 'character varying', nullable: false })
  payment_method: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  outstanding: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'character varying', nullable: true })
  base_url: string;

  @Column({ type: 'character varying', nullable: true })
  filename: string;

  @Column({ type: 'enum', enum: PAYMENT_TYPE, default: PAYMENT_TYPE.payment })
  payment_type: PAYMENT_TYPE;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  unallocated_amount: number;

  @OneToMany(() => PaymentInvoice, (paymentInvoice) => paymentInvoice.payment, {
    cascade: true,
  })
  payment_invoices: PaymentInvoice[];
}
