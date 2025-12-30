import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provider } from '@/provider/entities/provider.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { ProviderCredential } from '@/provider-credentials/entities/provider-credential.entity';
import { SkillChecklistModuleService } from '@/skill-checklist-module/skill-checklist-module.service';
import { SkillChecklistTemplate } from '@/skill-checklist-template/entities/skill-checklist-template.entity';
import { SkillChecklistModule } from '@/skill-checklist-module/entities/skill-checklist-module.entity';
import { SkillChecklistResponse } from '@/skill-checklist-module/entities/skill-checklist-response.entity';
import { EDocResponse } from '@/e-doc-response/entities/e-doc-response.entity';
import { Credential } from '@/credentials/entities/credential.entity';
import { EDoc } from '@/e-docs/entities/e-doc.entity';
import { SkillChecklistAnswer } from '@/skill-checklist-module/entities/skill-checklist-answers.entity';
import { SkillChecklistAnswerModule } from '@/skill-checklist-module/entities/skill-checklist-answer-module.entity';
import { SkillChecklistQuestionAnswer } from '@/skill-checklist-module/entities/skill-checklist-question-answer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Provider,
      Shift,
      ProviderCredential,
      SkillChecklistTemplate,
      SkillChecklistModule,
      SkillChecklistResponse,
      EDocResponse,
      EDoc,
      Credential,
      SkillChecklistAnswer,
      SkillChecklistAnswerModule,
      SkillChecklistQuestionAnswer,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService, SkillChecklistModuleService],
})
export class DashboardModule {}
