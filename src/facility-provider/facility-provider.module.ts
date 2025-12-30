import { Module } from '@nestjs/common';
import { FacilityProviderService } from './facility-provider.service';
import { FacilityProviderController } from './facility-provider.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacilityProvider } from './entities/facility-provider.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { ProviderCredentialsService } from '@/provider-credentials/provider-credentials.service';
import { ProviderCredential } from '@/provider-credentials/entities/provider-credential.entity';
import { CredentialsCategory } from '@/credentials-category/entities/credentials-category.entity';
import { EDocsGroup } from '@/e-docs-group/entities/e-docs-group.entity';
import { EDoc } from '@/e-docs/entities/e-doc.entity';
import { AssignedCredential } from '@/assigned-credentials/entities/assigned-credential.entity';
import { Credential } from '@/credentials/entities/credential.entity';
import { EDocResponse } from '@/e-doc-response/entities/e-doc-response.entity';
import { CompetencyTestScore } from '@/competency-test-response/entities/competency-test-score.entity';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';
import { Activity } from '@/activity/entities/activity.entity';
import { CompetencyTestGlobalSetting } from '@/competency-test-setting/entities/competency-test-global-setting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FacilityProvider,
      Provider,
      Shift,
      ProviderCredential,
      CredentialsCategory,
      EDocsGroup,
      EDoc,
      AssignedCredential,
      Credential,
      EDocResponse,
      CompetencyTestScore,
      CredentialsCategory,
      StatusSetting,
      Activity,
      CompetencyTestGlobalSetting,
    ]),
  ],
  controllers: [FacilityProviderController],
  providers: [FacilityProviderService, ProviderCredentialsService],
})
export class FacilityProviderModule {}
