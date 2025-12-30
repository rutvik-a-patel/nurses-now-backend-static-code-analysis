import { Test, TestingModule } from '@nestjs/testing';
import { ProviderAnalyticsService } from './provider-analytics.service';

describe('ProviderAnalyticsService', () => {
  let service: ProviderAnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProviderAnalyticsService],
    }).compile();

    service = module.get<ProviderAnalyticsService>(ProviderAnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
