import {
  TIMECARD_STATUS,
  TABLE,
  TIMECARD_PAYMENT_STATUS,
} from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { TimecardRejectReason } from '@/timecard-reject-reason/entities/timecard-reject-reason.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { TimeSheets } from './time-sheets.entity';
import { InvoiceTimecards } from '@/invoices/entities/invoice-timecards.entity';

@Entity('timecards')
export class Timecard extends BaseEntity {
  @Column({
    type: 'enum',
    enum: TIMECARD_STATUS,
  })
  status: TIMECARD_STATUS;

  @Column({
    type: 'enum',
    enum: TIMECARD_PAYMENT_STATUS,
    default: TIMECARD_PAYMENT_STATUS.unpaid,
  })
  payment_status: TIMECARD_PAYMENT_STATUS;

  @Column({ type: 'text', nullable: true })
  additional_details: string;

  @Column({ type: 'timestamptz', nullable: true })
  approved_date: Date;

  @Column({
    type: 'enum',
    enum: [TABLE.admin, TABLE.facility, TABLE.facility_user],
    nullable: true,
  })
  approved_by_type: Exclude<TABLE, 'provider'>;

  @ManyToOne(
    () => TimecardRejectReason,
    (timecardRejectReason) => timecardRejectReason.timecards,
  )
  @JoinColumn({ name: 'timecard_reject_reason_id' })
  timecard_reject_reason: TimecardRejectReason;

  @Column({ type: 'text', nullable: true })
  rejection_description: string;

  @Column({ type: 'uuid', nullable: true })
  approved_by_id: string;

  @Column({ type: 'timestamptz', nullable: true })
  rejected_date: Date;

  @Column({ type: 'uuid', nullable: true })
  rejected_by_id: string;

  @Column({
    type: 'enum',
    enum: [TABLE.admin, TABLE.facility, TABLE.facility_user],
    nullable: true,
  })
  rejected_by_type: Exclude<TABLE, 'provider'>;

  @Column({ type: 'character varying', nullable: true })
  base_url: string;

  @Column({ type: 'character varying', nullable: true })
  provider_signature: string;

  @Column({ type: 'character varying', nullable: true })
  authority_signature: string;

  @Index()
  @OneToOne(() => Shift, (shift) => shift.time_card, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'shift_id' })
  shift: Shift;

  @OneToMany(() => TimeSheets, (timeSheets) => timeSheets.timecard, {
    cascade: true,
  })
  time_sheets: TimeSheets[];

  @OneToOne(
    () => InvoiceTimecards,
    (invoiceTimecards) => invoiceTimecards.timecard,
  )
  invoice_timecards: InvoiceTimecards;
}
