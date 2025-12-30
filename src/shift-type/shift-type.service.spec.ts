import { Test, TestingModule } from '@nestjs/testing';
import { ShiftTypeService } from './shift-type.service';
import { IsNull, Repository } from 'typeorm';
import { ShiftType } from './entities/shift-type.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateShiftTypeDto } from './dto/create-shift-type.dto';
import { DEFAULT_STATUS, SHIFT_TYPE } from '@/shared/constants/enum';
import { UpdateShiftTypeDto } from './dto/update-shift-type.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';

describe('ShiftTypeService', () => {
  let service: ShiftTypeService;
  let mockShiftTypeRepository: jest.Mocked<Repository<ShiftType>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShiftTypeService,
        {
          provide: getRepositoryToken(ShiftType),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ShiftTypeService>(ShiftTypeService);
    mockShiftTypeRepository = module.get(getRepositoryToken(ShiftType));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new shift type', async () => {
      const createDto: CreateShiftTypeDto = {
        name: 'shift type',
        shift_type: SHIFT_TYPE.per_diem_shifts,
        status: DEFAULT_STATUS.active,
      };
      const shiftType = new ShiftType();

      mockShiftTypeRepository.save.mockResolvedValue(shiftType);

      const result = await service.create(createDto);
      expect(mockShiftTypeRepository.save).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(shiftType);
    });
  });

  describe('findOneWhere', () => {
    it('should find one shift type by criteria', async () => {
      const shiftType = new ShiftType();

      mockShiftTypeRepository.findOne.mockResolvedValue(shiftType);

      const result = await service.findOneWhere({
        where: { id: '1' },
      });
      expect(mockShiftTypeRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(shiftType);
    });
  });

  describe('findAll', () => {
    it('should return a list of shift type', async () => {
      const options = {};
      const shiftType = [new ShiftType(), new ShiftType()];
      const count = shiftType.length;
      mockShiftTypeRepository.findAndCount.mockResolvedValue([
        shiftType,
        count,
      ]);
      const result = await service.findAll(options);
      expect(mockShiftTypeRepository.findAndCount).toHaveBeenCalledWith(
        options,
      );
      expect(result).toEqual([shiftType, count]);
    });
  });

  describe('updateWhere', () => {
    it('should update a shift type', async () => {
      const updateDto: UpdateShiftTypeDto = {
        name: 'update shift type',
        shift_type: SHIFT_TYPE.per_diem_shifts,
        status: DEFAULT_STATUS.active,
      };
      const updateResult: any = { affected: 1 };

      mockShiftTypeRepository.update.mockResolvedValue(updateResult);

      const result = await service.updateWhere({ id: '1' }, updateDto);
      expect(mockShiftTypeRepository.update).toHaveBeenCalledWith(
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
      mockShiftTypeRepository.update.mockResolvedValue(updateResult);

      const result = await service.remove('1', deleteDto);
      expect(mockShiftTypeRepository.update).toHaveBeenCalledWith(
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
