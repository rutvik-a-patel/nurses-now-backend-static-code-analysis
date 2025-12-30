import { Certificate } from '@/certificate/entities/certificate.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { FloorDetail } from '@/floor-detail/entities/floor-detail.entity';
import { Provider } from '@/provider/entities/provider.entity';
import {
  ADJUSTMENT_STATUS,
  SHIFT_STATUS,
  SHIFT_TYPE,
  TABLE,
} from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { ShiftCancelReason } from '@/shift-cancel-reason/entities/shift-cancel-reason.entity';
import { ShiftInvitation } from '@/shift-invitation/entities/shift-invitation.entity';
import { ShiftRequest } from '@/shift-request/entities/shift-request.entity';
import { Speciality } from '@/speciality/entities/speciality.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { ShiftNote } from '@/shift-note/entities/shift-note.entity';
import { ProviderCancelledShift } from './provider-cancelled-shift.entity';
import { VoidShift } from './void-shift.entity';
import { Timecard } from '@/timecards/entities/timecard.entity';
import { ProviderOrientation } from '@/provider-orientation/entities/provider-orientation.entity';
import { Disbursement } from '@/disbursement/entities/disbursement.entity';

@Index('idx_shift_facility_speciality_certificate', [
  'facility',
  'speciality',
  'certificate',
])
@Index('idx_shift_provider_facility_date_time', [
  'facility',
  'provider',
  'start_date',
  'end_date',
  'start_time',
  'end_time',
])
@Index('idx_shift_published_status', ['is_publish', 'status'])
@Index('idx_shift_provider_date', ['provider', 'start_date'])
@Index('idx_shift_facility_date', ['provider', 'start_date'])
@Index('idx_shift_provider_status', ['provider', 'status'])
@Entity()
export class Shift extends BaseEntity {
  @Column({
    type: 'character varying',
    default: () => 'generate_unique_shift_id()',
  })
  @Index()
  shift_id: string;

  @Index()
  @ManyToOne(() => Certificate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'certificate_id' })
  certificate: Certificate;

  @Index()
  @ManyToOne(() => Speciality, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'speciality_id' })
  speciality: Speciality;

  @Index()
  @ManyToOne(() => Facility, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;

  @Index()
  @ManyToOne(() => FacilityUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'follower_id' })
  follower: FacilityUser;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({ type: 'boolean', default: false })
  is_repeat: boolean;

  @Column({ type: 'simple-array', nullable: true })
  days: number[];

  @Column({ type: 'date' })
  start_date: string;

  @Column({ type: 'date' })
  end_date: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: false })
  is_publish: boolean;

  @Column({ type: 'character varying', nullable: true })
  base_url: string;

  @ManyToOne(() => FloorDetail, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'floor_id' })
  floor: FloorDetail;

  @OneToMany(() => ShiftInvitation, (invitation) => invitation.shift)
  invited_provider: ShiftInvitation[];

  @Column({
    type: 'enum',
    enum: SHIFT_STATUS,
    default: SHIFT_STATUS.open,
  })
  status: SHIFT_STATUS;

  @Column({
    type: 'enum',
    enum: SHIFT_TYPE,
    default: SHIFT_TYPE.per_diem_shifts,
  })
  shift_type: SHIFT_TYPE;

  @OneToMany(() => ShiftRequest, (request) => request.shift)
  provider_requests: ShiftRequest[];

  @Index()
  @ManyToOne(() => Provider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Column({ type: 'timestamptz', nullable: true })
  temp_conf_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  client_conf_at: Date;

  @Column({ type: 'uuid' })
  created_by_id: string;

  @Column({
    type: 'enum',
    enum: TABLE,
    default: TABLE.admin,
  })
  created_by_type: TABLE;

  @Column({ type: 'uuid' })
  updated_by_id: string;

  @Column({
    type: 'enum',
    enum: TABLE,
    default: TABLE.admin,
  })
  updated_by_type: TABLE;

  @Column({ type: 'timestamptz', nullable: true })
  cancelled_on: Date;

  @Column({ type: 'uuid', nullable: true })
  cancelled_by_id: string;

  @Column({
    type: 'enum',
    enum: TABLE,
    nullable: true,
  })
  cancelled_by_type: TABLE;

  @ManyToOne(() => ShiftCancelReason, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shift_cancel_reason_id' })
  cancel_reason: ShiftCancelReason;

  @Column({ type: 'text', nullable: true })
  cancel_reason_description: string;

  @Column({ type: 'date', nullable: true })
  clock_in_date: Date;

  @Column({ type: 'date', nullable: true })
  clock_out_date: Date;

  @Column({ type: 'time', nullable: true })
  clock_in: string;

  @Column({ type: 'time', nullable: true })
  clock_out: string;

  @Column({ type: 'date', nullable: true })
  break_start_date: Date;

  @Column({ type: 'time', nullable: true })
  break_start_time: string;

  @Column({ type: 'date', nullable: true })
  break_end_date: Date;

  @Column({ type: 'time', nullable: true })
  break_end_time: string;

  @Column({ type: 'bigint', default: 0 })
  break_duration: number;

  @Column({ type: 'integer', default: 0 })
  total_break: number;

  @Column({ type: 'bigint', default: 0 })
  total_worked: number;

  @Column({ type: 'boolean', default: false })
  premium_rate: boolean;

  @OneToMany(() => ShiftNote, (note) => note.shift)
  notes: ShiftNote[];

  @OneToMany(
    () => ProviderCancelledShift,
    (providerCancelledShift) => providerCancelledShift.shift,
  )
  provider_cancelled_shifts: ProviderCancelledShift[];

  @OneToMany(() => VoidShift, (voidShift) => voidShift.shift)
  void_shift: VoidShift[];

  @Column({ type: 'timestamptz', nullable: true })
  modified_at: Date;

  @Column({ type: 'boolean', nullable: true })
  is_ai_triggered: boolean;

  @Column({
    type: 'enum',
    enum: TABLE,
    nullable: true,
  })
  cancelled_request_from: TABLE;

  @OneToOne(() => Timecard, (timecard) => timecard.shift)
  time_card: Timecard;

  @Column({ type: 'boolean', default: false })
  is_orientation: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  pay_rate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  weekend_pay_rate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  bill_rate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  weekend_bill_rate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  overtime_pay_rate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  overtime_bill_rate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  holiday_pay_multiplier: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  holiday_bill_multiplier: number;

  @Column({ type: 'bigint', default: 0 })
  time_adjustment: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_adjustment: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  adjustment: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_billable_adjustment: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  billable_adjustment: number;

  @Column({ type: 'enum', enum: ADJUSTMENT_STATUS, nullable: true })
  adjustment_status: ADJUSTMENT_STATUS;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_payable_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_billable_amount: number;

  @Column({ type: 'enum', enum: ADJUSTMENT_STATUS, nullable: true })
  bill_adjustment_status: ADJUSTMENT_STATUS;

  @Column({ type: 'bigint', default: 0 })
  overtime: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  overtime_payable_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  overtime_billable_amount: number;

  @OneToOne(() => ProviderOrientation, (orientation) => orientation.shift)
  orientation: ProviderOrientation;

  @OneToOne(() => Disbursement, (disbursement) => disbursement.shift)
  disbursements: Disbursement;
}
