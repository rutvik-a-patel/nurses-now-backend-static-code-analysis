import { Documents } from '@/documents/entities/documents.entity';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class OrientationRejectReason extends BaseEntity {
  @Column({ type: 'character varying', nullable: false })
  reason: string;

  @Column({ type: 'character varying', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @OneToMany(() => Documents, (document) => document.reason)
  provider_orientation: Documents[];
}
