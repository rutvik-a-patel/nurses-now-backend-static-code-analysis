import { CredentialRejectReason } from '@/credential-reject-reason/entities/credential-reject-reason.entity';
import { Credential } from '@/credentials/entities/credential.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { CREDENTIAL_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';

@Entity()
export class ProviderCredential extends BaseEntity {
  @Column({ type: 'character varying' })
  name: string;

  @Column({ type: 'character varying', nullable: true })
  base_url: string;

  @Column({ type: 'character varying', nullable: true })
  filename: string;

  @Column({ type: 'character varying', nullable: true })
  original_filename: string;

  @Column({
    type: 'character varying',
    default: () => 'generate_unique_document_id()',
  })
  document_id: string;

  @Column({ type: 'character varying', nullable: true })
  license: string;

  @Column({ type: 'date', nullable: true })
  issue_date: Date;

  @Column({ type: 'date', nullable: true })
  expiry_date: Date;

  @Column({ type: 'boolean', default: false })
  is_other: boolean;

  @Column({
    type: 'enum',
    enum: CREDENTIAL_STATUS,
    default: CREDENTIAL_STATUS.pending,
  })
  is_verified: CREDENTIAL_STATUS;

  @Column({ type: 'timestamptz', nullable: true })
  credential_rejected_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  credential_approved_at: Date;

  @Column({ type: 'text', nullable: true })
  reason_description: string;

  @ManyToOne(
    () => CredentialRejectReason,
    (reason) => reason.provider_credential,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'reason_id' })
  @Index()
  reason: CredentialRejectReason;

  @ManyToOne(() => Credential, (credential) => credential.provider_credential, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'credential_id' })
  credential: Credential;

  @ManyToOne(() => Provider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @OneToOne(() => ProviderCredential, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'previous_document_id' })
  previous_document: ProviderCredential;
}
