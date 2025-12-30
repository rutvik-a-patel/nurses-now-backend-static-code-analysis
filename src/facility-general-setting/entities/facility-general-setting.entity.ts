import { FACILITY_GENERAL_SETTING_TYPE } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class FacilityGeneralSetting extends BaseEntity {
  @Column({
    type: 'enum',
    enum: FACILITY_GENERAL_SETTING_TYPE,
    nullable: false,
  })
  type: FACILITY_GENERAL_SETTING_TYPE;

  @Column({ type: 'character varying', nullable: false })
  label: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;
}
