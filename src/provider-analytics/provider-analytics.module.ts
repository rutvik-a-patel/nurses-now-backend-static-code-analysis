import { Module } from '@nestjs/common';
import { ProviderAnalyticsService } from './provider-analytics.service';
import { ProviderAnalyticsController } from './provider-analytics.controller';

@Module({
  controllers: [ProviderAnalyticsController],
  providers: [ProviderAnalyticsService],
})
export class ProviderAnalyticsModule {}
