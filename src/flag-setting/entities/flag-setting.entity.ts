import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class FlagSetting extends BaseEntity {
  @Column({ type: 'character varying' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'character varying' })
  color: string;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @Column({ type: 'boolean', default: false })
  is_default: boolean;

  // @OneToMany(
  //   () => FacilityProvider,
  //   (facilityProvider) => facilityProvider.flag,
  // )
  // facility_provider: FacilityProvider[];
}
