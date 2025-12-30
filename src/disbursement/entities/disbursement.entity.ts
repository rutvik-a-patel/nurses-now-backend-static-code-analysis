import { Provider } from '@/provider/entities/provider.entity';
import { DISBURSEMENT_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { Entity, Column, JoinColumn, OneToOne, ManyToOne } from 'typeorm';

@Entity('disbursements')
export class Disbursement extends BaseEntity {
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount: number;

  @ManyToOne(() => Provider, (provider) => provider.disbursements, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @OneToOne(() => Shift, (shift) => shift.disbursements, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'shift_id' })
  shift: Shift;

  @Column({
    type: 'enum',
    enum: DISBURSEMENT_STATUS,
    default: DISBURSEMENT_STATUS.pending,
  })
  status: DISBURSEMENT_STATUS;

  @Column({ type: 'character varying', length: 255 })
  description: string;

  @Column({ type: 'boolean', default: true })
  retry: boolean;
}
