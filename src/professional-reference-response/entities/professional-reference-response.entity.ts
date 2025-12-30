import { ProviderProfessionalReference } from '@/provider-professional-reference/entities/provider-professional-reference.entity';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';

@Entity()
export class ProfessionalReferenceResponse extends BaseEntity {
  @ManyToOne(() => ProviderProfessionalReference, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_professional_reference_id' })
  provider_professional_reference: ProviderProfessionalReference;

  @Column({ type: 'character varying', nullable: true })
  question: string;

  @Column({ type: 'character varying', nullable: true })
  answer: string;
}
