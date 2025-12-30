import { Entity } from 'typeorm';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, JoinColumn, ManyToOne } from 'typeorm';
import { Permission } from '@/permission/entities/permission.entity';
import { Role } from '@/role/entities/role.entity';
import { Section } from '@/section/entities/section.entity';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { SubSection } from '@/sub-section/entities/sub-section.entity';

@Entity()
export class RoleSectionPermission extends BaseEntity {
  @Column({
    type: 'enum',
    enum: [DEFAULT_STATUS.active, DEFAULT_STATUS.in_active],
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => SubSection, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sub_section_id' })
  sub_section: SubSection;

  @ManyToOne(() => Section, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'section_id' })
  section: Section;

  @ManyToOne(() => Permission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;

  @Column({
    type: 'boolean',
    default: false,
  })
  has_access: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  is_default: boolean;
}
