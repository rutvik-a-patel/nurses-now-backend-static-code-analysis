import { Media } from '@/media/entities/media.entity';
import { CHAT_TABLE } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

@Entity()
export class Chat extends BaseEntity {
  @Column({
    type: 'text',
    nullable: true,
  })
  message: string;

  @Column({
    type: 'uuid',
    name: 'user_id',
  })
  user_id: string;

  @Column({ type: 'enum', enum: CHAT_TABLE })
  user_type: CHAT_TABLE;

  @Column({
    type: 'uuid',
    name: 'sender_id',
  })
  sender_id: string;

  @Column({ type: 'enum', enum: CHAT_TABLE })
  sender_type: CHAT_TABLE;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  @Column({ type: 'boolean', default: false })
  is_edit: boolean;

  @ManyToOne(() => Shift, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shift_id' })
  task: Shift;

  @OneToOne(() => Media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'media_id' })
  media: Media;

  @ManyToOne(() => Chat)
  @JoinColumn({ name: 'parent_id' })
  parent: Chat;
}
