import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnsPreferenceService } from './columns-preference.service';
import { ColumnsPreferenceController } from './columns-preference.controller';
import { ColumnsPreference } from './entities/columns-preference.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ColumnsPreference])],
  providers: [ColumnsPreferenceService],
  controllers: [ColumnsPreferenceController],
  exports: [ColumnsPreferenceService],
})
export class ColumnsPreferenceModule {}
