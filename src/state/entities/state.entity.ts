import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Country } from '@/country/entities/country.entity';
import { BaseEntity } from '@/shared/entity/base.entity';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { City } from '@/city/entities/city.entity';
@Entity()
export class State extends BaseEntity {
  @Column({ type: 'character varying' })
  name: string;

  @Column({ type: 'character varying' })
  iso_code: string;

  @Column({ type: 'character varying' })
  country_code: string;

  @Column({ type: 'character varying', nullable: true })
  latitude: string;

  @Column({ type: 'character varying', nullable: true })
  longitude: string;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @OneToMany(() => City, (city) => city.state)
  city: City[];

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;
}
