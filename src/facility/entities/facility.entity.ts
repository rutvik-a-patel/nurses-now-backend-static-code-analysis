import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Admin } from '@/admin/entities/admin.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';
import { Token } from '@/token/entities/token.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { FloorDetail } from '@/floor-detail/entities/floor-detail.entity';
import { UserNotification } from '@/user-notification/entities/user-notification.entity';
import { ProviderSavedFacility } from '@/provider-saved-facility/entities/provider-saved-facility.entity';
import { ORIENTATION_TYPE } from '@/shared/constants/enum';
import { FacilityRejectReason } from '@/facility-reject-reason/entities/facility-reject-reason.entity';
import { FacilityProvider } from '@/facility-provider/entities/facility-provider.entity';
import { TimeEntrySetting } from './time-entry-setting.entity';
import { FacilityPortalSetting } from './facility-portal-setting.entity';
import { LineOfBusiness } from '@/line-of-business/entities/line-of-business.entity';
import { FacilityShiftSetting } from '@/facility-shift-setting/entities/facility-shift-setting.entity';
import { ProviderEvaluation } from '@/provider-evaluations/entities/provider-evaluation.entity';
import { FacilityHoliday } from '@/facility-holiday/entities/facility-holiday.entity';
import { Invoice } from '@/invoices/entities/invoice.entity';
import { AccountingSetting } from './accounting-setting.entity';
import { Payment } from '@/payments/entities/payment.entity';
import { RateGroup } from '@/rate-groups/entities/rate-group.entity';

@Entity()
export class Facility extends BaseEntity {
  @Column({ type: 'character varying' })
  name: string;

  @Column({ type: 'character varying', nullable: true })
  email: string;

  @Column({ type: 'character varying', nullable: true, length: 5 })
  country_code: string;

  @Column({
    type: 'character varying',
    nullable: true,
    length: 15,
  })
  mobile_no: string;

  @ManyToOne(
    () => LineOfBusiness,
    (facility_type) => facility_type.facility_id,
    { nullable: true },
  )
  @JoinColumn({ name: 'facility_type_id' })
  facility_type: LineOfBusiness;

  @Column({ type: 'integer', default: 0 })
  total_beds: number;

  @Column({ type: 'character varying', nullable: true })
  base_url: string;

  @Column({ type: 'character varying', nullable: true })
  image: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  first_shift: string;

  @Column({ type: 'text', nullable: true })
  orientation: string;

  @Column({ type: 'text', nullable: true })
  shift_description: string;

  @Column({ type: 'text', nullable: true })
  breaks_instruction: string;

  @Column({ type: 'text', nullable: true })
  dress_code: string;

  @Column({ type: 'text', nullable: true })
  parking_instruction: string;

  @Column({ type: 'text', nullable: true })
  doors_locks: string;

  @Column({ type: 'text', nullable: true })
  timekeeping: string;

  @Column({
    type: 'character varying',
    nullable: true,
  })
  employee_id: string;

  @Column({ type: 'character varying', nullable: true })
  password: string;

  @Column({ type: 'character varying', nullable: true })
  street_address: string;

  @Column({ type: 'character varying', nullable: true })
  house_no: string;

  @Column({ type: 'character varying', nullable: true })
  zip_code: string;

  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  longitude: number;

  @Column({ type: 'character varying', nullable: true })
  place_id: string;

  @Column({ type: 'character varying', nullable: true })
  city: string;

  @Column({ type: 'character varying', nullable: true })
  state: string;

  @Column({ type: 'character varying', nullable: true })
  country: string;

  @Index()
  @ManyToOne(() => Admin, (admin) => admin.facility)
  @JoinColumn({ name: 'admin_id' })
  admin: Admin;

  @ManyToOne(() => Provider, (provider) => provider.facility)
  @JoinColumn({ name: 'referred_by' })
  provider: Provider;

  @Column({ type: 'uuid', nullable: true })
  master_facility_id: string;

  @Column({ type: 'boolean', default: false })
  is_master: boolean;

  @Column({ type: 'boolean', default: false })
  is_email_verified: boolean;

  @Column({ type: 'boolean', default: false })
  is_floor: boolean;

  @ManyToMany(
    () => FacilityUser,
    (facility_user) => facility_user.facility_assign_to,
  )
  @JoinTable({ name: 'facility_assign_to' })
  assign_to: FacilityUser[];

  @Index()
  @ManyToOne(() => StatusSetting, (status) => status.facility)
  @JoinColumn({ name: 'status' })
  status: StatusSetting;

  @OneToMany(() => Token, (token) => token.facility)
  token: Token[];

  @OneToMany(() => Shift, (shift) => shift.facility)
  shift: Shift[];

  @OneToMany(() => FloorDetail, (floor) => floor.facility)
  floor_detail: FloorDetail[];

  @OneToMany(
    () => UserNotification,
    (user_notification) => user_notification.facility,
  )
  user_notification: UserNotification[];

  @OneToMany(
    () => ProviderSavedFacility,
    (providerSavedFacility) => providerSavedFacility.facility,
  )
  provider_saved_facility: ProviderSavedFacility[];

  @OneToMany(
    () => FacilityShiftSetting,
    (shiftSetting) => shiftSetting.facility,
  )
  shift_setting: FacilityShiftSetting[];

  @ManyToOne(() => FacilityRejectReason, (reason) => reason.facility)
  @JoinColumn({ name: 'reason_id' })
  reason: FacilityRejectReason;

  @Column({ type: 'text', nullable: true })
  reason_description: string;

  @OneToMany(
    () => FacilityProvider,
    (facilityProvider) => facilityProvider.facility,
  )
  facility_provider: FacilityProvider[];

  @Column({ type: 'integer', default: 0 })
  invoice_pay_duration: number;

  @Column({ type: 'boolean', default: false })
  orientation_enabled: boolean;

  @Column({
    type: 'enum',
    enum: ORIENTATION_TYPE,
    nullable: true,
  })
  orientation_process: ORIENTATION_TYPE;

  @Column('uuid', { array: true, default: null })
  certificate: string[];

  @Column('uuid', { array: true, default: null })
  speciality: string[];

  @Column({ type: 'character varying', nullable: true })
  work_comp_code: string;

  @Column({ type: 'character varying', nullable: true })
  orientation_document: string;

  @Column({ type: 'character varying', nullable: true })
  original_filename: string;

  @OneToOne(
    () => TimeEntrySetting,
    (timeEntrySetting) => timeEntrySetting.facility,
  )
  time_entry_setting: TimeEntrySetting;

  @OneToOne(
    () => FacilityPortalSetting,
    (facilityPortalSetting) => facilityPortalSetting.facility,
  )
  facility_portal_setting: FacilityPortalSetting;

  @Column({ type: 'integer', default: 0 })
  login_attempt: number;

  @Column({ type: 'timestamptz', nullable: true })
  login_attempt_at: Date;

  @Column({ type: 'character varying', nullable: true })
  timezone: string;

  @OneToOne(
    () => FacilityUser,
    (super_facility_user) => super_facility_user.primary_facility,
  )
  super_facility_user: FacilityUser;

  @Column({ type: 'boolean', default: false })
  is_corporate_client: boolean;

  @Column({ type: 'text', nullable: true })
  general_notes: string;

  @Column({ type: 'text', nullable: true })
  staff_note: string;

  @Column({ type: 'text', nullable: true })
  bill_notes: string;

  @Column({ type: 'character varying', nullable: true })
  website: string;

  @OneToMany(
    () => ProviderEvaluation,
    (providerEvaluation) => providerEvaluation.facility,
  )
  provider_evaluation: ProviderEvaluation[];

  @OneToMany(
    () => FacilityHoliday,
    (facilityHoliday) => facilityHoliday.facility,
  )
  facility_holidays: FacilityHoliday[];

  @Column({ type: 'timestamptz', nullable: true })
  active_date: Date;

  @Column({ type: 'timestamptz', nullable: true })
  last_billing_date: Date;

  @OneToMany(() => Invoice, (invoice) => invoice.facility)
  invoices: Invoice[];

  @OneToOne(
    () => AccountingSetting,
    (accountingSetting) => accountingSetting.facility,
  )
  accounting_setting: AccountingSetting;

  @OneToMany(() => Payment, (payment) => payment.facility)
  invoice_payments: Payment[];

  @OneToOne(() => RateGroup, (rateGroup) => rateGroup.facility)
  invoice_timecards: RateGroup;
}
