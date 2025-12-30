import { Facility } from '@/facility/entities/facility.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { TABLE } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { EvaluationResponse } from './evaluation-response.entity';

@Entity()
export class ProviderEvaluation extends BaseEntity {
  @Index()
  @ManyToOne(() => Provider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Index()
  @ManyToOne(() => Facility, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({
    type: 'enum',
    enum: [TABLE.admin, TABLE.facility, TABLE.facility_user],
    nullable: false,
  })
  evaluated_by: Exclude<TABLE, TABLE.provider>;

  @Index()
  @Column({ type: 'uuid', nullable: false })
  evaluated_by_id: string;

  @OneToMany(
    () => EvaluationResponse,
    (evaluationResponse) => evaluationResponse.provider_evaluation,
    {
      cascade: true,
    },
  )
  evaluation_response: EvaluationResponse[];
}
