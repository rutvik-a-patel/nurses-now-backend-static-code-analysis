import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@/shared/entity/base.entity';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { FacilityUser } from './facility-user.entity';
import { FacilityPermission } from './facility-permission.entity';

@Entity()
export class FacilityUserPermission extends BaseEntity {
  @Column({ type: 'boolean' })
  has_access: boolean;

  @Column({
    type: 'enum',
    enum: [DEFAULT_STATUS.active, DEFAULT_STATUS.in_active],
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @ManyToOne(() => FacilityUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facility_user_id' })
  facility_user: FacilityUser;

  @ManyToOne(() => FacilityPermission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facility_permission_id' })
  facility_permission: FacilityPermission;
}
