import { Module } from '@nestjs/common';
import { EDocResponseService } from './e-doc-response.service';
import { EDocResponseController } from './e-doc-response.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EDocResponse } from './entities/e-doc-response.entity';
import { ProviderCredentialsService } from '@/provider-credentials/provider-credentials.service';
import { ProviderCredential } from '@/provider-credentials/entities/provider-credential.entity';
import { AssignedCredential } from '@/assigned-credentials/entities/assigned-credential.entity';
import { CredentialsCategory } from '@/credentials-category/entities/credentials-category.entity';
import { EDoc } from '@/e-docs/entities/e-doc.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { Credential } from '@/credentials/entities/credential.entity';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EDocResponse,
      ProviderCredential,
      CredentialsCategory,
      EDoc,
      AssignedCredential,
      Credential,
      Provider,
      StatusSetting,
    ]),
  ],
  controllers: [EDocResponseController],
  providers: [EDocResponseService, ProviderCredentialsService],
})
export class EDocResponseModule {}
