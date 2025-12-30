import { Test, TestingModule } from '@nestjs/testing';
import { FacilityShiftSettingService } from './facility-shift-setting.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FacilityShiftSetting } from './entities/facility-shift-setting.entity';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  IsNull,
  Repository,
} from 'typeorm';
import { CreateFacilityShiftSettingDto } from './dto/create-facility-shift-setting.dto';
import { UpdateFacilityShiftSettingDto } from './dto/update-facility-shift-setting.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';

describe('FacilityShiftSettingService', () => {
  let service: FacilityShiftSettingService;
  let facilityReasonRepository: any;

  const mockQueryBuilder: any = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacilityShiftSettingService,
        {
          provide: getRepositoryToken(FacilityShiftSetting),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FacilityShiftSettingService>(
      FacilityShiftSettingService,
    );
    facilityReasonRepository = module.get<Repository<FacilityShiftSetting>>(
      getRepositoryToken(FacilityShiftSetting),
    );
    facilityReasonRepository.createQueryBuilder = jest.fn(
      () => mockQueryBuilder,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createFacilityShiftSettingDto = new CreateFacilityShiftSettingDto();
    it('should create new shift setting', async () => {
      const mockSetting = new FacilityShiftSetting();
      facilityReasonRepository.save.mockResolvedValue(mockSetting);
      const result = await service.create(createFacilityShiftSettingDto);
      expect(facilityReasonRepository.save).toHaveBeenCalledWith(
        createFacilityShiftSettingDto,
      );
      expect(result).toEqual(mockSetting);
    });
  });

  describe('checkName', () => {
    const reason = 'test';
    const id = '1';
    it('should check name is exist or not', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(new FacilityShiftSetting());

      const result = await service.checkName(reason, id);
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
      expect(result).toEqual(new FacilityShiftSetting());
    });
  });

  describe('findAll', () => {
    const where: FindManyOptions<FacilityShiftSetting> = { where: { id: '1' } };
    it('should get shift setting list', async () => {
      const mockSetting = [new FacilityShiftSetting()];
      const count = mockSetting.length;
      facilityReasonRepository.findAndCount.mockResolvedValue([
        mockSetting,
        count,
      ]);
      const result = await service.findAll(where);
      expect(facilityReasonRepository.findAndCount).toHaveBeenCalledWith(where);
      expect(result).toEqual([mockSetting, count]);
    });
  });

  describe('findOneWhere', () => {
    const where: FindOneOptions<FacilityShiftSetting> = { where: { id: '1' } };
    it('should get shift detail', async () => {
      const mockSetting = new FacilityShiftSetting();

      facilityReasonRepository.findOne.mockResolvedValue(mockSetting);
      const result = await service.findOneWhere(where);
      expect(facilityReasonRepository.findOne).toHaveBeenCalledWith(where);
      expect(result).toEqual(mockSetting);
    });
  });

  describe('updateWhere', () => {
    const where: FindOptionsWhere<FacilityShiftSetting> = { id: '1' };
    const updateFacilityShiftSettingDto = new UpdateFacilityShiftSettingDto();
    it('should update shift setting', async () => {
      const mockSetting = { affected: 1 };

      facilityReasonRepository.update.mockResolvedValue(mockSetting);
      const result = await service.updateWhere(
        where,
        updateFacilityShiftSettingDto,
      );
      expect(facilityReasonRepository.update).toHaveBeenCalledWith(
        where,
        updateFacilityShiftSettingDto,
      );
      expect(result).toEqual(mockSetting);
    });
  });

  describe('remove', () => {
    const id = '1';
    const deleteDto = new DeleteDto();
    it('should remove shift setting', async () => {
      const mockSetting = { affected: 1 };

      facilityReasonRepository.update.mockResolvedValue(mockSetting);
      const result = await service.remove(id, deleteDto);
      expect(facilityReasonRepository.update).toHaveBeenCalledWith(
        { id: id, deleted_at: IsNull() },
        {
          deleted_at_ip: deleteDto.deleted_at_ip,
          deleted_at: expect.any(String),
        },
      );
      expect(result).toEqual(mockSetting);
    });
  });
});
