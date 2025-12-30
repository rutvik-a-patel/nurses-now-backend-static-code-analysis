import { Column, Entity, OneToMany } from 'typeorm';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { FloorDetail } from '@/floor-detail/entities/floor-detail.entity';

@Entity()
export class Speciality extends BaseEntity {
  @Column({ type: 'character varying' })
  name: string;

  @Column({ type: 'character varying' })
  abbreviation: string;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @Column({ type: 'uuid', array: true, default: null })
  certificates: string[];

  @Column({ type: 'boolean', default: true })
  display: boolean;

  @Column({ type: 'character varying', default: true })
  workforce_portal_alias: string;

  @Column({ type: 'character varying', nullable: true })
  text_color: string;

  @Column({ type: 'character varying', nullable: true })
  background_color: string;

  @OneToMany(() => Provider, (provider) => provider.speciality)
  provider: Provider[];

  @OneToMany(() => Shift, (shift) => shift.speciality)
  shift: Shift[];

  @OneToMany(() => FloorDetail, (floor) => floor.speciality)
  floor_detail: FloorDetail[];
}
