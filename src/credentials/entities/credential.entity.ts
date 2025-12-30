import { Admin } from '@/admin/entities/admin.entity';
import { CredentialsCategory } from '@/credentials-category/entities/credentials-category.entity';
import { ProviderCredential } from '@/provider-credentials/entities/provider-credential.entity';
import {
  AUTO_ASSIGN,
  DEFAULT_STATUS,
  VALIDATE_UPON,
} from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity('credentials')
export class Credential extends BaseEntity {
  @Column({ type: 'character varying', nullable: false })
  name: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  credential_id: string;

  @ManyToOne(() => CredentialsCategory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'credentials_category_id' })
  @Index()
  credentials_category: CredentialsCategory;

  @Column({ type: 'uuid', array: true, nullable: false })
  licenses: string[];

  @Column({ type: 'boolean', default: false })
  is_essential: boolean;

  @Column({ type: 'boolean', default: false })
  expiry_required: boolean;

  @Column({ type: 'boolean', default: false })
  issued_required: boolean;

  @Column({ type: 'boolean', default: false })
  document_required: boolean;

  @Column({ type: 'boolean', default: false })
  doc_number_required: boolean;

  @Column({ type: 'boolean', default: false })
  approval_required: boolean;

  @Column({ type: 'uuid', array: true, nullable: true })
  state_id: string[];

  @Column({ type: 'enum', enum: AUTO_ASSIGN, nullable: false })
  auto_assign: AUTO_ASSIGN;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @Column({ type: 'enum', enum: VALIDATE_UPON, nullable: false })
  validate: VALIDATE_UPON;

  @ManyToOne(() => Admin, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  created_by: Admin;

  @ManyToOne(() => Admin, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'updated_by' })
  updated_by: Admin;

  @OneToMany(
    () => ProviderCredential,
    (providerCredential) => providerCredential.credential,
  )
  provider_credential: ProviderCredential[];
}
