import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { ProviderProfileSettingSection } from './provider-profile-setting-section.entity';

@Entity()
export class ProviderProfileSettingSubSection extends BaseEntity {
  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @Column({ type: 'boolean', default: true })
  is_required: boolean;

  @Column({ type: 'integer' })
  order: number;

  @Column({ type: 'character varying' })
  name: string;

  @Column({ type: 'character varying' })
  key: string;

  @Column({ type: 'character varying', nullable: true })
  placeholder: string;

  @Column({ type: 'character varying', nullable: true })
  type: string;

  @ManyToOne(() => ProviderProfileSettingSection, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_profile_setting_section_id' })
  section: ProviderProfileSettingSection;
}
