import { Module } from '@nestjs/common';
import { FacilityProfileSettingService } from './facility-profile-setting.service';
import { FacilityProfileSettingController } from './facility-profile-setting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacilityProfileSetting } from './entities/facility-profile-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FacilityProfileSetting])],
  controllers: [FacilityProfileSettingController],
  providers: [FacilityProfileSettingService],
})
export class FacilityProfileSettingModule {}
