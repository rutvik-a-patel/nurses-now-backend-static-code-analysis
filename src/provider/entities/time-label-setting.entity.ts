import { BaseEntity } from '@/shared/entity/base.entity';
import { Entity, Column } from 'typeorm';

@Entity()
export class TimeLabelSetting extends BaseEntity {
  @Column({ type: 'character varying', length: 1, nullable: false })
  time_code: string;

  @Column({ type: 'character varying', nullable: false })
  label: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;
}
