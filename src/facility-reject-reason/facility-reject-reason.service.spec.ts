import { Test, TestingModule } from '@nestjs/testing';
import { FacilityRejectReasonService } from './facility-reject-reason.service';
import { FacilityRejectReason } from './entities/facility-reject-reason.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreateFacilityRejectReasonDto } from './dto/create-facility-reject-reason.dto';
import { UpdateFacilityRejectReasonDto } from './dto/update-facility-reject-reason.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';

describe('FacilityRejectReasonService', () => {
  let service: FacilityRejectReasonService;
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
        FacilityRejectReasonService,
        {
          provide: getRepositoryToken(FacilityRejectReason),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FacilityRejectReasonService>(
      FacilityRejectReasonService,
    );
    facilityReasonRepository = module.get<Repository<FacilityRejectReason>>(
      getRepositoryToken(FacilityRejectReason),
    );
    facilityReasonRepository.createQueryBuilder = jest.fn(
      () => mockQueryBuilder,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a new education history', async () => {
      const createFacilityRejectReasonDto = new CreateFacilityRejectReasonDto();
      const mockHistory = new FacilityRejectReason();
      facilityReasonRepository.save.mockResolvedValue(mockHistory);

      const result = await service.create(createFacilityRejectReasonDto);

      expect(facilityReasonRepository.save).toHaveBeenCalledWith(
        createFacilityRejectReasonDto,
      );
      expect(result).toEqual(mockHistory);
    });
  });

  describe('checkName', () => {
    const reason = 'test';
    const id = '1';
    it('should check name is exist or not', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(new FacilityRejectReason());

      const result = await service.checkName(reason, id);
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
      expect(result).toEqual(new FacilityRejectReason());
    });
  });

  describe('findOneWhere', () => {
    it('should find one education history by criteria', async () => {
      const options = { where: { id: '1' } };
      const mockHistory = new FacilityRejectReason();
      facilityReasonRepository.findOne.mockResolvedValue(mockHistory);
      const result = await service.findOneWhere(options);
      expect(facilityReasonRepository.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual(mockHistory);
    });
  });

  describe('findAll', () => {
    it('should return a list of education history and count', async () => {
      const options = {};
      const mockHistory = [
        new FacilityRejectReason(),
        new FacilityRejectReason(),
      ];
      const count = mockHistory.length;
      facilityReasonRepository.findAndCount.mockResolvedValue([
        mockHistory,
        count,
      ]);
      const result = await service.findAll(options);
      expect(facilityReasonRepository.findAndCount).toHaveBeenCalledWith(
        options,
      );
      expect(result).toEqual([mockHistory, count]);
    });
  });

  describe('update', () => {
    it('should update an education history and return the result', async () => {
      const updateFacilityRejectReasonDto = new UpdateFacilityRejectReasonDto();
      const id = '1';
      const updateResult = { affected: 1 };

      facilityReasonRepository.update.mockResolvedValue(updateResult);

      const result = await service.update(id, updateFacilityRejectReasonDto);

      expect(facilityReasonRepository.update).toHaveBeenCalledWith(
        id,
        updateFacilityRejectReasonDto,
      );
      expect(result).toEqual(updateResult);
    });
  });

  describe('remove', () => {
    it('should mark a education history as deleted', async () => {
      const id = '1';
      const deleteDto = new DeleteDto();
      const updateResult: any = { affected: 1 };
      facilityReasonRepository.update.mockResolvedValue(updateResult);

      const result = await service.remove(id, deleteDto);
      expect(facilityReasonRepository.update).toHaveBeenCalledWith(
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
