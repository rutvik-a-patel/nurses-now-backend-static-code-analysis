import { Column, Entity, OneToMany } from 'typeorm';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Timecard } from '@/timecards/entities/timecard.entity';

@Entity()
export class TimecardRejectReason extends BaseEntity {
  @Column({ type: 'character varying', nullable: false })
  reason: string;

  @Column({
    type: 'enum',
    enum: [DEFAULT_STATUS.active, DEFAULT_STATUS.in_active],
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @OneToMany(() => Timecard, (timecard) => timecard.timecard_reject_reason)
  timecards: Timecard[];
}
