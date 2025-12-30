import { Provider } from '@/provider/entities/provider.entity';
import { PROVIDER_NOTIFICATION_TYPE } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { ManyToOne, JoinColumn, Column, Entity } from 'typeorm';

@Entity()
export class ProviderNotificationSetting extends BaseEntity {
  @ManyToOne(() => Provider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Column({ type: 'character varying' })
  name: string;

  @Column({ type: 'enum', enum: PROVIDER_NOTIFICATION_TYPE, nullable: false })
  type: PROVIDER_NOTIFICATION_TYPE;

  @Column({ type: 'boolean', default: true })
  push: boolean;

  @Column({ type: 'boolean', default: false })
  email: boolean;

  @Column({ type: 'int', nullable: true })
  order_by: number;
}
