import { ProviderProfessionalReference } from '@/provider-professional-reference/entities/provider-professional-reference.entity';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Entity, Column, OneToMany } from 'typeorm';

@Entity()
export class ProfessionalReferenceRejectReason extends BaseEntity {
  @Column({ type: 'character varying' })
  reason: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @OneToMany(() => ProviderProfessionalReference, (reason) => reason.reason)
  provider_professional_reference: ProviderProfessionalReference[];
}
