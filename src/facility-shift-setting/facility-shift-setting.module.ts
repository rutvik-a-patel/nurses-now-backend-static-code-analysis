import { Module } from '@nestjs/common';
import { FacilityShiftSettingService } from './facility-shift-setting.service';
import { FacilityShiftSettingController } from './facility-shift-setting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacilityShiftSetting } from './entities/facility-shift-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FacilityShiftSetting])],
  controllers: [FacilityShiftSettingController],
  providers: [FacilityShiftSettingService],
})
export class FacilityShiftSettingModule {}
