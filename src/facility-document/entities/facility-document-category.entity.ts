import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { FacilityDocument } from './facility-document.entity';

@Entity()
export class FacilityDocumentCategory extends BaseEntity {
  @Column({ type: 'character varying' })
  name: string;

  @OneToMany(
    () => FacilityDocument,
    (document) => document.facility_document_category,
  )
  facility_document: FacilityDocument[];
}
