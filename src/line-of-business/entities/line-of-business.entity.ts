import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '@/shared/entity/base.entity';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { Facility } from '@/facility/entities/facility.entity';

@Entity()
export class LineOfBusiness extends BaseEntity {
  @Column({ type: 'character varying', nullable: false })
  name: string;

  @Column({ type: 'character varying', nullable: false })
  work_comp_code: string;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @OneToMany(() => Facility, (facility) => facility.facility_type)
  facility_id: Facility[];
}
