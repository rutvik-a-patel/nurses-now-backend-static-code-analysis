import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@/shared/entity/base.entity';

@Entity()
export class ScheduleRequestSetting extends BaseEntity {
  @Column({ type: 'character varying', nullable: false })
  setting: string;

  @Column({ type: 'character varying', nullable: false })
  value: string;

  @Column({ type: 'integer', default: 0 })
  order: number;
}
