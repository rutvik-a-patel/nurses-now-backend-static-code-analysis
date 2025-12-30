import { Module } from '@nestjs/common';
import { BadgeSettingService } from './badge-setting.service';
import { BadgeSettingController } from './badge-setting.controller';

@Module({
  controllers: [BadgeSettingController],
  providers: [BadgeSettingService],
})
export class BadgeSettingModule {}
