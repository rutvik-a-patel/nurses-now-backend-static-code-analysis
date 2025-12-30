import { CompetencyTestQuestion } from '@/competency-test-question/entities/competency-test-question.entity';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { CompetencyTestGlobalSetting } from './competency-test-global-setting.entity';
import { CompetencyTestScore } from '@/competency-test-response/entities/competency-test-score.entity';

@Entity()
export class CompetencyTestSetting extends BaseEntity {
  @Column({ type: 'character varying' })
  name: string;

  @Column({ type: 'decimal', default: 0 })
  required_score: number;

  @Column({ type: 'character varying' })
  duration: string;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @OneToMany(
    () => CompetencyTestQuestion,
    (competencyTestQuestion) => competencyTestQuestion.competency_test_setting,
  )
  competency_test_question: CompetencyTestQuestion[];

  @OneToMany(
    () => CompetencyTestQuestion,
    (competencyTestQuestion) => competencyTestQuestion.competency_test_setting,
  )
  competency_test_setting: CompetencyTestQuestion[];

  @OneToMany(
    () => CompetencyTestScore,
    (competencyTestScore) => competencyTestScore.competency_test_setting,
  )
  competency_test_score: CompetencyTestScore[];

  @OneToOne(
    () => CompetencyTestGlobalSetting,
    (competencyTestGlobalSetting) =>
      competencyTestGlobalSetting.competency_test_setting,
  )
  test_setting: CompetencyTestGlobalSetting;
}
