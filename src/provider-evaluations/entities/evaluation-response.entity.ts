import { EvaluationType } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ProviderEvaluation } from './provider-evaluation.entity';

@Entity()
export class EvaluationResponse extends BaseEntity {
  @Column({ type: 'enum', nullable: false, enum: EvaluationType })
  type: EvaluationType;

  @Column({ type: 'smallint', nullable: false })
  value: number;

  @Index()
  @ManyToOne(() => ProviderEvaluation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_evaluation_id' })
  provider_evaluation: ProviderEvaluation;
}
