import { Module } from '@nestjs/common';
import { CompetencyTestSettingService } from './competency-test-setting.service';
import { CompetencyTestSettingController } from './competency-test-setting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompetencyTestSetting } from './entities/competency-test-setting.entity';
import { CompetencyTestQuestion } from '@/competency-test-question/entities/competency-test-question.entity';
import { CompetencyTestOption } from '@/competency-test-option/entities/competency-test-option.entity';
import { CompetencyTestGlobalSetting } from './entities/competency-test-global-setting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompetencyTestSetting,
      CompetencyTestQuestion,
      CompetencyTestOption,
      CompetencyTestGlobalSetting,
    ]),
  ],
  controllers: [CompetencyTestSettingController],
  providers: [CompetencyTestSettingService],
})
export class CompetencyTestSettingModule {}
