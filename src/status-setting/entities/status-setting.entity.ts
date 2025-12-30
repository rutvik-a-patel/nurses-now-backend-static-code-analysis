import { Column, Entity, OneToMany } from 'typeorm';
import { DEFAULT_STATUS, USER_TYPE } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { Facility } from '@/facility/entities/facility.entity';

@Entity()
export class StatusSetting extends BaseEntity {
  @Column({ type: 'character varying' })
  name: string;

  @Column({ type: 'character varying' })
  background_color: string;

  @Column({ type: 'character varying' })
  text_color: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @Column({
    type: 'enum',
    enum: USER_TYPE,
    nullable: true,
  })
  status_for: USER_TYPE;

  @Column({ type: 'boolean', default: false })
  is_default: boolean;

  @OneToMany(() => Provider, (provider) => provider.status)
  provider: Provider[];

  @OneToMany(() => Facility, (facility) => facility.status)
  facility: Facility[];
}
