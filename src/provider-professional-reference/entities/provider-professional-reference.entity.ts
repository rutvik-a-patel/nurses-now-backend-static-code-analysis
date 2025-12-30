import { ProfessionalReferenceRejectReason } from '@/professional-reference-reject-reason/entities/professional-reference-reject-reason.entity';
import { Provider } from '@/provider/entities/provider.entity';
import {
  ProfessionalReferenceStatus,
  SEND_FORM_BY,
} from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class ProviderProfessionalReference extends BaseEntity {
  @Column({ type: 'character varying', nullable: true })
  employer: string;

  @Column({ type: 'character varying', nullable: true })
  name: string;

  @Column({ type: 'character varying', nullable: true })
  title: string;

  @Column({ type: 'character varying', nullable: true })
  email: string;

  @Column({ type: 'character varying', length: 5, nullable: true })
  country_code: string;

  @Column({ type: 'character varying', length: 15, nullable: true })
  mobile_no: string;

  @Column({ type: 'date', nullable: true })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date: Date;

  @Column({
    type: 'enum',
    enum: SEND_FORM_BY,
    nullable: true,
  })
  send_form_by: SEND_FORM_BY;

  @ManyToOne(() => Provider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Column({
    type: 'enum',
    enum: ProfessionalReferenceStatus,
    nullable: true,
    default: ProfessionalReferenceStatus.awaiting_response,
  })
  status: ProfessionalReferenceStatus;

  @Column({ type: 'integer', default: 0 })
  total_reminder_sent: number;

  @ManyToOne(() => ProfessionalReferenceRejectReason, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reason_id' })
  reason: ProfessionalReferenceRejectReason;

  @Column({ type: 'text', nullable: true })
  reason_description: string;
}
