import { Invoice } from '@/invoices/entities/invoice.entity';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Payment } from './payment.entity';

@Entity('payment_invoices')
export class PaymentInvoice extends BaseEntity {
  @Index()
  @ManyToOne(() => Invoice, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Index()
  @ManyToOne(() => Payment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;
}
