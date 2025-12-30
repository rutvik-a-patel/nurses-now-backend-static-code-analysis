import { Facility } from '@/facility/entities/facility.entity';
import { DAYS_OF_WEEK } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { RateSheet } from './rate-sheet.entity';

@Entity('rate_groups')
export class RateGroup extends BaseEntity {
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  holiday_pay: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  holiday_bill: number;

  @Column({ type: 'enum', enum: DAYS_OF_WEEK, default: DAYS_OF_WEEK.friday })
  weekend_pay_start_day: DAYS_OF_WEEK;

  @Column({ type: 'time', default: '00:00:00' })
  weekend_pay_start_time: string;

  @Column({ type: 'enum', enum: DAYS_OF_WEEK, default: DAYS_OF_WEEK.sunday })
  weekend_pay_end_day: DAYS_OF_WEEK;

  @Column({ type: 'time', default: '00:00:00' })
  weekend_pay_end_time: string;

  @Column({ type: 'enum', enum: DAYS_OF_WEEK, default: DAYS_OF_WEEK.friday })
  weekend_bill_start_day: DAYS_OF_WEEK;

  @Column({ type: 'time', default: '00:00:00' })
  weekend_bill_start_time: string;

  @Column({ type: 'enum', enum: DAYS_OF_WEEK, default: DAYS_OF_WEEK.friday })
  weekend_bill_end_day: DAYS_OF_WEEK;

  @Column({ type: 'time', default: '00:00:00' })
  weekend_bill_end_time: string;

  @Column({ type: 'boolean', default: false })
  allow_overtime: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  overtime_bill_after_hours: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  overtime_bill_calculation: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  overtime_pay_calculation: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  premium_pay: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  premium_bill: number;

  @Index()
  @OneToOne(() => Facility, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;

  @OneToMany(() => RateSheet, (rateSheet) => rateSheet.rate_group, {
    cascade: true,
  })
  rate_sheets: RateSheet[];
}
