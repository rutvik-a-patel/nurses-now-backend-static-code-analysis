import { Module } from '@nestjs/common';
import { FacilityGeneralSettingService } from './facility-general-setting.service';
import { FacilityGeneralSettingController } from './facility-general-setting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacilityGeneralSetting } from './entities/facility-general-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FacilityGeneralSetting])],
  controllers: [FacilityGeneralSettingController],
  providers: [FacilityGeneralSettingService],
})
export class FacilityGeneralSettingModule {}
