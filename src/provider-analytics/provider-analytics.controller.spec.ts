import { Test, TestingModule } from '@nestjs/testing';
import { ProviderAnalyticsController } from './provider-analytics.controller';
import { ProviderAnalyticsService } from './provider-analytics.service';

describe('ProviderAnalyticsController', () => {
  let controller: ProviderAnalyticsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProviderAnalyticsController],
      providers: [ProviderAnalyticsService],
    }).compile();

    controller = module.get<ProviderAnalyticsController>(
      ProviderAnalyticsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
