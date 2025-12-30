import { CompetencyTestQuestion } from '@/competency-test-question/entities/competency-test-question.entity';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class CompetencyTestOption extends BaseEntity {
  @Column({ type: 'character varying' })
  option: string;

  @Column({ type: 'integer' })
  order: number;

  @Column({ type: 'boolean', default: false })
  is_answer: boolean;

  @ManyToOne(() => CompetencyTestQuestion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'competency_test_question_id' })
  competency_test_question: CompetencyTestQuestion;
}
