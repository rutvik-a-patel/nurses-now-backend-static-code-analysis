import { Test, TestingModule } from '@nestjs/testing';
import { BadgeSettingService } from './badge-setting.service';

describe('BadgeSettingService', () => {
  let service: BadgeSettingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BadgeSettingService],
    }).compile();

    service = module.get<BadgeSettingService>(BadgeSettingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
