import { Admin } from '@/admin/entities/admin.entity';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class FacilityNote extends BaseEntity {
  @ManyToOne(() => Admin, (admin) => admin.facility)
  @JoinColumn({ name: 'created_by_id' })
  created_by_id: Admin;

  @Column({ type: 'date' })
  date: string;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @Column({ type: 'uuid', array: true, nullable: true })
  tags: string[];

  @Column({ type: 'character varying', nullable: true })
  description: string;

  @Column({ type: 'uuid', array: true, nullable: true })
  relates_to: string[];
}
