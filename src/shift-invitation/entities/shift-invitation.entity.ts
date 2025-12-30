import { Provider } from '@/provider/entities/provider.entity';
import { SHIFT_INVITATION_STATUS, SHIFT_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class ShiftInvitation extends BaseEntity {
  @Column({
    type: 'enum',
    enum: SHIFT_INVITATION_STATUS,
    default: SHIFT_INVITATION_STATUS.unseen,
  })
  status: SHIFT_INVITATION_STATUS;

  @Column({
    type: 'enum',
    enum: SHIFT_STATUS,
    default: SHIFT_STATUS.invite_sent,
  })
  shift_status: SHIFT_STATUS;

  @ManyToOne(() => Provider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  @Index()
  provider: Provider;

  @ManyToOne(() => Shift, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shift_id' })
  @Index()
  shift: Shift;

  @Column({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  invited_on: Date;
}
