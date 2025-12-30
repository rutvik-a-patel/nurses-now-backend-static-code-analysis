import { Test, TestingModule } from '@nestjs/testing';
import { BadgeSettingController } from './badge-setting.controller';
import { BadgeSettingService } from './badge-setting.service';

describe('BadgeSettingController', () => {
  let controller: BadgeSettingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BadgeSettingController],
      providers: [BadgeSettingService],
    }).compile();

    controller = module.get<BadgeSettingController>(BadgeSettingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
