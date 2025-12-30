import { Admin } from '@/admin/entities/admin.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { Notification } from '@/notification/entities/notification.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class UserNotification extends BaseEntity {
  @Column({
    type: 'enum',
    enum: [DEFAULT_STATUS.active, DEFAULT_STATUS.in_active],
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @ManyToOne(() => Notification, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'notification_id' })
  notification: Notification;

  @ManyToOne(() => Provider, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @ManyToOne(() => Facility, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;

  @ManyToOne(() => FacilityUser, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facility_user_id' })
  facility_user: FacilityUser;

  @ManyToOne(() => Admin, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'admin_id' })
  admin: Admin;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  @Column({ type: 'jsonb', nullable: true })
  data: JSON;
}
