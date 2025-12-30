import { Module } from '@nestjs/common';
import { AutoSchedulingSettingService } from './auto-scheduling-setting.service';
import { AutoSchedulingSettingController } from './auto-scheduling-setting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutoSchedulingSetting } from './entities/auto-scheduling-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AutoSchedulingSetting])],
  controllers: [AutoSchedulingSettingController],
  providers: [AutoSchedulingSettingService],
})
export class AutoSchedulingSettingModule {}
