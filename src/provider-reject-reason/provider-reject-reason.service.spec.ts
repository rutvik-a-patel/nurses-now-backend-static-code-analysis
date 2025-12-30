import { Test, TestingModule } from '@nestjs/testing';
import { ProviderRejectReasonService } from './provider-reject-reason.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProviderRejectReason } from './entities/provider-reject-reason.entity';
import { FindManyOptions, FindOneOptions, IsNull, Repository } from 'typeorm';
import { CreateProviderRejectReasonDto } from './dto/create-provider-reject-reason.dto';
import { UpdateProviderRejectReasonDto } from './dto/update-provider-reject-reason.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';

describe('ProviderRejectReasonService', () => {
  let service: ProviderRejectReasonService;
  let providerReasonRepository: any;

  const mockQueryBuilder: any = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderRejectReasonService,
        {
          provide: getRepositoryToken(ProviderRejectReason),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProviderRejectReasonService>(
      ProviderRejectReasonService,
    );
    providerReasonRepository = module.get<Repository<ProviderRejectReason>>(
      getRepositoryToken(ProviderRejectReason),
    );
    providerReasonRepository.createQueryBuilder = jest.fn(
      () => mockQueryBuilder,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createProviderRejectReasonDto = new CreateProviderRejectReasonDto();
    it('should create new reject reason', async () => {
      providerReasonRepository.save.mockResolvedValue(
        new ProviderRejectReason(),
      );
      const result = await service.create(createProviderRejectReasonDto);
      expect(providerReasonRepository.save).toHaveBeenCalledWith(
        createProviderRejectReasonDto,
      );
      expect(result).toEqual(new ProviderRejectReason());
    });
  });

  describe('findOneWhere', () => {
    const options: FindOneOptions<ProviderRejectReason> = {
      where: { id: '1' },
    };
    it('should return one reject reason', async () => {
      providerReasonRepository.findOne.mockResolvedValue(
        new ProviderRejectReason(),
      );
      const result = await service.findOneWhere(options);
      expect(providerReasonRepository.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual(new ProviderRejectReason());
    });
  });

  describe('checkName', () => {
    const reason = 'test';
    const id = '1';
    it('should check name is exist or not', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(new ProviderRejectReason());

      const result = await service.checkName(reason, id);
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
      expect(result).toEqual(new ProviderRejectReason());
    });
  });

  describe('findAll', () => {
    const options: FindManyOptions<ProviderRejectReason> = {
      where: { id: '1' },
    };
    it('should return reject reason list', async () => {
      providerReasonRepository.findAndCount.mockResolvedValue([
        [new ProviderRejectReason()],
        1,
      ]);
      const result = await service.findAll(options);
      expect(providerReasonRepository.findAndCount).toHaveBeenCalledWith(
        options,
      );
      expect(result).toEqual([[new ProviderRejectReason()], 1]);
    });
  });

  describe('update', () => {
    const id = '1';
    const updateProviderRejectReasonDto = new UpdateProviderRejectReasonDto();
    it('should update reject reason', async () => {
      providerReasonRepository.update.mockResolvedValue({ affected: 1 });
      const result = await service.update(id, updateProviderRejectReasonDto);
      expect(providerReasonRepository.update).toHaveBeenCalledWith(
        id,
        updateProviderRejectReasonDto,
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('remove', () => {
    const id = '1';
    const deleteDto = new DeleteDto();
    it('should remove reject reason', async () => {
      providerReasonRepository.update.mockResolvedValue({ affected: 1 });
      const result = await service.remove(id, deleteDto);
      expect(providerReasonRepository.update).toHaveBeenCalledWith(
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
