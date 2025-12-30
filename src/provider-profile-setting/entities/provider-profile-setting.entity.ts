import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { ProviderProfileSettingSection } from './provider-profile-setting-section.entity';

@Entity()
export class ProviderProfileSetting extends BaseEntity {
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

  @OneToMany(
    () => ProviderProfileSettingSection,
    (providerProfileSettingSection) =>
      providerProfileSettingSection.profile_setting,
  )
  section: ProviderProfileSettingSection[];
}
