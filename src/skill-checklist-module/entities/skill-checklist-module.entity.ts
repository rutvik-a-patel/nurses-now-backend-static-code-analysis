import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { SkillChecklistTemplate } from '@/skill-checklist-template/entities/skill-checklist-template.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { SkillChecklistSubModule } from './skill-checklist-sub-module.entity';
@Entity()
export class SkillChecklistModule extends BaseEntity {
  @Column({ type: 'character varying' })
  name: string;

  @Column({ type: 'integer' })
  order: number;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @ManyToOne(() => SkillChecklistTemplate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skill_checklist_template_id' })
  skill_checklist_template: SkillChecklistTemplate;

  @OneToMany(
    () => SkillChecklistSubModule,
    (SkillChecklistSubModule) => SkillChecklistSubModule.skill_checklist_module,
    { cascade: true },
  )
  skill_checklist_sub_module: SkillChecklistSubModule[];
}
