import { Module } from '@nestjs/common';
import { ProviderGeneralSettingService } from './provider-general-setting.service';
import { ProviderGeneralSettingController } from './provider-general-setting.controller';
import { ProviderGeneralSettingSection } from './entities/provider-general-setting-section.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderGeneralSettingSubSection } from './entities/provider-general-setting-sub-section.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProviderGeneralSettingSection,
      ProviderGeneralSettingSubSection,
    ]),
  ],
  controllers: [ProviderGeneralSettingController],
  providers: [ProviderGeneralSettingService],
})
export class ProviderGeneralSettingModule {}
