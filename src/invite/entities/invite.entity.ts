import { INVITE_STATUS, LINK_TYPE, TABLE } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Invite extends BaseEntity {
  @Column({ type: 'enum', enum: INVITE_STATUS, default: INVITE_STATUS.pending })
  status: INVITE_STATUS;

  @Column({ type: 'character varying', nullable: true })
  email: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column({ type: 'enum', enum: LINK_TYPE, nullable: false })
  type: LINK_TYPE;

  @Column({ type: 'enum', enum: TABLE })
  role: TABLE;
}
