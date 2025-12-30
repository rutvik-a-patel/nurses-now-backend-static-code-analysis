import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from '@/shared/entity/base.entity';
import { ENTITY_STATUS } from '@/shared/constants/enum';
import { Token } from '@/token/entities/token.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { FacilityUserPermission } from './facility-user-permission.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { UserNotification } from '@/user-notification/entities/user-notification.entity';
import { FloorDetail } from '@/floor-detail/entities/floor-detail.entity';

@Entity()
export class FacilityUser extends BaseEntity {
  @Column({ type: 'character varying' })
  email: string;

  @Column({ type: 'character varying', nullable: true, length: 5 })
  country_code: string;

  @Column({
    type: 'character varying',
    nullable: true,
    length: 15,
  })
  mobile_no: string;

  @Column({ type: 'character varying', nullable: true, length: 15 })
  phone_no: string;

  @Column({ type: 'character varying', nullable: true })
  extension?: string;

  @Column({ type: 'character varying', nullable: true })
  password: string;

  @Column({ type: 'character varying' })
  first_name: string;

  @Column({ type: 'character varying' })
  last_name: string;

  @Column({ type: 'boolean', default: false })
  is_email_verified: boolean;

  @Column({ type: 'character varying', nullable: true })
  base_url: string;

  @Column({ type: 'character varying', nullable: true })
  image: string;

  @Column({ type: 'character varying', nullable: true })
  signature: string;

  @Column({
    type: 'enum',
    enum: ENTITY_STATUS,
    default: ENTITY_STATUS.in_active,
  })
  status: ENTITY_STATUS;

  @OneToMany(() => Token, (token) => token.facility_user)
  token: Token[];

  @ManyToMany(() => Facility, (facility) => facility.assign_to)
  facility_assign_to: Facility[];

  @Column('uuid', { array: true, default: [] })
  facility_id: string[];

  @OneToMany(
    () => FacilityUserPermission,
    (facility_user_permission) => facility_user_permission.facility_user,
  )
  facility_user: FacilityUserPermission[];

  @OneToMany(() => Shift, (shift) => shift.follower)
  shift_followers: Shift[];

  @OneToMany(
    () => UserNotification,
    (user_notification) => user_notification.facility_user,
  )
  user_notification: UserNotification[];

  @OneToMany(() => FloorDetail, (floor) => floor.default_order_contact)
  floor_detail: FloorDetail[];

  @OneToMany(() => FloorDetail, (floor) => floor.client_contact)
  floor_bill_contact: FloorDetail[];

  @Column({ type: 'integer', default: 0 })
  login_attempt: number;

  @Column({ type: 'timestamptz', nullable: true })
  login_attempt_at: Date;

  @OneToOne(
    () => Facility,
    (for_facility) => for_facility.super_facility_user,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'primary_facility_id' })
  primary_facility: Facility;

  @Column({ type: 'character varying', nullable: true })
  title: string;

  @Column({ type: 'boolean', default: false })
  hide_inactive_contacts: boolean;
}
