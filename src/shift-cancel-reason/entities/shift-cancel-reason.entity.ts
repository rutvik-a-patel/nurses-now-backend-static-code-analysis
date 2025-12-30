import { DEFAULT_STATUS, USER_TYPE } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class ShiftCancelReason extends BaseEntity {
  @Column({ type: 'character varying', nullable: false })
  reason: string;

  @Column({ type: 'enum', enum: USER_TYPE, default: USER_TYPE.facility })
  user_type: USER_TYPE;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.in_active,
  })
  status: DEFAULT_STATUS;

  @OneToMany(() => Shift, (shift) => shift.cancel_reason)
  shift: Shift[];
}
