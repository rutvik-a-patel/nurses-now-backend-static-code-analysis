import { Module } from '@nestjs/common';
import { ScheduleRequestSettingsService } from './schedule-request-settings.service';
import { ScheduleRequestSettingsController } from './schedule-request-settings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleRequestSetting } from './entities/schedule-request-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduleRequestSetting])],
  controllers: [ScheduleRequestSettingsController],
  providers: [ScheduleRequestSettingsService],
})
export class ScheduleRequestSettingsModule {}
