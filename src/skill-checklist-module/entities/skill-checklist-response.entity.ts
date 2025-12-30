import { Provider } from '@/provider/entities/provider.entity';
import { CHECKLIST_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { SkillChecklistTemplate } from '@/skill-checklist-template/entities/skill-checklist-template.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { SkillChecklistAnswer } from './skill-checklist-answers.entity';

@Entity()
export class SkillChecklistResponse extends BaseEntity {
  @ManyToOne(() => Provider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Column({ type: 'character varying' })
  name: string;

  @ManyToOne(() => SkillChecklistTemplate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skill_checklist_template_id' })
  skill_checklist_template: SkillChecklistTemplate;

  @Column({
    type: 'enum',
    enum: CHECKLIST_STATUS,
    default: CHECKLIST_STATUS.pending,
  })
  status: CHECKLIST_STATUS;

  @OneToMany(
    () => SkillChecklistAnswer,
    (skillChecklistAnswer) => skillChecklistAnswer.skill_checklist_response,
  )
  skill_checklist_answers: SkillChecklistAnswer[];
}
