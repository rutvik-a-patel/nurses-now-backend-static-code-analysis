import { Test, TestingModule } from '@nestjs/testing';
import { FloorDetailService } from './floor-detail.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FloorDetail } from './entities/floor-detail.entity';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { CreateFloorDetailDto } from './dto/create-floor-detail.dto';
import { UpdateFloorDetailDto } from './dto/update-floor-detail.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { Activity } from '@/activity/entities/activity.entity';

describe('FloorDetailService', () => {
  let service: FloorDetailService;
  let floorDetailRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FloorDetailService,
        {
          provide: getRepositoryToken(FloorDetail),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Activity),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<FloorDetailService>(FloorDetailService);
    floorDetailRepository = module.get<Repository<FloorDetail>>(
      getRepositoryToken(FloorDetail),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createFloorDetailDto = new CreateFloorDetailDto();
    it('should create new floor detail', async () => {
      const mockFloor = new FloorDetail();
      floorDetailRepository.save.mockResolvedValue(mockFloor);
      const result = await service.create(createFloorDetailDto);
      expect(floorDetailRepository.save).toHaveBeenCalledWith(
        createFloorDetailDto,
      );
      expect(result).toEqual(mockFloor);
    });
  });

  describe('findAll', () => {
    const where: FindManyOptions<FloorDetail> = { where: { id: '1' } };
    it('should get floor detail list', async () => {
      const mockFloor = [new FloorDetail()];
      const count = mockFloor.length;
      floorDetailRepository.findAndCount.mockResolvedValue([mockFloor, count]);
      const result = await service.findAll(where);
      expect(floorDetailRepository.findAndCount).toHaveBeenCalledWith(where);
      expect(result).toEqual([mockFloor, count]);
    });
  });

  describe('findOneWhere', () => {
    const where: FindOneOptions<FloorDetail> = { where: { id: '1' } };
    it('should get floor detail', async () => {
      const mockFloor = new FloorDetail();

      floorDetailRepository.findOne.mockResolvedValue(mockFloor);
      const result = await service.findOneWhere(where);
      expect(floorDetailRepository.findOne).toHaveBeenCalledWith(where);
      expect(result).toEqual(mockFloor);
    });
  });

  describe('update', () => {
    const where: FindOptionsWhere<FloorDetail> = { id: '1' };
    const updateFloorDetailDto = new UpdateFloorDetailDto();
    it('should update floor detail', async () => {
      const mockFloor = { affected: 1 };

      floorDetailRepository.update.mockResolvedValue(mockFloor);
      const result = await service.update(where, updateFloorDetailDto);
      expect(floorDetailRepository.update).toHaveBeenCalledWith(
        where,
        updateFloorDetailDto,
      );
      expect(result).toEqual(mockFloor);
    });
  });

  describe('remove', () => {
    const where: FindOptionsWhere<FloorDetail> = { id: '1' };
    const deleteDto = new DeleteDto();
    it('should remove floor detail', async () => {
      const mockFloor = { affected: 1 };

      floorDetailRepository.update.mockResolvedValue(mockFloor);
      const result = await service.remove(where, deleteDto);
      expect(floorDetailRepository.update).toHaveBeenCalledWith(where, {
        deleted_at: expect.any(String),
        ...deleteDto,
      });
      expect(result).toEqual(mockFloor);
    });
  });
});
