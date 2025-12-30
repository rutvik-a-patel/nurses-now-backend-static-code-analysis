import { CompetencyTestOption } from '@/competency-test-option/entities/competency-test-option.entity';
import { CompetencyTestSetting } from '@/competency-test-setting/entities/competency-test-setting.entity';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class CompetencyTestQuestion extends BaseEntity {
  @Column({ type: 'character varying' })
  question: string;

  @Column({ type: 'integer' })
  order: number;

  @ManyToOne(() => CompetencyTestSetting, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'competency_test_setting_id' })
  competency_test_setting: CompetencyTestSetting;

  @OneToMany(
    () => CompetencyTestOption,
    (competencyTestOption) => competencyTestOption.competency_test_question,
  )
  competency_test_option: CompetencyTestOption[];
}
