import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { SkillChecklistResponse } from './skill-checklist-response.entity';
import { SkillChecklistAnswerModule } from './skill-checklist-answer-module.entity';

@Entity()
export class SkillChecklistAnswer extends BaseEntity {
  @Column({ type: 'character varying' })
  module: string;

  @ManyToOne(() => SkillChecklistResponse, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skill_checklist_response_id' })
  skill_checklist_response: SkillChecklistResponse;

  @Column({ type: 'integer' })
  order: number;

  @OneToMany(
    () => SkillChecklistAnswerModule,
    (skillChecklistAnswerModule) =>
      skillChecklistAnswerModule.skill_checklist_answer,
  )
  skill_checklist_answer_module: SkillChecklistAnswerModule[];
}
