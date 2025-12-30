import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { RateGroup } from './rate-group.entity';
import { Certificate } from '@/certificate/entities/certificate.entity';
import { DAY_TYPE, SHIFT_TIME_CODE } from '@/shared/constants/enum';

@Entity('rate_sheets')
export class RateSheet extends BaseEntity {
  @Index()
  @ManyToOne(() => RateGroup, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rate_group_id' })
  rate_group: RateGroup;

  @Index()
  @ManyToOne(() => Certificate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'certificate_id' })
  certificate: Certificate;

  @Column({ type: 'enum', enum: DAY_TYPE, nullable: false })
  day_type: DAY_TYPE;

  @Column({ type: 'enum', enum: SHIFT_TIME_CODE, nullable: false })
  shift_time: SHIFT_TIME_CODE;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  reg_pay: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  reg_bill: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  ot_bill: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  ot_pay: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  premium_pay: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  premium_bill: number;
}
