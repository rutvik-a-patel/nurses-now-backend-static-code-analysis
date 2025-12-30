import { Admin } from '@/admin/entities/admin.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { ACTION_TABLES, ACTIVITY_TYPE, TABLE } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Activity extends BaseEntity {
  @Column({
    type: 'enum',
    enum: TABLE,
    nullable: true,
  })
  action_by_type: TABLE; // admin, provider, facility, facility_user

  @Index()
  @ManyToOne(() => Admin, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'admin_id' })
  admin: Admin;

  @Index()
  @ManyToOne(() => FacilityUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facility_user_id' })
  facility_user: FacilityUser;

  @Index()
  @ManyToOne(() => Provider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Index()
  @ManyToOne(() => Shift, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shift_id' })
  shift: Shift;

  @Index()
  @Column({
    type: 'enum',
    enum: ACTIVITY_TYPE,
  })
  activity_type: ACTIVITY_TYPE; // create, update, invite, reject, accept

  // for displaying the formatted message
  @Index()
  @Column({ type: 'jsonb', nullable: true })
  message: Record<string, any>;

  @Index()
  @Column({ type: 'enum', enum: ACTION_TABLES, nullable: true })
  action_for: ACTION_TABLES;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  entity_id: string;
}
