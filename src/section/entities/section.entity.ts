import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '@/shared/entity/base.entity';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { RoleSectionPermission } from '@/role-section-permission/entities/role-section-permission.entity';
import { SubSection } from '@/sub-section/entities/sub-section.entity';

@Entity()
export class Section extends BaseEntity {
  @Column({ type: 'character varying' })
  name: string;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @OneToMany(
    () => RoleSectionPermission,
    (role_section_permission) => role_section_permission.section,
  )
  role_section_permission: RoleSectionPermission[];

  @OneToMany(() => SubSection, (sub_section) => sub_section.section)
  sub_section: SubSection[];
}
