import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '@/shared/entity/base.entity';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { RoleSectionPermission } from '@/role-section-permission/entities/role-section-permission.entity';

@Entity()
export class Permission extends BaseEntity {
  @Column({ type: 'character varying' })
  name: string;

  @Column({
    type: 'enum',
    enum: [DEFAULT_STATUS.active, DEFAULT_STATUS.in_active],
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @OneToMany(
    () => RoleSectionPermission,
    (role_section_permission) => role_section_permission.permission,
  )
  role_section_permission: RoleSectionPermission[];
}
