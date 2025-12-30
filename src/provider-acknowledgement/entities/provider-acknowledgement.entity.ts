import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { Provider } from '@/provider/entities/provider.entity';
import { SubAcknowledgement } from './sub-acknowledgement.entity';

@Entity()
export class ProviderAcknowledgement extends BaseEntity {
  @Column({ type: 'character varying', nullable: true })
  base_url: string;

  @Column({ type: 'character varying' })
  signature: string;

  @OneToMany(
    () => SubAcknowledgement,
    (subAcknowledgement) => subAcknowledgement.provider_acknowledgement,
  )
  subAcknowledgement: SubAcknowledgement[];

  @OneToOne(() => Provider, (provider) => provider.provider_acknowledgement)
  provider: Provider;
}
