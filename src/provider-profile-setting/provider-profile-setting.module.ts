import { Module } from '@nestjs/common';
import { ProviderProfileSettingService } from './provider-profile-setting.service';
import { ProviderProfileSettingController } from './provider-profile-setting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderProfileSetting } from './entities/provider-profile-setting.entity';
import { ProviderProfileSettingSubSection } from './entities/provider-profile-setting-sub-section.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProviderProfileSetting,
      ProviderProfileSettingSubSection,
    ]),
  ],
  controllers: [ProviderProfileSettingController],
  providers: [ProviderProfileSettingService],
})
export class ProviderProfileSettingModule {}
