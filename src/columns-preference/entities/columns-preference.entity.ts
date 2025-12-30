import { ColumnConfig } from '@/shared/constants/constant';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class ColumnsPreference extends BaseEntity {
  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'character varying', length: 50, nullable: false })
  table_type: string;

  @Column({
    type: 'jsonb',
    nullable: false,
  })
  columns_config: ColumnConfig[];
}
