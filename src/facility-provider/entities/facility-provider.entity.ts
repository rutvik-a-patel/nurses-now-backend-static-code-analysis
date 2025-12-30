import { Facility } from '@/facility/entities/facility.entity';
import { Provider } from '@/provider/entities/provider.entity';
import {
  DNR_TYPE,
  FACILITY_PROVIDER_FLAGS,
  TABLE,
} from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';

@Entity()
@Unique(['provider', 'facility'])
export class FacilityProvider extends BaseEntity {
  @Column({ type: 'enum', enum: FACILITY_PROVIDER_FLAGS, nullable: true })
  flag: FACILITY_PROVIDER_FLAGS;

  @Column({ type: 'enum', enum: DNR_TYPE, nullable: true })
  dnr_type: DNR_TYPE;

  @Column('uuid', { array: true, default: null })
  dnr_reason: string[];

  @Column({ type: 'text', nullable: true })
  dnr_description: string;

  @Column({ type: 'timestamp', nullable: true })
  dnr_at: Date;

  @ManyToOne(() => Provider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @ManyToOne(() => Facility, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;

  @Column({ type: 'uuid', nullable: true })
  created_by_id: string;

  @Column({
    type: 'enum',
    enum: TABLE,
    nullable: true,
  })
  created_by_type: TABLE;

  @Column({ type: 'uuid', nullable: true })
  updated_by_id: string;

  @Column({
    type: 'enum',
    enum: TABLE,
    nullable: true,
  })
  updated_by_type: TABLE;

  @Column({ type: 'boolean', default: false })
  self_dnr: boolean;

  @Column({ type: 'uuid', array: true, default: null })
  self_dnr_reason: string;

  @Column({ type: 'text', nullable: true })
  self_dnr_description: string;

  @Column({ type: 'timestamp', nullable: true })
  self_dnr_at: string;
}
