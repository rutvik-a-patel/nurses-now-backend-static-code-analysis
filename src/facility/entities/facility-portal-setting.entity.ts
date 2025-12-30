import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '@/shared/entity/base.entity';
import { SCHEDULING_WARNINGS } from '@/shared/constants/enum';
import { Facility } from './facility.entity';

@Entity()
export class FacilityPortalSetting extends BaseEntity {
  @Column({ type: 'boolean', default: true })
  allow_cancellation: boolean;

  @Column({ type: 'integer', default: 0 })
  cancellation_advance: number;

  @Column({
    type: 'enum',
    enum: SCHEDULING_WARNINGS,
    array: true,
    default: null,
  })
  scheduling_warnings: SCHEDULING_WARNINGS[];

  @Column({ type: 'boolean', default: true })
  client_confirmation: boolean;

  @Index()
  @OneToOne(() => Facility, (facility) => facility.facility_portal_setting, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;
}
