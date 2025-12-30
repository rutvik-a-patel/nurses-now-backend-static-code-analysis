import { Test, TestingModule } from '@nestjs/testing';
import { FacilityGeneralSettingService } from './facility-general-setting.service';
import { FacilityGeneralSetting } from './entities/facility-general-setting.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateFacilityGeneralSettingDto } from './dto/update-facility-general-setting.dto';

describe('FacilityGeneralSettingService', () => {
  let service: FacilityGeneralSettingService;
  let facilityGeneralSettingRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacilityGeneralSettingService,
        {
          provide: getRepositoryToken(FacilityGeneralSetting),
          useValue: { findOne: jest.fn(), find: jest.fn(), update: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<FacilityGeneralSettingService>(
      FacilityGeneralSettingService,
    );
    facilityGeneralSettingRepository = module.get<
      Repository<FacilityGeneralSetting>
    >(getRepositoryToken(FacilityGeneralSetting));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneWhere', () => {
    it('should find one setting by criteria', async () => {
      const options = { where: { label: 'CN' } };
      const data = new FacilityGeneralSetting();
      facilityGeneralSettingRepository.findOne.mockResolvedValue(data);
      const result = await service.findOneWhere(options);
      expect(facilityGeneralSettingRepository.findOne).toHaveBeenCalledWith(
        options,
      );
      expect(result).toEqual(data);
    });
  });

  describe('findAll', () => {
    it('should return a list of setting', async () => {
      const options = {};
      const data = [new FacilityGeneralSetting(), new FacilityGeneralSetting()];
      facilityGeneralSettingRepository.find.mockResolvedValue(data);
      const result = await service.findAll(options);
      expect(facilityGeneralSettingRepository.find).toHaveBeenCalledWith(
        options,
      );
      expect(result).toEqual(data);
    });
  });

  describe('update', () => {
    it('should update an setting and return the result', async () => {
      const updateFacilityGeneralSettingDto =
        new UpdateFacilityGeneralSettingDto();
      const id = '1';
      const updateResult = { affected: 1 };

      facilityGeneralSettingRepository.update.mockResolvedValue(updateResult);

      const result = await service.update(
        { id },
        updateFacilityGeneralSettingDto,
      );
      expect(result).toEqual(updateResult);
    });
  });
});
