import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { State } from '@/state/entities/state.entity';

@Entity()
export class City extends BaseEntity {
  @Column({ type: 'character varying' })
  name: string;

  @Column({ type: 'character varying' })
  country_code: string;

  @Column({ type: 'character varying' })
  state_code: string;

  @Column({ type: 'character varying', nullable: true })
  latitude: string;

  @Column({ type: 'character varying', nullable: true })
  longitude: string;

  @ManyToOne(() => State)
  @JoinColumn({ name: 'state_id' })
  state: State;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;
}
