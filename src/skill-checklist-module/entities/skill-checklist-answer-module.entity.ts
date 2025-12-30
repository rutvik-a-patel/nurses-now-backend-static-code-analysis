import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { SkillChecklistAnswer } from './skill-checklist-answers.entity';
import { SkillChecklistQuestionAnswer } from './skill-checklist-question-answer.entity';

@Entity()
export class SkillChecklistAnswerModule extends BaseEntity {
  @Column({ type: 'character varying' })
  sub_module: string;

  @ManyToOne(() => SkillChecklistAnswer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skill_checklist_answer_id' })
  skill_checklist_answer: SkillChecklistAnswer;

  @OneToMany(
    () => SkillChecklistQuestionAnswer,
    (skillChecklistQuestionAnswer) =>
      skillChecklistQuestionAnswer.skill_checklist_answer_module,
  )
  skill_checklist_question_answer: SkillChecklistQuestionAnswer[];
}
