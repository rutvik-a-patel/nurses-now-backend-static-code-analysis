import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { Speciality } from '@/speciality/entities/speciality.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class FloorDetail extends BaseEntity {
  @Column({ type: 'character varying' })
  name: string;

  @Column({ type: 'integer', default: 0 })
  beds: number;

  @Column({ type: 'character varying', nullable: true })
  po_number: string;

  @Column({ type: 'character varying', nullable: true })
  cost_center: string;

  @Column({
    type: 'character varying',
    nullable: true,
    length: 15,
  })
  phone_number: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Speciality, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'speciality_id' })
  speciality: Speciality;

  @ManyToOne(() => FacilityUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'default_order_contact' })
  default_order_contact: FacilityUser;

  @ManyToOne(() => FacilityUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_contact' })
  client_contact: FacilityUser;

  @ManyToOne(() => Facility, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;

  @OneToMany(() => Shift, (shift) => shift.floor)
  shift: Shift[];
}
