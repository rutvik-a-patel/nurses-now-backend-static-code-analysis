import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { SkillChecklistModule } from './skill-checklist-module.entity';
import { SkillChecklistQuestion } from '@/skill-checklist-module/entities/skill-checklist-question.entity';

@Entity()
export class SkillChecklistSubModule extends BaseEntity {
  @Column({ type: 'character varying' })
  name: string;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @ManyToOne(() => SkillChecklistModule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skill_checklist_module_id' })
  skill_checklist_module: SkillChecklistModule;

  @OneToMany(
    () => SkillChecklistQuestion,
    (skillChecklistQuestion) =>
      skillChecklistQuestion.skill_checklist_sub_module,
    { cascade: true },
  )
  skill_checklist_question: SkillChecklistQuestion[];
}
