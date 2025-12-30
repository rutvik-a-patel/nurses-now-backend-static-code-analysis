import { Test, TestingModule } from '@nestjs/testing';
import { FlagSettingService } from './flag-setting.service';
import { FlagSetting } from './entities/flag-setting.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { CreateFlagSettingDto } from './dto/create-flag-setting.dto';
import { UpdateFlagSettingDto } from './dto/update-flag-setting.dto';

describe('FlagSettingService', () => {
  let service: FlagSettingService;
  let flagSettingRepository: any;
  const mockQueryBuilder: any = {
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(new FlagSetting()),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlagSettingService,
        {
          provide: getRepositoryToken(FlagSetting),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              getOne: jest.fn().mockResolvedValue(new FlagSetting()),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<FlagSettingService>(FlagSettingService);
    flagSettingRepository = module.get<Repository<FlagSetting>>(
      getRepositoryToken(FlagSetting),
    );
    flagSettingRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkName', () => {
    it('should return flag data if name exists', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(new FlagSetting());
      const result = await service.checkName('test');
      expect(result).toEqual(new FlagSetting());
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'LOWER(f.name) = LOWER(:name)',
        {
          name: 'test',
        },
      );
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should successfully create a flag setting', async () => {
      const createFlagSettingDto = new CreateFlagSettingDto();
      const mockSetting = new FlagSetting();
      flagSettingRepository.save.mockResolvedValue(mockSetting);

      const result = await service.create(createFlagSettingDto);

      expect(flagSettingRepository.save).toHaveBeenCalledWith(
        createFlagSettingDto,
      );
      expect(result).toEqual(mockSetting);
    });
  });

  describe('findOneWhere', () => {
    it('should find one flag setting by criteria', async () => {
      const options = { where: { id: '1' } };
      const mockSetting = new FlagSetting();
      flagSettingRepository.findOne.mockResolvedValue(mockSetting);
      const result = await service.findOneWhere(options);
      expect(flagSettingRepository.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual(mockSetting);
    });
  });

  describe('findAll', () => {
    it('should return a list of flag setting and count', async () => {
      const options = {};
      const mockSetting = [new FlagSetting(), new FlagSetting()];
      const count = mockSetting.length;
      flagSettingRepository.findAndCount.mockResolvedValue([
        mockSetting,
        count,
      ]);
      const result = await service.findAll(options);
      expect(flagSettingRepository.findAndCount).toHaveBeenCalledWith(options);
      expect(result).toEqual([mockSetting, count]);
    });
  });

  describe('update', () => {
    it('should update flag setting and return the result', async () => {
      const updateFlagSettingDto = new UpdateFlagSettingDto();
      const id = '1';
      const updateResult = { affected: 1 };

      flagSettingRepository.update.mockResolvedValue(updateResult);

      const result = await service.update(id, updateFlagSettingDto);

      expect(flagSettingRepository.update).toHaveBeenCalledWith(id, {
        ...updateFlagSettingDto,
        updated_at: expect.any(String),
      });
      expect(result).toEqual(updateResult);
    });
  });

  describe('remove', () => {
    it('should mark flag setting as deleted', async () => {
      const id = '1';
      const deleteDto = new DeleteDto();
      const updateResult: any = { affected: 1 };
      flagSettingRepository.update.mockResolvedValue(updateResult);

      const result = await service.remove(id, deleteDto);
      expect(flagSettingRepository.update).toHaveBeenCalledWith(
        { id: id, deleted_at: IsNull() },
        {
          deleted_at_ip: deleteDto.deleted_at_ip,
          deleted_at: expect.any(String),
        },
      );
      expect(result).toEqual({ affected: 1 });
    });
  });
});
