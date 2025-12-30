import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '@/shared/entity/base.entity';
import {
  ALLOWED_ENTRIES,
  TIMECARD_ROUNDING_DIRECTION,
  TIME_APPROVAL_METHOD,
} from '@/shared/constants/enum';
import { Facility } from './facility.entity';

@Entity()
export class TimeEntrySetting extends BaseEntity {
  @Column({ type: 'integer', default: 0 })
  timecard_rounding: number;

  @Column({
    type: 'enum',
    enum: TIMECARD_ROUNDING_DIRECTION,
    default: TIMECARD_ROUNDING_DIRECTION.standard,
  })
  timecard_rounding_direction: TIMECARD_ROUNDING_DIRECTION;

  @Column({ type: 'integer', default: 0 })
  default_lunch_duration: number;

  @Column({
    type: 'enum',
    enum: TIME_APPROVAL_METHOD,
    default: TIME_APPROVAL_METHOD.signed_timecard,
  })
  time_approval_method: TIME_APPROVAL_METHOD;

  @Column({
    type: 'enum',
    enum: ALLOWED_ENTRIES,
    array: true,
    default: null,
  })
  allowed_entries: ALLOWED_ENTRIES[];

  @Column({ type: 'boolean', default: true })
  check_missed_meal_break: boolean;

  @Column({ type: 'text', nullable: true })
  location: string;

  @Column({ type: 'boolean', default: true })
  enforce_geo_fence: boolean;

  @Column({ type: 'integer', default: 0 })
  geo_fence_radius: number;

  @Index()
  @OneToOne(() => Facility, (facility) => facility.time_entry_setting, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;
}
