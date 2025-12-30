import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class BadgeSetting extends BaseEntity {
  @Column({ type: 'character varying' })
  name: string;

  @Column({ type: 'integer', default: 0 })
  attendance_score: number;

  @Column({ type: 'integer', default: 0 })
  on_time_threshold: number;

  @Column({ type: 'integer', default: 0 })
  show_up_rate: number;
}
