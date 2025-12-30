import { Module } from '@nestjs/common';
import { SiteAccessSettingService } from './site-access-setting.service';
import { SiteAccessSettingController } from './site-access-setting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteAccessSetting } from './entities/site-access-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SiteAccessSetting])],
  controllers: [SiteAccessSettingController],
  providers: [SiteAccessSettingService],
})
export class SiteAccessSettingModule {}
