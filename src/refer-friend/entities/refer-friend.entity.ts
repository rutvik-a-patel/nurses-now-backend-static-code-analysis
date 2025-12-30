import { Provider } from '@/provider/entities/provider.entity';
import { REFER_FRIEND_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { IsEnum } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class ReferFriend extends BaseEntity {
  @Column({ type: 'character varying', nullable: true })
  full_name: string;

  @Column({ type: 'character varying', nullable: true })
  email: string;

  @Column({ type: 'character varying', length: 5, nullable: true })
  country_code: string;

  @Column({
    type: 'character varying',
    length: 25,
    nullable: true,
  })
  mobile_no: string;

  @ManyToOne(() => Provider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'referred_by' })
  referred_by: Provider;

  @IsEnum(REFER_FRIEND_STATUS)
  @Column({
    type: 'enum',
    enum: REFER_FRIEND_STATUS,
    default: REFER_FRIEND_STATUS.invited,
  })
  status: REFER_FRIEND_STATUS;
}
