import { Module } from '@nestjs/common';
import { StatusSettingService } from './status-setting.service';
import { StatusSettingController } from './status-setting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusSetting } from './entities/status-setting.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { Provider } from '@/provider/entities/provider.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StatusSetting, Facility, Provider])],
  controllers: [StatusSettingController],
  providers: [StatusSettingService],
})
export class StatusSettingModule {}
