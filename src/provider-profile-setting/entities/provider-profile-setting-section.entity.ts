import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ProviderProfileSetting } from './provider-profile-setting.entity';
import { ProviderProfileSettingSubSection } from './provider-profile-setting-sub-section.entity';
import { BaseEntity } from '@/shared/entity/base.entity';

@Entity()
export class ProviderProfileSettingSection extends BaseEntity {
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
    () => ProviderProfileSettingSubSection,
    (providerProfileSettingSubSection) =>
      providerProfileSettingSubSection.section,
  )
  sub_section: ProviderProfileSettingSubSection[];

  @ManyToOne(() => ProviderProfileSetting, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_profile_setting_id' })
  profile_setting: ProviderProfileSetting;
}
