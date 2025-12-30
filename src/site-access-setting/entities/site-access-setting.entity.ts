import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class SiteAccessSetting extends BaseEntity {
  @Column({ type: 'character varying', nullable: true })
  base_url: string;

  @Column({ type: 'character varying', nullable: true })
  image: string;

  @Column({ type: 'character varying', nullable: true })
  theme_color: string;
}
