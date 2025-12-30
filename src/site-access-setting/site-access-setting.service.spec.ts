import { Test, TestingModule } from '@nestjs/testing';
import { SiteAccessSettingService } from './site-access-setting.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SiteAccessSetting } from './entities/site-access-setting.entity';
import { CreateSiteAccessSettingDto } from './dto/create-site-access-setting.dto';
import { Repository } from 'typeorm';

describe('SiteAccessSettingService', () => {
  let service: SiteAccessSettingService;
  let settingRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SiteAccessSettingService,
        {
          provide: getRepositoryToken(SiteAccessSetting),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SiteAccessSettingService>(SiteAccessSettingService);
    settingRepository = module.get<Repository<SiteAccessSetting>>(
      getRepositoryToken(SiteAccessSetting),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a new setting', async () => {
      const createSiteAccessSettingDto = new CreateSiteAccessSettingDto();
      settingRepository.save.mockResolvedValue(new SiteAccessSetting());
      const result = await service.create(createSiteAccessSettingDto);
      expect(settingRepository.save).toHaveBeenCalledWith(
        createSiteAccessSettingDto,
      );
      expect(result).toEqual(new SiteAccessSetting());
    });
  });

  describe('findOneWhere', () => {
    it('should find one setting by criteria', async () => {
      const options = { where: { id: '1' } };
      const setting = new SiteAccessSetting();
      settingRepository.findOne.mockResolvedValue(setting);
      const result = await service.findOneWhere(options);
      expect(settingRepository.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual(setting);
    });
  });
});
