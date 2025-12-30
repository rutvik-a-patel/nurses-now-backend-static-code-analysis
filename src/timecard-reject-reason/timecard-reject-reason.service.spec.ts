import { Test, TestingModule } from '@nestjs/testing';
import { TimecardRejectReasonService } from './timecard-reject-reason.service';
import { TimecardRejectReason } from './entities/timecard-reject-reason.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreateTimecardRejectReasonDto } from './dto/create-timecard-reject-reason.dto';
import { UpdateTimecardRejectReasonDto } from './dto/update-timecard-reject-reason.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';

describe('TimecardRejectReasonService', () => {
  let service: TimecardRejectReasonService;
  let timecardRejectReasonRepository: any;

  const mockQueryBuilder: any = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimecardRejectReasonService,
        {
          provide: getRepositoryToken(TimecardRejectReason),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TimecardRejectReasonService>(
      TimecardRejectReasonService,
    );
    timecardRejectReasonRepository = module.get<
      Repository<TimecardRejectReason>
    >(getRepositoryToken(TimecardRejectReason));
    timecardRejectReasonRepository.createQueryBuilder = jest.fn(
      () => mockQueryBuilder,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a new timecard reject reason', async () => {
      const createTimecardRejectReasonDto = new CreateTimecardRejectReasonDto();
      const mockRejectReason = new TimecardRejectReason();
      timecardRejectReasonRepository.save.mockResolvedValue(mockRejectReason);
      const result = await service.create(createTimecardRejectReasonDto);
      expect(timecardRejectReasonRepository.save).toHaveBeenCalledWith(
        createTimecardRejectReasonDto,
      );
      expect(result).toEqual(mockRejectReason);
    });
  });

  describe('checkName', () => {
    const reason = 'test';
    const id = '1';
    it('should check name is exist or not', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(new TimecardRejectReason());

      const result = await service.checkName(reason, id);
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
      expect(result).toEqual(new TimecardRejectReason());
    });
  });

  describe('findOneWhere', () => {
    it('should find one reject reason by criteria', async () => {
      const options = { where: { id: '1' } };
      const mockRejectReason = new TimecardRejectReason();
      timecardRejectReasonRepository.findOne.mockResolvedValue(
        mockRejectReason,
      );
      const result = await service.findOneWhere(options);
      expect(timecardRejectReasonRepository.findOne).toHaveBeenCalledWith(
        options,
      );
      expect(result).toEqual(mockRejectReason);
    });
  });

  describe('findAll', () => {
    it('should return a list of reject reasons and count', async () => {
      const options = {};
      const mockRejectReasons = [
        new TimecardRejectReason(),
        new TimecardRejectReason(),
      ];
      const count = mockRejectReasons.length;
      timecardRejectReasonRepository.findAndCount.mockResolvedValue([
        mockRejectReasons,
        count,
      ]);
      const result = await service.findAll(options);
      expect(timecardRejectReasonRepository.findAndCount).toHaveBeenCalledWith(
        options,
      );
      expect(result).toEqual([mockRejectReasons, count]);
    });
  });

  describe('update', () => {
    it('should update an reject reason and return the result', async () => {
      const updateTimecardRejectReasonDto = new UpdateTimecardRejectReasonDto();
      const id = '1';
      const updateResult = { affected: 1 };
      const expectedDto = {
        ...updateTimecardRejectReasonDto,
        updated_at: expect.any(String), // Expect any string for the 'updated_at', or mock Date to control output
      };

      timecardRejectReasonRepository.update.mockResolvedValue(updateResult);

      const result = await service.update(id, updateTimecardRejectReasonDto);

      expect(timecardRejectReasonRepository.update).toHaveBeenCalledWith(
        id,
        expectedDto,
      );
      expect(result).toEqual(updateResult);
    });
  });

  describe('remove', () => {
    it('should mark a reject reason as deleted', async () => {
      const deleteDto = new DeleteDto();
      const updateResult: any = { affected: 1 };
      timecardRejectReasonRepository.update.mockResolvedValue(updateResult);

      const result = await service.remove('1', deleteDto);
      expect(timecardRejectReasonRepository.update).toHaveBeenCalledWith(
        { id: '1', deleted_at: IsNull() },
        {
          ...deleteDto,
          deleted_at: expect.any(String),
        },
      );
      expect(result).toEqual({ affected: 1 });
    });
  });
});
