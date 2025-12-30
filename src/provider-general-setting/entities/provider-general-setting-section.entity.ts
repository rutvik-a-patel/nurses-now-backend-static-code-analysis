import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { ProviderGeneralSetting } from './provider-general-setting.entity';
import { ProviderGeneralSettingSubSection } from './provider-general-setting-sub-section.entity';

@Entity()
export class ProviderGeneralSettingSection extends BaseEntity {
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

  @OneToMany(
    () => ProviderGeneralSettingSubSection,
    (providerGeneralSettingSubSection) =>
      providerGeneralSettingSubSection.section,
  )
  sub_section: ProviderGeneralSettingSubSection[];

  @ManyToOne(() => ProviderGeneralSetting, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_general_setting_id' })
  general_setting: ProviderGeneralSetting;
}
