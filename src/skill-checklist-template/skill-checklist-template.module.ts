import { Module } from '@nestjs/common';
import { SkillChecklistTemplateService } from './skill-checklist-template.service';
import { SkillChecklistTemplateController } from './skill-checklist-template.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillChecklistTemplate } from './entities/skill-checklist-template.entity';
import { SkillChecklistModule } from '@/skill-checklist-module/entities/skill-checklist-module.entity';
import { SkillChecklistSubModule } from '@/skill-checklist-module/entities/skill-checklist-sub-module.entity';
import { SkillChecklistQuestion } from '@/skill-checklist-module/entities/skill-checklist-question.entity';
import { SkillChecklistResponse } from '@/skill-checklist-module/entities/skill-checklist-response.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SkillChecklistTemplate,
      SkillChecklistModule,
      SkillChecklistSubModule,
      SkillChecklistQuestion,
      SkillChecklistResponse,
    ]),
  ],
  controllers: [SkillChecklistTemplateController],
  providers: [SkillChecklistTemplateService],
})
export class SkillChecklistTemplateModule {}
