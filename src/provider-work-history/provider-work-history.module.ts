import { Module } from '@nestjs/common';
import { ProviderWorkHistoryService } from './provider-work-history.service';
import { ProviderWorkHistoryController } from './provider-work-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderWorkHistory } from './entities/provider-work-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProviderWorkHistory])],
  controllers: [ProviderWorkHistoryController],
  providers: [ProviderWorkHistoryService],
})
export class ProviderWorkHistoryModule {}
