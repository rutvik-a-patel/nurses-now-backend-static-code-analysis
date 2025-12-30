import {
  DEFAULT_STATUS,
  DEVICE_TYPE,
  NotificationFor,
  NotificationType,
} from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { UserNotification } from '@/user-notification/entities/user-notification.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class Notification extends BaseEntity {
  @Column({
    type: 'enum',
    enum: [DEFAULT_STATUS.active, DEFAULT_STATUS.in_active],
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.GENERAL,
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationFor,
    default: NotificationFor.ALL_USER,
  })
  for: NotificationFor;

  @Column({ type: 'character varying' })
  title: string;

  @Column({ type: 'text' })
  text: string;

  @Column({
    type: 'enum',
    enum: DEVICE_TYPE,
    default: DEVICE_TYPE.all,
  })
  device_type: DEVICE_TYPE;

  @Column({ type: 'character varying', nullable: true })
  base_url: string;

  @Column({ type: 'character varying', nullable: true })
  image: string;

  @Column({ type: 'boolean', default: true })
  is_published: boolean;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  date_time: string;

  @Column({
    type: 'character varying',
    nullable: true,
  })
  timezone: string;

  @OneToMany(
    () => UserNotification,
    (user_notification) => user_notification.notification,
  )
  user_notification: UserNotification[];

  @Column({
    type: 'character varying',
    nullable: true,
  })
  push_type: string;
}
