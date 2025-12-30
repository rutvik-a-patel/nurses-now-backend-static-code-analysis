import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '@/shared/entity/base.entity';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { FacilityUserPermission } from './facility-user-permission.entity';

@Entity()
export class FacilityPermission extends BaseEntity {
  @Column({ type: 'character varying' })
  name: string;

  @Column({
    type: 'enum',
    enum: [DEFAULT_STATUS.active, DEFAULT_STATUS.in_active],
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @OneToMany(
    () => FacilityUserPermission,
    (facility_user_permission) => facility_user_permission.facility_permission,
  )
  facility_permission: FacilityUserPermission[];
}
