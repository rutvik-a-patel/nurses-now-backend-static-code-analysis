import { Module } from '@nestjs/common';
import { CompetencyTestQuestionService } from './competency-test-question.service';
import { CompetencyTestQuestionController } from './competency-test-question.controller';

@Module({
  controllers: [CompetencyTestQuestionController],
  providers: [CompetencyTestQuestionService],
})
export class CompetencyTestQuestionModule {}
