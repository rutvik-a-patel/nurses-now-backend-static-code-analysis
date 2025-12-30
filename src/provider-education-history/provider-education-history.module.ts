import { Module } from '@nestjs/common';
import { ProviderEducationHistoryService } from './provider-education-history.service';
import { ProviderEducationHistoryController } from './provider-education-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderEducationHistory } from './entities/provider-education-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProviderEducationHistory])],
  controllers: [ProviderEducationHistoryController],
  providers: [ProviderEducationHistoryService],
})
export class ProviderEducationHistoryModule {}
