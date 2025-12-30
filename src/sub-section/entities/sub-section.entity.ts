import { RoleSectionPermission } from '@/role-section-permission/entities/role-section-permission.entity';
import { Section } from '@/section/entities/section.entity';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class SubSection extends BaseEntity {
  @Column({ type: 'character varying' })
  name: string;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @ManyToOne(() => Section, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'section_id' })
  section: Section;

  @OneToMany(
    () => RoleSectionPermission,
    (role_section_permission) => role_section_permission.section,
  )
  role_section_permission: RoleSectionPermission[];
}
