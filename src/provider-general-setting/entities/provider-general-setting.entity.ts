import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { ProviderGeneralSettingSection } from './provider-general-setting-section.entity';

@Entity()
export class ProviderGeneralSetting extends BaseEntity {
  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @OneToMany(
    () => ProviderGeneralSettingSection,
    (providerGeneralSettingSection) =>
      providerGeneralSettingSection.general_setting,
  )
  section: ProviderGeneralSettingSection[];
}
