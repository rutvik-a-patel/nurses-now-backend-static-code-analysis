import { Provider } from '@/provider/entities/provider.entity';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity()
export class ProviderAnalytics extends BaseEntity {
  @Column({ type: 'integer', default: 0 })
  total_shift: number;

  @Column({ type: 'integer', default: 0 })
  shift_attended: number;

  @Column({ type: 'double precision', default: 0 })
  attendance_score: number;

  @Column({ type: 'integer', default: 0 })
  on_time_check_in: number;

  @Column({ type: 'double precision', default: 0 })
  on_time_rate: number;

  @Column({ type: 'double precision', default: 0 })
  late_shift_ratio: number;

  @Column({ type: 'integer', default: 0 })
  late_shift: number;

  @OneToOne(() => Provider, (provider) => provider.provider_analytics, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;
}
