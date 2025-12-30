import { Test, TestingModule } from '@nestjs/testing';
import { FacilityProfileSettingService } from './facility-profile-setting.service';
import { FacilityProfileSetting } from './entities/facility-profile-setting.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateFacilityProfileSettingDto } from './dto/update-facility-profile-setting.dto';

describe('FacilityProfileSettingService', () => {
  let service: FacilityProfileSettingService;
  let settingRepository: any;
  const mockQueryBuilder: any = {
    groupBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacilityProfileSettingService,
        {
          provide: getRepositoryToken(FacilityProfileSetting),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<FacilityProfileSettingService>(
      FacilityProfileSettingService,
    );
    settingRepository = module.get<Repository<FacilityProfileSetting>>(
      getRepositoryToken(FacilityProfileSetting),
    );
    settingRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneWhere', () => {
    it('should find one setting by criteria', async () => {
      const options = { where: { id: '1' } };
      const setting = new FacilityProfileSetting();
      settingRepository.findOne.mockResolvedValue(setting);
      const result = await service.findOneWhere(options);
      expect(settingRepository.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual(setting);
    });
  });

  describe('update', () => {
    it('should update an setting and return the result', async () => {
      const updateFacilityProfileSettingDto =
        new UpdateFacilityProfileSettingDto();
      const id = '1';
      const updateResult = { affected: 1 };

      settingRepository.update.mockResolvedValue(updateResult);

      const result = await service.update(
        { id },
        updateFacilityProfileSettingDto,
      );
      expect(result).toEqual(updateResult);
    });
  });

  describe('findAll', () => {
    it('should return a list of certificates and count', async () => {
      const setting = [
        new FacilityProfileSetting(),
        new FacilityProfileSetting(),
      ];
      mockQueryBuilder.getRawMany.mockResolvedValue(setting);
      const result = await service.findAll();
      expect(result).toEqual(setting);
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
    });
  });
});
