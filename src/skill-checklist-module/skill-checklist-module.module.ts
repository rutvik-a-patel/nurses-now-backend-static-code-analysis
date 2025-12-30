import { Module } from '@nestjs/common';
import { SkillChecklistModuleService } from './skill-checklist-module.service';
import { SkillChecklistModuleController } from './skill-checklist-module.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillChecklistTemplate } from '@/skill-checklist-template/entities/skill-checklist-template.entity';
import { SkillChecklistModule } from './entities/skill-checklist-module.entity';
import { SkillChecklistResponse } from '@/skill-checklist-module/entities/skill-checklist-response.entity';
import { SkillChecklistAnswer } from './entities/skill-checklist-answers.entity';
import { SkillChecklistAnswerModule } from './entities/skill-checklist-answer-module.entity';
import { SkillChecklistQuestionAnswer } from './entities/skill-checklist-question-answer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SkillChecklistTemplate,
      SkillChecklistModule,
      SkillChecklistResponse,
      SkillChecklistAnswer,
      SkillChecklistAnswerModule,
      SkillChecklistQuestionAnswer,
    ]),
  ],
  controllers: [SkillChecklistModuleController],
  providers: [SkillChecklistModuleService],
})
export class SkillChecklistModuleModule {}
