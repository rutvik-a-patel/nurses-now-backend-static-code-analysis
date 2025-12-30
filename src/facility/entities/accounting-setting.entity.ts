import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { Facility } from './facility.entity';

@Entity()
export class AccountingSetting extends BaseEntity {
  @Column({ type: 'integer', default: 15 })
  billing_cycle: number;

  @Column({ type: 'integer', default: 15 })
  invoice_due: number;

  @Index()
  @OneToOne(() => Facility, (facility) => facility.accounting_setting, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;
}
