import { AVAILABLE_TYPE, DAYS, DEFAULT_STATUS } from '@/shared/constants/enum';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Provider } from './provider.entity';

@Entity()
export class ProviderAvailability extends BaseEntity {
  @Column({
    type: 'enum',
    enum: AVAILABLE_TYPE,
    default: AVAILABLE_TYPE.permanent,
  })
  availability_type: AVAILABLE_TYPE;

  @Column({ type: 'enum', enum: DAYS, nullable: true })
  day: DAYS;

  @Column({ type: 'date', nullable: true })
  date: string | null;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @Column('jsonb', {
    nullable: true,
  })
  shift_time: any;

  @Index()
  @ManyToOne(() => Provider, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Column({ type: 'integer', nullable: true })
  order: number;
}
