import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Timecard } from './timecard.entity';

@Entity('time_sheets')
export class TimeSheets extends BaseEntity {
  @Column({ type: 'character varying', nullable: true })
  base_url: string;

  @Column({ type: 'character varying', nullable: true })
  image: string;

  @ManyToOne(() => Timecard, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'timecard_id' })
  timecard: Timecard;
}
