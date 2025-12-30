import { BaseEntity } from '@/shared/entity/base.entity';
import { Entity, Column } from 'typeorm';

@Entity()
export class ReferenceFormGlobalSetting extends BaseEntity {
  @Column({ type: 'integer', default: 3 }) // deafult to 3 times
  total_reminder_attempts: number;

  @Column({ type: 'integer', default: 1 }) // deafult to 1 day
  reminder_interval: number;
}
