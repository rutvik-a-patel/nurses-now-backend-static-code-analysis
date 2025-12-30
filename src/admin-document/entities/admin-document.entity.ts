import { Documents } from '@/documents/entities/documents.entity';
import { CATEGORY_TYPES, DEFAULT_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class AdminDocument extends BaseEntity {
  @Column({ type: 'character varying' })
  name: string;

  @Column({ type: 'character varying', nullable: true })
  note: string;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.in_active,
  })
  status: DEFAULT_STATUS;

  @Column({
    type: 'enum',
    enum: CATEGORY_TYPES,
    nullable: false,
  })
  category: CATEGORY_TYPES;

  @OneToMany(() => Documents, (documents) => documents.admin_document_category)
  documents: Documents[];
}
