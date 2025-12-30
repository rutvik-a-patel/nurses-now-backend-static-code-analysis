import { EDoc } from '@/e-docs/entities/e-doc.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { CREDENTIAL_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class EDocResponse extends BaseEntity {
  @Column({ type: 'character varying' })
  base_url: string;

  @Column({ type: 'character varying' })
  document: string;

  @Column({ type: 'character varying', nullable: true })
  original_filename: string;

  @Column({ type: 'boolean', default: false })
  is_other: boolean;

  @Column({
    type: 'enum',
    enum: CREDENTIAL_STATUS,
    default: CREDENTIAL_STATUS.pending,
  })
  status: CREDENTIAL_STATUS;

  @ManyToOne(() => EDoc, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'e_doc_id' })
  e_doc: EDoc;

  @ManyToOne(() => Provider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;
}
