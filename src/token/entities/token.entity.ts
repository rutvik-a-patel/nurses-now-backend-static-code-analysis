import { DEFAULT_STATUS, DEVICE_TYPE } from '@/shared/constants/enum';
import { Admin } from '@/admin/entities/admin.entity';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Provider } from '@/provider/entities/provider.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { Facility } from '@/facility/entities/facility.entity';

@Index('idx_token_provider_login', ['provider', 'login_at'])
@Entity()
export class Token extends BaseEntity {
  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @ManyToOne(() => Admin, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'admin_id' })
  admin: Admin;

  @ManyToOne(() => Provider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @ManyToOne(() => FacilityUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facility_user_id' })
  facility_user: FacilityUser;

  @ManyToOne(() => Facility, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;

  @Column({ type: 'text' })
  jwt: string;

  @Column({ type: 'text', nullable: true })
  refresh_jwt: string;

  @Column({ type: 'text', nullable: true })
  firebase: string;

  @Column({ type: 'character varying', nullable: true })
  device_id: string;

  @Column({ type: 'character varying', nullable: true })
  device_name: string;

  @Column({ type: 'enum', enum: DEVICE_TYPE, nullable: true })
  device_type: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  login_at: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  logout_at: string;
}
