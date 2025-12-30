import { Test, TestingModule } from '@nestjs/testing';
import { ShiftCancelReasonService } from './shift-cancel-reason.service';
import { IsNull, Repository } from 'typeorm';
import { ShiftCancelReason } from './entities/shift-cancel-reason.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateShiftCancelReasonDto } from './dto/create-shift-cancel-reason.dto';
import { UpdateShiftCancelReasonDto } from './dto/update-shift-cancel-reason.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { USER_TYPE } from '@/shared/constants/enum';

describe('ShiftCancelReasonService', () => {
  let service: ShiftCancelReasonService;
  let mockShiftCancelReasonRepository: jest.Mocked<
    Repository<ShiftCancelReason>
  >;

  const mockQueryBuilder: any = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShiftCancelReasonService,
        {
          provide: getRepositoryToken(ShiftCancelReason),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ShiftCancelReasonService>(ShiftCancelReasonService);
    mockShiftCancelReasonRepository = module.get(
      getRepositoryToken(ShiftCancelReason),
    );
    mockShiftCancelReasonRepository.createQueryBuilder = jest.fn(
      () => mockQueryBuilder,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new shift cancel reason', async () => {
      const createDto: CreateShiftCancelReasonDto = {
        user_type: USER_TYPE.facility,
        reason: 'demo reason',
      };
      const shiftType = new ShiftCancelReason();

      mockShiftCancelReasonRepository.save.mockResolvedValue(shiftType);

      const result = await service.create(createDto);
      expect(mockShiftCancelReasonRepository.save).toHaveBeenCalledWith(
        createDto,
      );
      expect(result).toEqual(shiftType);
    });
  });

  describe('checkName', () => {
    const reason = 'test';
    const user_type = USER_TYPE.facility;
    const id = '1';
    it('should check name is exist or not', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(new ShiftCancelReason());

      const result = await service.checkName(reason, user_type, id);
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
      expect(result).toEqual(new ShiftCancelReason());
    });
  });

  describe('findOneWhere', () => {
    it('should find one shift cancel reason by criteria', async () => {
      const shiftType = new ShiftCancelReason();

      mockShiftCancelReasonRepository.findOne.mockResolvedValue(shiftType);

      const result = await service.findOneWhere({
        where: { id: '1' },
      });
      expect(mockShiftCancelReasonRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(shiftType);
    });
  });

  describe('findAll', () => {
    it('should return a list of shift cancel reason', async () => {
      const options = {};
      const shiftType = [new ShiftCancelReason(), new ShiftCancelReason()];
      const count = shiftType.length;
      mockShiftCancelReasonRepository.findAndCount.mockResolvedValue([
        shiftType,
        count,
      ]);
      const result = await service.findAll(options);
      expect(mockShiftCancelReasonRepository.findAndCount).toHaveBeenCalledWith(
        options,
      );
      expect(result).toEqual([shiftType, count]);
    });
  });

  describe('updateWhere', () => {
    it('should update a shift type', async () => {
      const updateDto: UpdateShiftCancelReasonDto = {
        reason: 'update demo reason',
      };
      const updateResult: any = { affected: 1 };

      mockShiftCancelReasonRepository.update.mockResolvedValue(updateResult);

      const result = await service.updateWhere({ id: '1' }, updateDto);
      expect(mockShiftCancelReasonRepository.update).toHaveBeenCalledWith(
        { id: '1' },
        {
          ...updateDto,
          updated_at: expect.any(String),
        },
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('remove', () => {
    it('should mark a shift type as deleted', async () => {
      const deleteDto: DeleteDto = { deleted_at_ip: '127.0.0.1' };
      const updateResult: any = { affected: 1 };
      mockShiftCancelReasonRepository.update.mockResolvedValue(updateResult);

      const result = await service.remove('1', deleteDto);
      expect(mockShiftCancelReasonRepository.update).toHaveBeenCalledWith(
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
