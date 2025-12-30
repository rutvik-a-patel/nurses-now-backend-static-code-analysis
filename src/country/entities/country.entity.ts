import { State } from '@/state/entities/state.entity';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { DEFAULT_STATUS } from '@/shared/constants/enum';

@Entity()
export class Country extends BaseEntity {
  @Column({ type: 'character varying' })
  name: string;

  @Column({ type: 'character varying' })
  iso_code: string;

  @Column({ type: 'character varying' })
  flag: string;

  @Column({ type: 'character varying' })
  phone_code: string;

  @Column({ type: 'character varying' })
  currency: string;

  @Column({ type: 'character varying' })
  latitude: string;

  @Column({ type: 'character varying' })
  longitude: string;

  @OneToMany(() => State, (state) => state.country)
  state: State[];

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;
}
