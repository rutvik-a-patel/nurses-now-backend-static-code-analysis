import { Test, TestingModule } from '@nestjs/testing';
import { ProviderProfileSettingService } from './provider-profile-setting.service';
import { ProviderProfileSetting } from './entities/provider-profile-setting.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProviderProfileSettingSubSection } from './entities/provider-profile-setting-sub-section.entity';
import { Repository } from 'typeorm';
import { UpdateSettingDto } from './dto/update-setting.dto';

describe('ProviderProfileSettingService', () => {
  let service: ProviderProfileSettingService;
  let providerProfileSettingRepository: any;
  let providerProfileSettingSubSectionRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderProfileSettingService,
        {
          provide: getRepositoryToken(ProviderProfileSetting),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProviderProfileSettingSubSection),
          useValue: {
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProviderProfileSettingService>(
      ProviderProfileSettingService,
    );
    providerProfileSettingRepository = module.get<
      Repository<ProviderProfileSetting>
    >(getRepositoryToken(ProviderProfileSetting));
    providerProfileSettingSubSectionRepository = module.get<
      Repository<ProviderProfileSettingSubSection>
    >(getRepositoryToken(ProviderProfileSettingSubSection));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneWhere', () => {
    it('should find one setting', async () => {
      const options = { where: { id: '1' } };
      const setting = new ProviderProfileSetting();
      providerProfileSettingRepository.findOne.mockResolvedValue(setting);
      const result = await service.findOneWhere(options);
      expect(providerProfileSettingRepository.findOne).toHaveBeenCalledWith(
        options,
      );
      expect(result).toEqual(setting);
    });
  });

  describe('findAll', () => {
    it('should return a list of setting', async () => {
      const options = {};
      const settings = [
        new ProviderProfileSetting(),
        new ProviderProfileSetting(),
      ];
      providerProfileSettingRepository.find.mockResolvedValue(settings);
      const result = await service.findAll(options);
      expect(providerProfileSettingRepository.find).toHaveBeenCalledWith(
        options,
      );
      expect(result).toEqual(settings);
    });
  });

  describe('update', () => {
    it('should update an sub section and return the result', async () => {
      const updateSettingDto = new UpdateSettingDto();
      const id = '1';
      const updateResult = { affected: 1 };
      const expectedDto = {
        ...updateSettingDto,
        updated_at: expect.any(String), // Expect any string for the 'updated_at', or mock Date to control output
      };

      providerProfileSettingSubSectionRepository.update.mockResolvedValue(
        updateResult,
      );

      const result = await service.updateSubSection(id, updateSettingDto);

      expect(
        providerProfileSettingSubSectionRepository.update,
      ).toHaveBeenCalledWith(id, expectedDto);
      expect(result).toEqual(updateResult);
    });
  });
});
