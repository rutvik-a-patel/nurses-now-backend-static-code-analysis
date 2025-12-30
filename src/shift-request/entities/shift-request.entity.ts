import { Provider } from '@/provider/entities/provider.entity';
import { SHIFT_REQUEST_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class ShiftRequest extends BaseEntity {
  @Column({
    type: 'enum',
    enum: SHIFT_REQUEST_STATUS,
    default: SHIFT_REQUEST_STATUS.unassigned,
  })
  status: SHIFT_REQUEST_STATUS;

  @ManyToOne(() => Provider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  @Index()
  provider: Provider;

  @ManyToOne(() => Shift, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shift_id' })
  @Index()
  shift: Shift;
}
