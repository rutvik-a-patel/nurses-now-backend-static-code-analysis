import { CompetencyTestSetting } from '@/competency-test-setting/entities/competency-test-setting.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { TEST_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { CompetencyTestResponse } from './competency-test-response.entity';

@Entity()
export class CompetencyTestScore extends BaseEntity {
  @Column({ type: 'decimal', default: 0 })
  score: number;

  @Column({
    type: 'enum',
    enum: TEST_STATUS,
    default: TEST_STATUS.pending,
  })
  test_status: TEST_STATUS;

  @ManyToOne(() => Provider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Column({ type: 'character varying' })
  name: string;

  @ManyToOne(() => CompetencyTestSetting, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'competency_test_setting_id' })
  competency_test_setting: CompetencyTestSetting;

  @Column({ type: 'decimal', default: 0 })
  required_score: number;

  @Column({ type: 'int', default: 0 })
  total_questions: number;

  @Column({ type: 'character varying' })
  duration: string;

  @OneToMany(
    () => CompetencyTestResponse,
    (competencyTestResponse) => competencyTestResponse.competency_test_score,
  )
  competency_test_response: CompetencyTestResponse[];
}
