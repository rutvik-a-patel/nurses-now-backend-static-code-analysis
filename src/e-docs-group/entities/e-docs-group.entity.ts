import { EDoc } from '@/e-docs/entities/e-doc.entity';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class EDocsGroup extends BaseEntity {
  @Column({ type: 'character varying', nullable: false })
  name: string;

  @OneToMany(() => EDoc, (eDoc) => eDoc.document_group, { cascade: true })
  document: EDoc[];

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;
}
