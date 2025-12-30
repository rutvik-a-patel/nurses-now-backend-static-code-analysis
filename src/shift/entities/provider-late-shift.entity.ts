import { Provider } from '@/provider/entities/provider.entity';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { Shift } from './shift.entity';

@Entity()
@Unique('provider_late_shift_unique', ['shift', 'provider'])
export class ProviderLateShift extends BaseEntity {
  @Index()
  @ManyToOne(() => Shift, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shift_id' })
  shift: Shift;

  @Index()
  @ManyToOne(() => Provider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;
}
