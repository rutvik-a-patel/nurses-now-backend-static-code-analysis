import { ProviderCredential } from '@/provider-credentials/entities/provider-credential.entity';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class CredentialRejectReason extends BaseEntity {
  @Column({ type: 'character varying' })
  reason: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @OneToMany(() => ProviderCredential, (credential) => credential.reason)
  provider_credential: ProviderCredential[];
}
