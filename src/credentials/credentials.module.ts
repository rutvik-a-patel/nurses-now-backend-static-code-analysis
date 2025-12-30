import { Module } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { CredentialsController } from './credentials.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credential } from './entities/credential.entity';
import { ProviderCredential } from '@/provider-credentials/entities/provider-credential.entity';
import { CompetencyTestScore } from '@/competency-test-response/entities/competency-test-score.entity';
import { SkillChecklistResponse } from '@/skill-checklist-module/entities/skill-checklist-response.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Credential,
      ProviderCredential,
      SkillChecklistResponse,
      CompetencyTestScore,
    ]),
  ],
  controllers: [CredentialsController],
  providers: [CredentialsService],
})
export class CredentialsModule {}
