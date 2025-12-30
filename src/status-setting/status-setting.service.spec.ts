import { Test, TestingModule } from '@nestjs/testing';
import { StatusSettingService } from './status-setting.service';
import { StatusSetting } from './entities/status-setting.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreateStatusSettingDto } from './dto/create-status-setting.dto';
import { UpdateStatusSettingDto } from './dto/update-status-setting.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { USER_TYPE } from '@/shared/constants/enum';
import { Facility } from '@/facility/entities/facility.entity';
import { Provider } from '@/provider/entities/provider.entity';

describe('StatusSettingService', () => {
  let service: StatusSettingService;
  let statusSettingRepository: any;
  const mockQueryBuilder: any = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatusSettingService,
        {
          provide: getRepositoryToken(StatusSetting),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              getOne: jest.fn().mockResolvedValue(new StatusSetting()),
            })),
          },
        },
        {
          provide: getRepositoryToken(Facility),
          useValue: {
            countBy: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Provider),
          useValue: {
            countBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StatusSettingService>(StatusSettingService);
    statusSettingRepository = module.get<Repository<StatusSetting>>(
      getRepositoryToken(StatusSetting),
    );
    statusSettingRepository.createQueryBuilder = jest.fn(
      () => mockQueryBuilder,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a new status setting', async () => {
      const createStatusSettingDto = new CreateStatusSettingDto();
      const mockSetting = new StatusSetting();
      statusSettingRepository.save.mockResolvedValue(mockSetting);
      const result = await service.create(createStatusSettingDto);
      expect(statusSettingRepository.save).toHaveBeenCalledWith(
        createStatusSettingDto,
      );
      expect(result).toEqual(mockSetting);
    });
  });

  describe('findOneWhere', () => {
    it('should find one status setting by criteria', async () => {
      const options = { where: { id: '1' } };
      const mockSetting = new StatusSetting();
      statusSettingRepository.findOne.mockResolvedValue(mockSetting);
      const result = await service.findOneWhere(options);
      expect(statusSettingRepository.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual(mockSetting);
    });
  });

  describe('findAll', () => {
    it('should return a list of status settings and count', async () => {
      const options = {};
      const mockSettings = [new StatusSetting(), new StatusSetting()];
      const count = mockSettings.length;
      statusSettingRepository.findAndCount.mockResolvedValue([
        mockSettings,
        count,
      ]);
      const result = await service.findAll(options);
      expect(statusSettingRepository.findAndCount).toHaveBeenCalledWith(
        options,
      );
      expect(result).toEqual([mockSettings, count]);
    });
  });

  describe('update', () => {
    it('should update an status setting and return the result', async () => {
      const updateStatusSettingDto = new UpdateStatusSettingDto();
      const id = '1';
      const updateResult = { affected: 1 };
      const expectedDto = {
        ...updateStatusSettingDto,
        updated_at: expect.any(String), // Expect any string for the 'updated_at', or mock Date to control output
      };

      statusSettingRepository.update.mockResolvedValue(updateResult);

      const result = await service.update(id, updateStatusSettingDto);

      expect(statusSettingRepository.update).toHaveBeenCalledWith(
        id,
        expectedDto,
      );
      expect(result).toEqual(updateResult);
    });
  });

  describe('remove', () => {
    it('should mark a status setting as deleted', async () => {
      const deleteDto = new DeleteDto();
      const updateResult: any = { affected: 1 };
      statusSettingRepository.update.mockResolvedValue(updateResult);

      const result = await service.remove('1', deleteDto);
      expect(statusSettingRepository.update).toHaveBeenCalledWith(
        { id: '1', deleted_at: IsNull() },
        {
          ...deleteDto,
          deleted_at: expect.any(String),
        },
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('checkName', () => {
    it('should return dnr data if name exists', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(new StatusSetting());
      const result = await service.checkName(
        'CertificateName',
        'provider' as USER_TYPE,
      );
      expect(result).toEqual(new StatusSetting());
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'LOWER(ss.name) = LOWER(:name)',
        {
          name: 'CertificateName',
        },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'ss.status_for = :status_for',
        {
          status_for: 'provider',
        },
      );
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
    });
  });
});
