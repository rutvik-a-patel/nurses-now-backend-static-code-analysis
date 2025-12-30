import { EDocResponse } from '@/e-doc-response/entities/e-doc-response.entity';
import { EDocsGroup } from '@/e-docs-group/entities/e-docs-group.entity';
import {
  DEFAULT_STATUS,
  EXPIRATION_DURATION_TYPE,
} from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class EDoc extends BaseEntity {
  @Column({ type: 'character varying', nullable: false })
  name: string;

  @Column({ type: 'character varying', nullable: true })
  base_url: string;

  @Column({ type: 'character varying', nullable: true })
  document: string;

  @Column({ type: 'character varying', nullable: true })
  new_file: string;

  @Column({ type: 'character varying', nullable: true })
  original_filename: string;

  @Column({ type: 'character varying', nullable: true })
  attachment_label: string;

  @Column({ type: 'character varying', nullable: true })
  instruction: string;

  @Column({ type: 'boolean', default: false })
  require_download: string;

  @Column({ type: 'enum', enum: EXPIRATION_DURATION_TYPE, nullable: true })
  expiration_period: string;

  @Column({ type: 'integer', default: 0 })
  expiration_duration: string;

  @Column({ type: 'json', nullable: true })
  field_settings: any;

  @Column({ type: 'json', nullable: true })
  ref: any;

  @ManyToOne(() => EDocsGroup, (eDocGroup) => eDocGroup.document, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'document_group_id' })
  document_group: EDocsGroup;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @Column({ type: 'boolean', default: false })
  is_replaced: boolean;

  @OneToMany(() => EDocResponse, (eDocResponse) => eDocResponse.e_doc)
  e_doc_response: EDocResponse[];
}
