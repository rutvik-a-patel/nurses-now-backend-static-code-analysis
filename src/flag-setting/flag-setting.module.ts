import { Module } from '@nestjs/common';
import { FlagSettingService } from './flag-setting.service';
import { FlagSettingController } from './flag-setting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlagSetting } from './entities/flag-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FlagSetting])],
  controllers: [FlagSettingController],
  providers: [FlagSettingService],
})
export class FlagSettingModule {}
