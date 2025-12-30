import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Entity, Column } from 'typeorm';

@Entity()
export class Tag extends BaseEntity {
  @Column({ type: 'character varying', nullable: false, unique: true })
  name: string;

  @Column({ type: 'character varying', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;
}
