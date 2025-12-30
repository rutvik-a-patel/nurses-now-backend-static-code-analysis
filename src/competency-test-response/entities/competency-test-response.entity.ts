import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CompetencyTestScore } from './competency-test-score.entity';

@Entity()
export class CompetencyTestResponse extends BaseEntity {
  @Column({ type: 'character varying' })
  question: string;

  @Column({ type: 'character varying' })
  option_one: string;

  @Column({ type: 'character varying' })
  option_two: string;

  @Column({ type: 'character varying', nullable: true })
  option_three: string;

  @Column({ type: 'character varying', nullable: true })
  option_four: string;

  @Column({ type: 'character varying' })
  correct_answer: string;

  @Column({ type: 'character varying', nullable: true })
  answer: string;

  @Column({ type: 'boolean', default: false })
  is_correct: boolean;

  @ManyToOne(() => CompetencyTestScore, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'competency_test_score_id' })
  competency_test_score: CompetencyTestScore;
}
