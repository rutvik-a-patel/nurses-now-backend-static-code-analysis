import { Provider } from '@/provider/entities/provider.entity';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class ProviderEducationHistory extends BaseEntity {
  @Column({ type: 'character varying', nullable: true })
  school: string;

  @Column({ type: 'character varying', nullable: true })
  location: string;

  @Column({ type: 'character varying', nullable: true })
  course: string;

  @Column({ type: 'character varying', nullable: true })
  degree: string;

  @Column({ type: 'date', nullable: true })
  graduation_date: Date;

  @ManyToOne(() => Provider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;
}
