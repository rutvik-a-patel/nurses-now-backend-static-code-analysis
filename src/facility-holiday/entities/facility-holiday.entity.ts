import { Facility } from '@/facility/entities/facility.entity';
import { HolidayGroup } from '@/holiday-group/entities/holiday-group.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@/shared/entity/base.entity';
import { DEFAULT_STATUS } from '@/shared/constants/enum';

@Entity()
export class FacilityHoliday extends BaseEntity {
  @Column({ type: 'character varying', nullable: true })
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

  @ManyToOne(() => Facility, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facility_id' })
  @Index()
  facility: Facility;

  @ManyToOne(() => HolidayGroup, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'holiday_group_id' })
  @Index()
  holiday_group: HolidayGroup;
}
