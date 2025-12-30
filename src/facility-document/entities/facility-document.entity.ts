import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { FacilityDocumentCategory } from './facility-document-category.entity';

@Entity()
export class FacilityDocument extends BaseEntity {
  @Column({ type: 'character varying' })
  name: string;

  @Column({ type: 'boolean', default: true })
  is_required: boolean;

  @ManyToOne(() => FacilityDocumentCategory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facility_document_category' })
  facility_document_category: FacilityDocumentCategory;
}
