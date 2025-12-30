import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '@/shared/entity/base.entity';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { Admin } from '@/admin/entities/admin.entity';
import { RoleSectionPermission } from '@/role-section-permission/entities/role-section-permission.entity';

@Entity()
export class Role extends BaseEntity {
  @Column({
    type: 'enum',
    enum: [DEFAULT_STATUS.active, DEFAULT_STATUS.in_active],
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @Column({ type: 'character varying' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => Admin, (admin) => admin.role)
  admin: Admin[];

  @OneToMany(
    () => RoleSectionPermission,
    (role_section_permission) => role_section_permission.role,
  )
  role_section_permission: RoleSectionPermission[];
}
