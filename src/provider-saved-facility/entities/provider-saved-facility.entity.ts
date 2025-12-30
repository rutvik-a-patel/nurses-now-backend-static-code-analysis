import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Provider } from '@/provider/entities/provider.entity';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Facility } from '@/facility/entities/facility.entity';

@Entity()
export class ProviderSavedFacility extends BaseEntity {
  @ManyToOne(() => Provider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @ManyToOne(() => Facility, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;
}
