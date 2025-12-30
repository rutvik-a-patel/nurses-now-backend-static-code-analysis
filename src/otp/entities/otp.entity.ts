import { DEFAULT_STATUS, OTP_TYPE } from '../../shared/constants/enum';
import { BaseEntity } from '../../shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Provider } from '@/provider/entities/provider.entity';

@Entity()
export class Otp extends BaseEntity {
  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @ManyToOne(() => Provider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Column({ type: 'integer' })
  otp: number;

  @Column({ type: 'character varying', nullable: true })
  email: string;

  @Column({ type: 'character varying', length: 5, nullable: true })
  country_code: string;

  @Column({ type: 'character varying', length: 15, nullable: true })
  contact_number: string;

  @Column({ type: 'enum', enum: OTP_TYPE })
  type: OTP_TYPE;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'integer' })
  expire_at: number;
}
