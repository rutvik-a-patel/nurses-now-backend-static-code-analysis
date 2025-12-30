import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '@/shared/entity/base.entity';
import { ENTITY_STATUS } from '@/shared/constants/enum';
import { Role } from '@/role/entities/role.entity';
import { Token } from '@/token/entities/token.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { UserNotification } from '@/user-notification/entities/user-notification.entity';
import { Credential } from '@/credentials/entities/credential.entity';

@Entity()
export class Admin extends BaseEntity {
  @Column({ type: 'character varying' })
  first_name: string;

  @Column({ type: 'character varying' })
  last_name: string;

  @Column({ type: 'character varying', nullable: true })
  email: string;

  @Column({ type: 'character varying', nullable: true, length: 5 })
  country_code: string;

  @Column({ type: 'character varying', nullable: true, length: 15 })
  mobile_no: string;

  @Column({ type: 'character varying', nullable: true, length: 15 })
  phone_no: string;

  @Column({ type: 'character varying', nullable: true })
  extension?: string;

  @Column({ type: 'character varying', nullable: true })
  password: string;

  @Column({ type: 'character varying', nullable: true })
  base_url: string;

  @Column({ type: 'character varying', nullable: true })
  image: string;

  @Column({ type: 'character varying', nullable: true })
  signature: string;

  @Column({
    type: 'enum',
    enum: ENTITY_STATUS,
    default: ENTITY_STATUS.in_active,
  })
  status: ENTITY_STATUS;

  @Column({ type: 'boolean', default: false })
  is_email_verified: boolean;

  @ManyToOne(() => Role, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToMany(() => Token, (token) => token.admin)
  token: Token[];

  @OneToMany(() => Facility, (facility) => facility.admin)
  facility: Facility[];

  @OneToMany(
    () => UserNotification,
    (user_notification) => user_notification.admin,
  )
  user_notification: UserNotification[];

  @OneToMany(() => Credential, (credential) => credential.created_by)
  created_by: Credential[];

  @OneToMany(() => Credential, (credential) => credential.updated_by)
  updated_by: Credential[];

  @Column({ type: 'integer', default: 0 })
  login_attempt: number;

  @Column({ type: 'timestamptz', nullable: true })
  login_attempt_at: Date;

  @Column({ type: 'boolean', default: false })
  hide_inactive_contacts: boolean;

  @Column({ type: 'boolean', default: false })
  hide_inactive_users: boolean;
}
