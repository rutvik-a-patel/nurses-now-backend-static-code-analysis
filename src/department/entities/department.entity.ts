import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Department extends BaseEntity {
  @Column({ type: 'character varying', nullable: true })
  name: string;

  @Column({ type: 'character varying', nullable: true })
  base_url: string;

  @Column({ type: 'character varying', nullable: true })
  image: string;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @Column('uuid', { array: true, default: [] })
  members: string[];
}
