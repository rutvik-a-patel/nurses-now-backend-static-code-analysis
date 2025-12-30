import { Provider } from '@/provider/entities/provider.entity';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class ProviderRejectReason extends BaseEntity {
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

  @OneToMany(() => Provider, (provider) => provider.reason)
  provider: Provider[];
}
