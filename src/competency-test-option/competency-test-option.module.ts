import { Module } from '@nestjs/common';
import { CompetencyTestOptionService } from './competency-test-option.service';
import { CompetencyTestOptionController } from './competency-test-option.controller';

@Module({
  controllers: [CompetencyTestOptionController],
  providers: [CompetencyTestOptionService],
})
export class CompetencyTestOptionModule {}
