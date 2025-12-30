import { CHAT_TABLE, TABLE } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Room extends BaseEntity {
  @Column({
    type: 'uuid',
    name: 'user_id',
  })
  user_id: string;

  @Column({ type: 'enum', enum: TABLE })
  user_type: TABLE;

  @Column({
    type: 'uuid',
    name: 'sender_id',
  })
  sender_id: string;

  @Column({ type: 'enum', enum: CHAT_TABLE })
  sender_type: CHAT_TABLE;
}
