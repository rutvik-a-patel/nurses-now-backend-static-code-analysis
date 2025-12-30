import { Facility } from '@/facility/entities/facility.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { ORIENTATION_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Shift } from '@/shift/entities/shift.entity';
import { OrientationRejectReason } from '@/orientation-reject-reason/entities/orientation-reject-reason.entity';

@Entity()
export class ProviderOrientation extends BaseEntity {
  @Column({
    type: 'enum',
    enum: ORIENTATION_STATUS,
    default: ORIENTATION_STATUS.orientation_requested,
  })
  status: ORIENTATION_STATUS;

  @ManyToOne(() => Facility, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;

  @ManyToOne(() => Provider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Column({ type: 'text', nullable: true })
  orientation_notes: string;

  @Column({ type: 'text', nullable: true })
  cancel_description: string;

  @OneToOne(() => Shift, (shift) => shift.orientation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'shift_id' })
  shift: Shift;

  @ManyToOne(() => OrientationRejectReason, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reason_id' })
  reason: OrientationRejectReason;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;
}
