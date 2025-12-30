import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class TimeEntryApproval extends BaseEntity {
  @Column({ type: 'character varying', nullable: false })
  key: string;

  @Column({ type: 'character varying', nullable: false })
  name: string;

  @Column({ type: 'character varying', nullable: false })
  value: string;

  @Column({ type: 'integer', default: 0 })
  order: number;
}
