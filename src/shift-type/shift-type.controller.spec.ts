import { Test, TestingModule } from '@nestjs/testing';
import { ShiftTypeController } from './shift-type.controller';
import { ShiftTypeService } from './shift-type.service';
import { ShiftType } from './entities/shift-type.entity';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { CreateShiftTypeDto } from './dto/create-shift-type.dto';
import { DEFAULT_STATUS, SHIFT_TYPE } from '@/shared/constants/enum';
import { UpdateShiftTypeDto } from './dto/update-shift-type.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';

describe('ShiftTypeController', () => {
  let controller: ShiftTypeController;
  let shiftTypeService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShiftTypeController],
      providers: [
        {
          provide: ShiftTypeService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOneWhere: jest.fn(),
            updateWhere: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ShiftTypeController>(ShiftTypeController);
    shiftTypeService = module.get<ShiftTypeService>(ShiftTypeService);

    shiftTypeService.findOneWhere = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof shiftTypeService.findOneWhere
    >;
    shiftTypeService.create = jest
      .fn()
      .mockResolvedValue(new ShiftType()) as jest.MockedFunction<
      typeof shiftTypeService.create
    >;
    shiftTypeService.updateWhere = jest
      .fn()
      .mockResolvedValue({ affected: 1 }) as jest.MockedFunction<
      typeof shiftTypeService.update
    >;
    shiftTypeService.remove = jest
      .fn()
      .mockResolvedValue([[new ShiftType()], 1]) as jest.MockedFunction<
      typeof shiftTypeService.remove
    >;
    shiftTypeService.findAll = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof shiftTypeService.findAll
    >;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createShiftTypeDto: CreateShiftTypeDto = {
      name: 'New Shift Type',
      shift_type: SHIFT_TYPE.per_diem_shifts,
      status: DEFAULT_STATUS.active,
    };

    it('should create a new Shift Type successfully', async () => {
      shiftTypeService.create.mockResolvedValue(createShiftTypeDto);

      const result = await controller.create(createShiftTypeDto);

      expect(shiftTypeService.create).toHaveBeenCalledWith(createShiftTypeDto);
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Shift Type'),
          data: createShiftTypeDto,
        }),
      );
    });

    it('should handle errors during the Shift Type creation process', async () => {
      const errorMessage = 'Error creating shift type';
      shiftTypeService.create.mockRejectedValue(new Error(errorMessage)); // Simulate an error

      const result = await controller.create(createShiftTypeDto);
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('findAll', () => {
    it('should return Shift Type list successfully', async () => {
      shiftTypeService.findAll.mockResolvedValue([[new ShiftType()], 1]); // Mock shiftTypeService with specialities and count

      const result = await controller.findAll();

      expect(shiftTypeService.findAll).toHaveBeenCalledWith({
        order: { created_at: 'DESC' },
      });

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Shift Type'),
          data: [new ShiftType()],
        }),
      );
    });

    it('should return no shift type found when list is empty', async () => {
      shiftTypeService.findAll.mockResolvedValue([[], 0]);

      const result = await controller.findAll();

      expect(shiftTypeService.findAll).toHaveBeenCalledWith({
        order: { created_at: 'DESC' },
      });

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift Type'),
          data: [],
        }),
      );
    });

    it('should handle errors when fetching shift type fails', async () => {
      const errorMessage = 'Database error';
      shiftTypeService.findAll.mockRejectedValue(new Error(errorMessage));

      const result = await controller.findAll();

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('findOne', () => {
    const id = '1';

    it('should return shift type if found', async () => {
      const mockShiftType = new ShiftType();

      shiftTypeService.findOneWhere.mockResolvedValue(mockShiftType);

      const result = await controller.findOne(id);

      expect(shiftTypeService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Shift Type'),
          data: mockShiftType,
        }),
      );
    });

    it('should return a bad request if the shift type is not found', async () => {
      shiftTypeService.findOneWhere.mockResolvedValue(null); // Simulate no admin found

      const result = await controller.findOne(id);

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift Type'),
          data: {},
        }),
      );
    });

    it('should handle errors during the profile fetching process', async () => {
      const errorMessage = 'Error fetching shift type';
      shiftTypeService.findOneWhere.mockRejectedValue(new Error(errorMessage)); // Simulate an error

      const result = await controller.findOne(id);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('update', () => {
    const id = '1';
    const updateShiftTypeDto: UpdateShiftTypeDto = {
      name: 'update shift type',
      shift_type: SHIFT_TYPE.per_diem_shifts,
      status: DEFAULT_STATUS.active,
    };

    it('should return a bad request if shift type is found for the given id', async () => {
      shiftTypeService.findOneWhere.mockResolvedValue(null);

      const result = await controller.update(id, updateShiftTypeDto);

      expect(shiftTypeService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Record'),
          data: {},
        }),
      );
    });

    it('should successfully update the shift type is found', async () => {
      shiftTypeService.findOneWhere.mockResolvedValueOnce(new ShiftType());

      shiftTypeService.updateWhere.mockResolvedValue({ affected: 1 }); // Update successful

      const result = await controller.update(id, updateShiftTypeDto);

      expect(shiftTypeService.updateWhere).toHaveBeenCalledWith(
        { id: id },
        updateShiftTypeDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Shift Type'),
          data: {},
        }),
      );
    });

    it('should return a not found response if no records are updated', async () => {
      shiftTypeService.findOneWhere.mockResolvedValueOnce(new ShiftType());

      shiftTypeService.updateWhere.mockResolvedValue({ affected: 0 }); // No records updated

      const result = await controller.update(id, updateShiftTypeDto);

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift Type'),
          data: {},
        }),
      );
    });

    it('should handle errors during the update process', async () => {
      const errorMessage = 'Error updating profile';

      // Simulate the user existing and no duplicates
      shiftTypeService.findOneWhere.mockResolvedValueOnce(new ShiftType());

      // Simulate an error in the update process
      shiftTypeService.updateWhere.mockRejectedValue(new Error(errorMessage));

      const result = await controller.update(id, updateShiftTypeDto);

      // Ensure the correct failure response is expected
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('remove', () => {
    const id = '1';
    const deletedDto: DeleteDto = { deleted_at_ip: '127.0.0.1' };

    it('should handle delete process', async () => {
      shiftTypeService.remove.mockResolvedValue(null);
      shiftTypeService.remove.mockResolvedValue({ affected: 1 });

      const result = await controller.remove(id, deletedDto);
      expect(shiftTypeService.remove).toHaveBeenCalledWith(id, deletedDto);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_DELETED('Shift Type'),
          data: {},
        }),
      );
    });

    it('should return a not found response if no records are deleted', async () => {
      shiftTypeService.remove.mockResolvedValue(null);
      shiftTypeService.remove.mockResolvedValue({ affected: 0 });

      const result = await controller.remove(id, deletedDto);

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift Type'),
          data: {},
        }),
      );
    });

    it('should handle errors during the delete process', async () => {
      const errorMessage = 'Error deleting shift type';

      // Simulate an error in the update process
      shiftTypeService.remove.mockRejectedValue(new Error(errorMessage));

      const result = await controller.remove(id, deletedDto);

      // Ensure the correct failure response is expected
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });
});
