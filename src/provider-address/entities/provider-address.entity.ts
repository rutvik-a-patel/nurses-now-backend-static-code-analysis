import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ADDRESS_TYPE, DEFAULT_STATUS } from '@/shared/constants/enum';
import { Provider } from '@/provider/entities/provider.entity';

@Index('idx_address_zip', ['zip_code'])
@Index('idx_address_city', ['city'])
@Index('idx_address_state', ['state'])
@Index('idx_address_provider_type', ['provider', 'type'])
@Entity()
export class ProviderAddress extends BaseEntity {
  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @ManyToOne(() => Provider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Column({
    type: 'enum',
    enum: ADDRESS_TYPE,
    default: ADDRESS_TYPE.default,
  })
  type: ADDRESS_TYPE;

  @Column({ type: 'character varying', nullable: true })
  zip_code: string;

  @Column({ type: 'character varying', nullable: true })
  street: string;

  @Column({ type: 'character varying', nullable: true })
  apartment: string;

  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  latitude: string;

  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  longitude: string;

  @Column({ type: 'character varying', nullable: true })
  place_id: string;

  @Column({ type: 'character varying', nullable: true })
  city: string;

  @Column({ type: 'character varying', nullable: true })
  state: string;

  @Column({ type: 'character varying', nullable: true })
  country: string;
}
