import { Chat } from '@/chat/entities/chat.entity';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, OneToOne } from 'typeorm';

@Entity()
export class Media extends BaseEntity {
  @Column({ type: 'character varying' })
  base_url: string;

  @Column({ type: 'character varying', array: true, nullable: true })
  image: string[];

  @OneToOne(() => Chat, (chat) => chat.media)
  chat: Chat;
}
