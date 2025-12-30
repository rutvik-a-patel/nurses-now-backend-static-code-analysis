import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity('webhook_responses')
export class Webhook extends BaseEntity {
  @Index()
  @Column({ type: 'uuid', nullable: false, unique: true })
  event_id: string;

  @Column({ type: 'character varying', nullable: false })
  event: string;

  @Column({ type: 'character varying', nullable: false })
  client_type: string;

  @Column({ type: 'integer', nullable: false })
  client_id: number;

  @Column({ type: 'text', nullable: false })
  data: string;

  @Index()
  @Column({ type: 'uuid', nullable: false })
  employee_id: string;

  @Column({ type: 'character varying', nullable: false })
  active_type: string;

  @Column({ type: 'character varying', nullable: false })
  time_emitted: string;

  @Column({ type: 'json', nullable: false })
  response: string;
}
