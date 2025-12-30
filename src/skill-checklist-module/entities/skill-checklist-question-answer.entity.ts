import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { SkillChecklistAnswerModule } from './skill-checklist-answer-module.entity';

@Entity()
export class SkillChecklistQuestionAnswer extends BaseEntity {
  @Column({ type: 'character varying' })
  question: string;

  @Column({ type: 'integer', nullable: true })
  answer: number;

  @Column({ type: 'integer' })
  order: number;

  @ManyToOne(() => SkillChecklistAnswerModule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skill_checklist_answer_module_id' })
  skill_checklist_answer_module: SkillChecklistAnswerModule;
}
