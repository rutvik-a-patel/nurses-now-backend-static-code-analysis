import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ProviderAcknowledgement } from './provider-acknowledgement.entity';
import { ProviderGeneralSettingSubSection } from '@/provider-general-setting/entities/provider-general-setting-sub-section.entity';

@Entity()
export class SubAcknowledgement extends BaseEntity {
  @ManyToOne(() => ProviderGeneralSettingSubSection, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'general_setting_sub_section_id' })
  generalSettingSubSection: ProviderGeneralSettingSubSection;

  @Column({ type: 'boolean' })
  response: boolean;

  @Column({ type: 'character varying', nullable: true })
  remark: string;

  @ManyToOne(() => ProviderAcknowledgement, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_acknowledgement_id' })
  provider_acknowledgement: ProviderAcknowledgement;
}
