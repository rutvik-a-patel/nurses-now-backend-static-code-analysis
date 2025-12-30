import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from '@/shared/entity/base.entity';
import {
  MARITAL_STATUS,
  SHIFT_TYPE_LABEL,
  USER_STATUS,
  VERIFICATION_STATUS,
} from '@/shared/constants/enum';
import { Certificate } from '@/certificate/entities/certificate.entity';
import { Speciality } from '@/speciality/entities/speciality.entity';
import { Token } from '@/token/entities/token.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';
import { ProviderAddress } from '@/provider-address/entities/provider-address.entity';
import { ProviderAcknowledgement } from '@/provider-acknowledgement/entities/provider-acknowledgement.entity';
import { Otp } from '@/otp/entities/otp.entity';
import { ProviderEducationHistory } from '@/provider-education-history/entities/provider-education-history.entity';
import { ProviderWorkHistory } from '@/provider-work-history/entities/provider-work-history.entity';
import { ProviderProfessionalReference } from '@/provider-professional-reference/entities/provider-professional-reference.entity';
import { CompetencyTestScore } from '@/competency-test-response/entities/competency-test-score.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { UserNotification } from '@/user-notification/entities/user-notification.entity';
import { ShiftInvitation } from '@/shift-invitation/entities/shift-invitation.entity';
import { ShiftRequest } from '@/shift-request/entities/shift-request.entity';
import { ProviderSavedFacility } from '@/provider-saved-facility/entities/provider-saved-facility.entity';
import { ProviderCredential } from '@/provider-credentials/entities/provider-credential.entity';
import { ProviderRejectReason } from '@/provider-reject-reason/entities/provider-reject-reason.entity';
import { FacilityProvider } from '@/facility-provider/entities/facility-provider.entity';
import { ProviderAnalytics } from '@/provider-analytics/entities/provider-analytics.entity';
import { EDocResponse } from '@/e-doc-response/entities/e-doc-response.entity';
import { AssignedCredential } from '@/assigned-credentials/entities/assigned-credential.entity';
import { ReferFacility } from '@/refer-facility/entities/refer-facility.entity';
import { ProviderCancelledShift } from '@/shift/entities/provider-cancelled-shift.entity';
import { SkillChecklistResponse } from '@/skill-checklist-module/entities/skill-checklist-response.entity';
import { VoidShift } from '@/shift/entities/void-shift.entity';
import { ProviderNotificationSetting } from '@/user-notification/entities/provider-notification-setting.entity';
import { ProviderEvaluation } from '@/provider-evaluations/entities/provider-evaluation.entity';
import { Disbursement } from '@/disbursement/entities/disbursement.entity';

@Index('idx_provider_name_search', [
  'first_name',
  'middle_name',
  'last_name',
  'nick_name',
])
@Index('idx_provider_status', ['status'])
@Index('idx_provider_verification_status', ['verification_status'])
@Index('idx_provider_created_at', ['created_at'])
@Index('idx_provider_updated_at', ['updated_at'])
@Index('idx_provider_country_mobile', ['country_code', 'mobile_no'])
@Entity()
export class Provider extends BaseEntity {
  @Index()
  @Column({ type: 'character varying', nullable: true })
  first_name: string;

  @Column({ type: 'character varying', nullable: true })
  middle_name: string;

  @Column({ type: 'character varying', nullable: true })
  nick_name: string;

  @Index()
  @Column({ type: 'character varying', nullable: true })
  last_name: string;

  @Index()
  @Column({ type: 'character varying', nullable: true })
  email: string;

  @Column({ type: 'character varying', nullable: true })
  unverified_email: string;

  @Index()
  @Column({ type: 'character varying', length: 5, nullable: true })
  country_code: string;

  @Index()
  @Column({
    type: 'character varying',
    length: 25,
    nullable: true,
  })
  mobile_no: string;

  @Column({ type: 'character varying', length: 5, nullable: true })
  emergency_mobile_country_code: string;

  @Column({
    type: 'character varying',
    length: 15,
    nullable: true,
  })
  emergency_mobile_no: string;

  @Column({ type: 'character varying', nullable: true })
  emergency_contact_name: string;

  @Column({ type: 'character varying', nullable: true })
  relation_with: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'character varying', nullable: true })
  gender: string;

  @Column({ type: 'date', nullable: true })
  birth_date: Date;

  @Column({ type: 'character varying', nullable: true })
  password: string;

  @Column({ type: 'character varying', nullable: true })
  google_id: string;

  @Column({ type: 'character varying', nullable: true })
  facebook_id: string;

  @Column({ type: 'character varying', nullable: true })
  apple_id: string;

  @Column({ type: 'character varying', nullable: true })
  base_url: string;

  @Column({ type: 'character varying', nullable: true })
  profile_image: string;

  @Column({ type: 'character varying', nullable: true })
  profession: string;

  @Column({ type: 'character varying', nullable: true })
  referred_by: string;

  @Column({ type: 'character varying', nullable: true })
  ssn: string;

  @Column({ type: 'character varying', nullable: true })
  citizenship: string;

  @Column({ type: 'boolean', default: false })
  veteran_status: boolean;

  @Column({ type: 'character varying', nullable: true })
  race: string;

  @Column({ type: 'date', nullable: true })
  first_contact_date: Date;

  @Column({ type: 'date', nullable: true })
  hire_date: Date;

  @Column({ type: 'date', nullable: true })
  rehire_date: Date;

  @Column({ type: 'date', nullable: true })
  first_work_date: Date;

  @Column({ type: 'date', nullable: true })
  last_work_date: Date;

  @Column({ type: 'date', nullable: true })
  last_paid_date: Date;

  @Column({ type: 'date', nullable: true })
  termination_date: Date;

  @Column({ type: 'character varying', nullable: true })
  work_comp_code: string;

  @Column({ type: 'character varying', nullable: true })
  hourly_burden: string;

  @Column({ type: 'date', nullable: true })
  employed_at: Date;

  @Column({ type: 'character varying', nullable: true })
  employee_id: string;

  @Column({ type: 'boolean', default: false })
  is_deceased: boolean;

  @Column({ type: 'date', nullable: true })
  deceased_date: Date;

  @Column({
    type: 'enum',
    enum: MARITAL_STATUS,
    nullable: true,
  })
  marital_status: MARITAL_STATUS;

  @Column({
    type: 'enum',
    enum: VERIFICATION_STATUS,
    default: VERIFICATION_STATUS.pending,
  })
  verification_status: VERIFICATION_STATUS;

  @OneToMany(() => Token, (token) => token.provider, { cascade: true })
  token: Token[];

  @OneToMany(() => Otp, (otp) => otp.provider)
  otp: Otp[];

  @OneToMany(
    () => ProviderEducationHistory,
    (providerEducationHistory) => providerEducationHistory.provider,
  )
  education_history: ProviderEducationHistory[];

  @OneToMany(
    () => ProviderWorkHistory,
    (providerWorkHistory) => providerWorkHistory.provider,
  )
  work_history: ProviderWorkHistory[];

  @OneToMany(
    () => AssignedCredential,
    (assignedCredential) => assignedCredential.provider,
  )
  assigned_credential: AssignedCredential[];

  @OneToMany(
    () => ProviderProfessionalReference,
    (providerProfessionalReference) => providerProfessionalReference.provider,
  )
  professional_reference: ProviderProfessionalReference[];

  @Index()
  @ManyToOne(() => Certificate, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'certificate_id' })
  certificate: Certificate;

  @Index()
  @Column('uuid', { array: true, default: null })
  additional_certification: string[];

  @Index()
  @ManyToOne(() => Speciality, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'speciality_id' })
  speciality: Speciality;

  @Index()
  @Column('uuid', { array: true, default: null })
  additional_speciality: string[];

  @Column('enum', { enum: SHIFT_TYPE_LABEL, array: true, default: null })
  shift_preference: string[];

  @Column('character varying', { array: true, default: null })
  preferred_state: string[];

  @Column({ type: 'double precision', nullable: true })
  radius: number;

  @Index()
  @Column('jsonb', {
    default: {
      D: true, // 8 Hours Days
      E: true, // 8 Hours Evenings
      N: true, // 8 Hours Nights
      A: true, // 12 Hours Day
      P: true, // 12 Hours Night
    },
    nullable: true,
  })
  shift_time: any;

  @Column({ type: 'character varying', nullable: true })
  signature_image: string;

  @Column({ type: 'integer', nullable: true })
  points: number;

  @Column({ type: 'boolean', default: false })
  is_email_verified: boolean;

  @Column({ type: 'boolean', default: false })
  is_mobile_verified: boolean;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  notify_me: boolean;

  @Column({ type: 'boolean', default: false })
  is_terminated: boolean;

  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  longitude: number;

  @OneToMany(() => Facility, (facility) => facility.provider)
  facility: Facility[];

  @OneToMany(() => ProviderAddress, (address) => address.provider)
  address: ProviderAddress[];

  @Index()
  @ManyToOne(() => StatusSetting, (status) => status.provider)
  @JoinColumn({ name: 'status' })
  status: StatusSetting;

  @OneToOne(
    () => ProviderAcknowledgement,
    (provider_acknowledgement) => provider_acknowledgement.provider,
  )
  @JoinColumn({ name: 'provider_acknowledgement_id' })
  provider_acknowledgement: ProviderAcknowledgement;

  @OneToMany(
    () => SkillChecklistResponse,
    (skillChecklistResponse) => skillChecklistResponse.provider,
  )
  skill_checklist_response: SkillChecklistResponse[];

  @OneToMany(
    () => CompetencyTestScore,
    (competencyTestScore) => competencyTestScore.provider,
  )
  provider: CompetencyTestScore[];

  @OneToMany(() => ShiftRequest, (request) => request.provider)
  requested_shift: ShiftRequest[];

  @OneToMany(() => Shift, (shift) => shift.provider)
  shift: Shift[];

  @OneToMany(() => ShiftInvitation, (invitation) => invitation.provider)
  shift_invitation: ShiftInvitation[];

  @OneToMany(() => ReferFacility, (refer) => refer.provider)
  refer_facility: ReferFacility[];

  @OneToMany(
    () => UserNotification,
    (user_notification) => user_notification.provider,
  )
  user_notification: UserNotification[];

  @Column({ type: 'jsonb', nullable: true })
  availability_status: JSON;

  @OneToMany(
    () => ProviderSavedFacility,
    (providerSavedFacility) => providerSavedFacility.provider,
  )
  provider_saved_facility: ProviderSavedFacility[];

  @OneToMany(
    () => ProviderCredential,
    (providerCredential) => providerCredential.provider,
  )
  credentials: ProviderCredential[];

  @Column({
    type: 'enum',
    enum: USER_STATUS,
    default: USER_STATUS.new,
  })
  profile_status: USER_STATUS;

  @ManyToOne(() => ProviderRejectReason, (reason) => reason.provider)
  @JoinColumn({ name: 'reason_id' })
  reason: ProviderRejectReason;

  @Column({ type: 'text', nullable: true })
  reason_description: string;

  @OneToMany(
    () => FacilityProvider,
    (facilityProvider) => facilityProvider.provider,
  )
  facility_provider: FacilityProvider[];

  @OneToOne(
    () => ProviderAnalytics,
    (providerAnalytics) => providerAnalytics.provider,
  )
  provider_analytics: ProviderAnalytics;

  @OneToMany(() => EDocResponse, (eDocResponse) => eDocResponse.provider)
  e_doc_response: EDocResponse[];

  @Column({ type: 'integer', default: 0 })
  login_attempt: number;

  @Column({ type: 'timestamptz', nullable: true })
  login_attempt_at: Date;

  @Column({ type: 'decimal', default: 0 })
  checklist_completion_ratio: number;

  @Column({ type: 'decimal', default: 0 })
  credentials_completion_ratio: number;

  @Column({ type: 'integer', default: 0 })
  test_attempts: number;

  @Column({ type: 'timestamptz', nullable: true })
  test_date: Date;

  @OneToMany(
    () => ProviderCancelledShift,
    (providerCancelledShift) => providerCancelledShift.provider,
  )
  provider_cancelled_shifts: ProviderCancelledShift[];

  @OneToMany(() => VoidShift, (voidShift) => voidShift.shift)
  void_shift: VoidShift[];

  @OneToMany(
    () => ProviderNotificationSetting,
    (providerNotificationSetting) => providerNotificationSetting.provider,
  )
  provider_notification_setting: ProviderNotificationSetting[];

  @OneToMany(
    () => ProviderEvaluation,
    (providerEvaluation) => providerEvaluation.provider,
  )
  provider_evaluation: ProviderEvaluation[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'decimal', default: 0 })
  profile_progress: number;

  @Column({ type: 'boolean', default: false })
  is_payment_setup_completed: boolean;

  @OneToMany(() => Disbursement, (disbursement) => disbursement.provider)
  disbursements: Disbursement[];
}
