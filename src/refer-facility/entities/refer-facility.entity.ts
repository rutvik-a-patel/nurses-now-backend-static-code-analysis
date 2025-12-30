import { Provider } from '@/provider/entities/provider.entity';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class ReferFacility extends BaseEntity {
  @Column({ type: 'character varying' })
  facility_name: string;

  @Column({ type: 'character varying' })
  contact_person: string;

  @Column({ type: 'character varying' })
  contact_number: string;

  @Column({ type: 'character varying' })
  email: string;

  @Column({ type: 'text', nullable: true })
  extra_details: string;

  @Column({ type: 'character varying', nullable: true })
  street_address: string;

  @Column({ type: 'character varying', nullable: true })
  zip_code: string;

  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  longitude: number;

  @Column({ type: 'character varying', nullable: true })
  place_id: string;

  @Column({ type: 'character varying', nullable: true })
  city: string;

  @Column({ type: 'character varying', nullable: true })
  state: string;

  @ManyToOne(() => Provider, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;
}
