import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class TestFaq extends BaseEntity {
  @Column({ type: 'character varying' })
  question: string;

  @Column({ type: 'character varying' })
  answer: string;

  @Column({ type: 'integer' })
  order: number;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;
}
