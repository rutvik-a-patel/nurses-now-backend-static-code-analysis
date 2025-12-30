import { DEFAULT_STATUS, DNR_TYPE } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class DnrReason extends BaseEntity {
  @Column({ type: 'character varying', nullable: false })
  reason: string;

  @Column({ type: 'enum', enum: DNR_TYPE, nullable: false })
  reason_type: DNR_TYPE;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;
}
