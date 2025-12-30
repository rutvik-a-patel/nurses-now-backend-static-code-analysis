import { Credential } from '@/credentials/entities/credential.entity';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class CredentialsCategory extends BaseEntity {
  @Column({ type: 'character varying', nullable: false })
  name: string;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @OneToMany(() => Credential, (credential) => credential.credentials_category)
  credentials: Credential[];
}
