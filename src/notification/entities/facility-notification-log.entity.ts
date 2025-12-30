import { Facility } from '@/facility/entities/facility.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { BaseEntity } from '@/shared/entity/base.entity';
import { ManyToOne, JoinColumn, Column, Entity } from 'typeorm';

@Entity()
export class FacilityNotificationLog extends BaseEntity {
  @ManyToOne(() => Provider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @ManyToOne(() => Facility, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;

  @Column({ type: 'timestamptz' })
  notified_at: Date;
}
