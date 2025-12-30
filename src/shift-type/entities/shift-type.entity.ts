import { DEFAULT_STATUS, SHIFT_TYPE } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class ShiftType extends BaseEntity {
  @Column({ type: 'character varying', nullable: false })
  name: string;

  @Column({ type: 'enum', enum: SHIFT_TYPE })
  shift_type: SHIFT_TYPE;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.in_active,
  })
  status: DEFAULT_STATUS;

  @OneToMany(() => Shift, (provider) => provider.status)
  shift: Shift[];
}
