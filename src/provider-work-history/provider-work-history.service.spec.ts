import { Test, TestingModule } from '@nestjs/testing';
import { ProviderWorkHistoryService } from './provider-work-history.service';
import { ProviderWorkHistory } from './entities/provider-work-history.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreateProviderWorkHistoryDto } from './dto/create-provider-work-history.dto';
import { UpdateProviderWorkHistoryDto } from './dto/update-provider-work-history.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';

describe('ProviderWorkHistoryService', () => {
  let service: ProviderWorkHistoryService;
  let providerWorkHistoryRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderWorkHistoryService,
        {
          provide: getRepositoryToken(ProviderWorkHistory),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProviderWorkHistoryService>(
      ProviderWorkHistoryService,
    );
    providerWorkHistoryRepository = module.get<Repository<ProviderWorkHistory>>(
      getRepositoryToken(ProviderWorkHistory),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a new work history', async () => {
      const createProviderWorkHistoryDto = new CreateProviderWorkHistoryDto();
      const mockHistory = new ProviderWorkHistory();
      providerWorkHistoryRepository.save.mockResolvedValue(mockHistory);
      const result = await service.create(createProviderWorkHistoryDto);
      expect(providerWorkHistoryRepository.save).toHaveBeenCalledWith(
        createProviderWorkHistoryDto,
      );
      expect(result).toEqual(mockHistory);
    });
  });

  describe('findOneWhere', () => {
    it('should find one work history by criteria', async () => {
      const options = { where: { id: '1' } };
      const mockHistory = new ProviderWorkHistory();
      providerWorkHistoryRepository.findOne.mockResolvedValue(mockHistory);
      const result = await service.findOneWhere(options);
      expect(providerWorkHistoryRepository.findOne).toHaveBeenCalledWith(
        options,
      );
      expect(result).toEqual(mockHistory);
    });
  });

  describe('findAll', () => {
    it('should return a list of work history and count', async () => {
      const options = {};
      const mockHistory = [
        new ProviderWorkHistory(),
        new ProviderWorkHistory(),
      ];
      const count = mockHistory.length;
      providerWorkHistoryRepository.findAndCount.mockResolvedValue([
        mockHistory,
        count,
      ]);
      const result = await service.findAll(options);
      expect(providerWorkHistoryRepository.findAndCount).toHaveBeenCalledWith(
        options,
      );
      expect(result).toEqual([mockHistory, count]);
    });
  });

  describe('update', () => {
    it('should update an work history and return the result', async () => {
      const updateProviderWorkHistoryDto = new UpdateProviderWorkHistoryDto();
      const id = '1';
      const updateResult = { affected: 1 };
      const expectedDto = {
        ...updateProviderWorkHistoryDto,
        updated_at: expect.any(String), // Expect any string for the 'updated_at', or mock Date to control output
      };

      providerWorkHistoryRepository.update.mockResolvedValue(updateResult);

      const result = await service.update(id, updateProviderWorkHistoryDto);

      expect(providerWorkHistoryRepository.update).toHaveBeenCalledWith(
        id,
        expectedDto,
      );
      expect(result).toEqual(updateResult);
    });
  });

  describe('remove', () => {
    it('should mark a work history as deleted', async () => {
      const deleteDto = new DeleteDto();
      const updateResult: any = { affected: 1 };
      providerWorkHistoryRepository.update.mockResolvedValue(updateResult);
      const where: any = { id: '1', deleted_at: IsNull() };

      const result = await service.remove(where, deleteDto);

      expect(providerWorkHistoryRepository.update).toHaveBeenCalledWith(where, {
        deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: expect.any(String),
      });
      expect(result).toEqual({ affected: 1 });
    });
  });
});
