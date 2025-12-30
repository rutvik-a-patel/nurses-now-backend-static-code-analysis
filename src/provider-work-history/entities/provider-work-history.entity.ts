import { Provider } from '@/provider/entities/provider.entity';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class ProviderWorkHistory extends BaseEntity {
  @Column({ type: 'character varying', nullable: true })
  employer_name: string;

  @Column({ type: 'character varying', nullable: true })
  supervisors_name: string;

  @Column({ type: 'character varying', nullable: true })
  supervisors_title: string;

  @Column({ type: 'character varying', length: 5, nullable: true })
  work_phone_country_code: string;

  @Column({ type: 'character varying', length: 15, nullable: true })
  work_phone: string;
  @Column({ type: 'character varying', nullable: true })
  location: string;

  @Column({ type: 'boolean', default: false })
  is_teaching_facility: boolean;

  @Column({ type: 'boolean', default: false })
  charge_experience: boolean;

  @Column({ type: 'boolean', default: false })
  can_contact_employer: boolean;

  @Column({ type: 'boolean', default: false })
  is_current: boolean;

  @Column({ type: 'date', nullable: true })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date: Date;

  @ManyToOne(() => Provider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;
}
