import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { CompetencyTestSetting } from './competency-test-setting.entity';
import { EXPIRATION_DURATION_TYPE } from '@/shared/constants/enum';

@Entity()
export class CompetencyTestGlobalSetting extends BaseEntity {
  @Column({ type: 'integer', default: 1 })
  expires_in: number;

  @Column({
    type: 'enum',
    enum: EXPIRATION_DURATION_TYPE,
    default: EXPIRATION_DURATION_TYPE.year,
  })
  expiration_duration_type: EXPIRATION_DURATION_TYPE;

  @Column({ type: 'integer', default: 3 })
  total_attempts: number;

  @Column({ type: 'integer', default: 365 })
  reassignment_duration: number;

  @Column({
    type: 'enum',
    enum: EXPIRATION_DURATION_TYPE,
    default: EXPIRATION_DURATION_TYPE.day,
  })
  reassignment_duration_type: EXPIRATION_DURATION_TYPE;

  @OneToOne(
    () => CompetencyTestSetting,
    (competencyTestSetting) => competencyTestSetting.test_setting,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'competency_test_setting_id' })
  competency_test_setting: CompetencyTestSetting;
}
