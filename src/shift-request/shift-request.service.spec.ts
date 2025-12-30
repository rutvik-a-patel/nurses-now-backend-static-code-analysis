import { Test, TestingModule } from '@nestjs/testing';
import { ShiftRequestService } from './shift-request.service';
import { ShiftRequest } from './entities/shift-request.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreateShiftRequestDto } from './dto/create-shift-request.dto';
import { UpdateShiftRequestDto } from './dto/update-shift-request.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { SHIFT_REQUEST_STATUS } from '@/shared/constants/enum';
import { ProviderOrientation } from '@/provider-orientation/entities/provider-orientation.entity';

describe('ShiftRequestService', () => {
  let service: ShiftRequestService;
  let shiftRequestRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShiftRequestService,
        {
          provide: getRepositoryToken(ShiftRequest),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProviderOrientation),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ShiftRequestService>(ShiftRequestService);
    shiftRequestRepository = module.get<Repository<ShiftRequest>>(
      getRepositoryToken(ShiftRequest),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a new request', async () => {
      const createShiftRequestDto = new CreateShiftRequestDto();
      const mockRequest = new ShiftRequest();
      shiftRequestRepository.save.mockResolvedValue(mockRequest);

      const result = await service.create(createShiftRequestDto);

      expect(shiftRequestRepository.save).toHaveBeenCalledWith(
        createShiftRequestDto,
      );
      expect(result).toEqual(mockRequest);
    });
  });

  describe('findOneWhere', () => {
    it('should find one request by criteria', async () => {
      const options = { where: { id: '1' } };
      const mockRequest = new ShiftRequest();
      shiftRequestRepository.findOne.mockResolvedValue(mockRequest);
      const result = await service.findOneWhere(options);
      expect(shiftRequestRepository.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual(mockRequest);
    });
  });

  describe('findAll', () => {
    it('should return a list of requests and count', async () => {
      const options = {};
      const mockRequest = [new ShiftRequest(), new ShiftRequest()];
      const count = mockRequest.length;
      shiftRequestRepository.findAndCount.mockResolvedValue([
        mockRequest,
        count,
      ]);
      const result = await service.findAll(options);
      expect(shiftRequestRepository.findAndCount).toHaveBeenCalledWith(options);
      expect(result).toEqual([mockRequest, count]);
    });
  });

  describe('update', () => {
    it('should update an request and return the result', async () => {
      const updateShiftRequestDto = new UpdateShiftRequestDto();
      const where: any = { id: '1' };
      const updateResult = { affected: 1 };
      const expectedDto = {
        ...updateShiftRequestDto,
        updated_at: expect.any(String), // Expect any string for the 'updated_at', or mock Date to control output
      };

      shiftRequestRepository.update.mockResolvedValue(updateResult);

      const result = await service.update(where, updateShiftRequestDto);

      expect(shiftRequestRepository.update).toHaveBeenCalledWith(
        where,
        expectedDto,
      );
      expect(result).toEqual(updateResult);
    });

    describe('remove', () => {
      it('should remove an request and return the result', async () => {
        const deleteDto = new DeleteDto();
        const where: any = { id: '1' };
        const updateResult = { affected: 1 };

        shiftRequestRepository.update.mockResolvedValue(updateResult);

        const result = await service.remove(where, deleteDto);

        expect(shiftRequestRepository.update).toHaveBeenCalledWith(
          { ...where, deleted_at: IsNull() },
          {
            status: SHIFT_REQUEST_STATUS.rejected,
            deleted_at_ip: deleteDto.deleted_at_ip,
            deleted_at: expect.any(String),
          },
        );
        expect(result).toEqual(updateResult);
      });
    });
  });
});
