import { FacilityHoliday } from '@/facility-holiday/entities/facility-holiday.entity';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class HolidayGroup extends BaseEntity {
  @Column({ type: 'character varying', nullable: false })
  name: string;

  @Column({ type: 'date', nullable: false })
  start_date: string;

  @Column({ type: 'date', nullable: false })
  end_date: string;

  @Column({ type: 'time', nullable: false })
  start_time: string;

  @Column({ type: 'time', nullable: false })
  end_time: string;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @OneToMany(
    () => FacilityHoliday,
    (facilityHoliday) => facilityHoliday.holiday_group,
  )
  facility_holiday: FacilityHoliday[];
}
