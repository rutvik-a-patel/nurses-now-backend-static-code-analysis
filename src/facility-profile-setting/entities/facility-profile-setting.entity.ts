import {
  DEFAULT_STATUS,
  FACILITY_PROFILE_SECTION,
} from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class FacilityProfileSetting extends BaseEntity {
  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @Column({ type: 'boolean', default: true })
  is_required: boolean;

  @Column({ type: 'enum', enum: FACILITY_PROFILE_SECTION, nullable: false })
  section: FACILITY_PROFILE_SECTION;

  @Column({ type: 'character varying' })
  name: string;

  @Column({ type: 'character varying' })
  key: string;

  @Column({ type: 'character varying', nullable: true })
  placeholder: string;

  @Column({ type: 'character varying', nullable: true })
  type: string;

  @Column({ type: 'integer', default: 0 })
  order: number;
}
