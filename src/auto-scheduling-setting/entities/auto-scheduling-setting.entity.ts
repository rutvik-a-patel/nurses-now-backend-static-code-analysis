import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class AutoSchedulingSetting extends BaseEntity {
  @Column({ type: 'integer', default: 10 })
  provider_radius: number;

  @Column({ type: 'integer', default: 30 })
  running_late_ai_time: number;

  @Column({ type: 'integer', default: 30 })
  check_distance_time: number;

  @Column({ type: 'integer', default: 300 })
  facility_cancel_time: number;

  @Column({ type: 'integer', default: 5 })
  cancel_request_expiry: number;

  @Column({ type: 'integer', default: 5 })
  running_late_request_expiry: number;

  @Column({ type: 'integer', default: 300 })
  send_another_request: number;

  @Column({ type: 'integer', default: 300 })
  post_shift_to_open: number;

  @Column({ type: 'integer', default: 7 })
  bulk_scheduling_duration: number;
}
