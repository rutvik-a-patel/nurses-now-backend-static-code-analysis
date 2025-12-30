import { Module } from '@nestjs/common';
import { CredentialsCategoryService } from './credentials-category.service';
import { CredentialsCategoryController } from './credentials-category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CredentialsCategory } from './entities/credentials-category.entity';
import { ProviderCredential } from '@/provider-credentials/entities/provider-credential.entity';
import { Credential } from '@/credentials/entities/credential.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CredentialsCategory,
      ProviderCredential,
      Credential,
    ]),
  ],
  controllers: [CredentialsCategoryController],
  providers: [CredentialsCategoryService],
})
export class CredentialsCategoryModule {}
