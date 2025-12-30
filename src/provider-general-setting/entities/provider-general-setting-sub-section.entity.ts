import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { ProviderGeneralSettingSection } from './provider-general-setting-section.entity';
import { SubAcknowledgement } from '@/provider-acknowledgement/entities/sub-acknowledgement.entity';

@Entity()
export class ProviderGeneralSettingSubSection extends BaseEntity {
  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @Column({ type: 'character varying' })
  name: string;

  @Column({ type: 'character varying' })
  key: string;

  @Column({ type: 'integer' })
  order: number;

  @Column({ type: 'boolean', default: false })
  has_remark: boolean;

  @Column({ type: 'character varying', nullable: true })
  placeholder: string;

  @Column({ type: 'character varying', nullable: true })
  instruction: string;

  @Column({ type: 'character varying', nullable: true })
  type: string;

  @ManyToOne(() => ProviderGeneralSettingSection, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_general_setting_section_id' })
  section: ProviderGeneralSettingSection;

  @OneToMany(
    () => SubAcknowledgement,
    (subAcknowledgement) => subAcknowledgement.generalSettingSubSection,
  )
  subAcknowledgement: SubAcknowledgement[];
}
