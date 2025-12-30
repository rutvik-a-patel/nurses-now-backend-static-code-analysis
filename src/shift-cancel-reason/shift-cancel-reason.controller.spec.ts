import { Test, TestingModule } from '@nestjs/testing';
import { ShiftCancelReasonController } from './shift-cancel-reason.controller';
import { ShiftCancelReasonService } from './shift-cancel-reason.service';
import { ShiftCancelReason } from './entities/shift-cancel-reason.entity';
import { CreateShiftCancelReasonDto } from './dto/create-shift-cancel-reason.dto';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { ILike } from 'typeorm';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { UpdateShiftCancelReasonDto } from './dto/update-shift-cancel-reason.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { USER_TYPE } from '@/shared/constants/enum';
import { FilterShiftCancelReasonDto } from './dto/filter-shift-cancel-reason.dto';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('ShiftCancelReasonController', () => {
  let controller: ShiftCancelReasonController;
  let shiftCancelReasonService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShiftCancelReasonController],
      providers: [
        {
          provide: ShiftCancelReasonService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            checkName: jest.fn(),
            findOneWhere: jest.fn(),
            updateWhere: jest.fn(),
            remove: jest.fn(),
            isAlreadyUsed: jest.fn(),
          },
        },
        {
          provide: AccessControlGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
      ],
    })
      .overrideGuard(AccessControlGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<ShiftCancelReasonController>(
      ShiftCancelReasonController,
    );
    shiftCancelReasonService = module.get<ShiftCancelReasonService>(
      ShiftCancelReasonService,
    );

    shiftCancelReasonService.create = jest
      .fn()
      .mockResolvedValue(new ShiftCancelReason()) as jest.MockedFunction<
      typeof shiftCancelReasonService.create
    >;
    shiftCancelReasonService.findAll = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof shiftCancelReasonService.findAll
    >;
    shiftCancelReasonService.findOneWhere = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof shiftCancelReasonService.findOneWhere
    >;
    shiftCancelReasonService.updateWhere = jest
      .fn()
      .mockResolvedValue({ affected: 1 }) as jest.MockedFunction<
      typeof shiftCancelReasonService.update
    >;
    shiftCancelReasonService.remove = jest
      .fn()
      .mockResolvedValue([[new ShiftCancelReason()], 1]) as jest.MockedFunction<
      typeof shiftCancelReasonService.remove
    >;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createShiftCancelReasonDto: CreateShiftCancelReasonDto = {
      user_type: USER_TYPE.facility,
      reason: 'reason',
    };

    it('should create a new Shift cancel reason successfully', async () => {
      shiftCancelReasonService.checkName.mockResolvedValue(
        new ShiftCancelReason(),
      );

      const result = await controller.create(createShiftCancelReasonDto);

      expect(shiftCancelReasonService.checkName).toHaveBeenCalledWith(
        createShiftCancelReasonDto.reason,
        createShiftCancelReasonDto.user_type,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Shift Cancel Reason'),
          data: {},
        }),
      );
    });

    it('should create a new Shift cancel reason successfully', async () => {
      shiftCancelReasonService.checkName.mockResolvedValue(null);
      shiftCancelReasonService.create.mockResolvedValue(
        createShiftCancelReasonDto,
      );

      const result = await controller.create(createShiftCancelReasonDto);
      expect(shiftCancelReasonService.checkName).toHaveBeenCalledWith(
        createShiftCancelReasonDto.reason,
        createShiftCancelReasonDto.user_type,
      );
      expect(shiftCancelReasonService.create).toHaveBeenCalledWith(
        createShiftCancelReasonDto,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Shift Cancel Reason'),
          data: createShiftCancelReasonDto,
        }),
      );
    });

    it('should handle errors during the Shift cancel reason creation process', async () => {
      const errorMessage = 'Error creating shift cancel reason';
      shiftCancelReasonService.checkName.mockRejectedValue(
        new Error(errorMessage),
      ); // Simulate an error

      const result = await controller.create(createShiftCancelReasonDto);
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('findAll', () => {
    const shiftCancelReason = [new ShiftCancelReason()];
    const filterShiftCancelReasonDto: FilterShiftCancelReasonDto = {
      user_type: USER_TYPE.facility,
      limit: '10',
      offset: '0',
      search: 'John',
      order: { created_at: 'ASC' },
    };

    it('should return paginated speciality list successfully', async () => {
      filterShiftCancelReasonDto.search = null;
      shiftCancelReasonService.findAll.mockResolvedValue([
        shiftCancelReason,
        1,
      ]); // Mock shiftCancelReasonService with shiftCancelReason and count

      const result = await controller.findAll({
        user_type: USER_TYPE.facility,
        search: filterShiftCancelReasonDto.search,
        limit: filterShiftCancelReasonDto.limit,
        offset: filterShiftCancelReasonDto.offset,
        order: filterShiftCancelReasonDto.order,
      });

      expect(shiftCancelReasonService.findAll).toHaveBeenCalledWith({
        where: { user_type: filterShiftCancelReasonDto.user_type },
        order: filterShiftCancelReasonDto.order,
        take: +filterShiftCancelReasonDto.limit,
        skip: +filterShiftCancelReasonDto.offset,
      });

      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Shift Cancel Reason'),
          total: 1,
          limit: +filterShiftCancelReasonDto.limit,
          offset: +filterShiftCancelReasonDto.offset,
          data: [new ShiftCancelReason()],
        }),
      );
    });

    it('should return no speciality found when list is empty', async () => {
      filterShiftCancelReasonDto.search = 'test';
      shiftCancelReasonService.findAll.mockResolvedValue([[], 0]);

      const result = await controller.findAll({
        user_type: USER_TYPE.facility,
        search: filterShiftCancelReasonDto.search,
        limit: filterShiftCancelReasonDto.limit,
        offset: filterShiftCancelReasonDto.offset,
        order: filterShiftCancelReasonDto.order,
      });

      expect(shiftCancelReasonService.findAll).toHaveBeenCalledWith({
        where: [
          {
            reason: ILike(
              `%${parseSearchKeyword(filterShiftCancelReasonDto.search)}%`,
            ),
            user_type: filterShiftCancelReasonDto.user_type,
          },
        ],
        order: filterShiftCancelReasonDto.order,
        take: +filterShiftCancelReasonDto.limit,
        skip: +filterShiftCancelReasonDto.offset,
      });

      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift Cancel Reason'),
          total: 0,
          limit: +filterShiftCancelReasonDto.limit,
          offset: +filterShiftCancelReasonDto.offset,
          data: [],
        }),
      );
    });

    it('should handle errors when fetching speciality fails', async () => {
      const errorMessage = 'Database error';
      shiftCancelReasonService.findAll.mockRejectedValue(
        new Error(errorMessage),
      );

      const result = await controller.findAll({
        user_type: USER_TYPE.facility,
        search: filterShiftCancelReasonDto.search,
        limit: filterShiftCancelReasonDto.limit,
        offset: filterShiftCancelReasonDto.offset,
        order: filterShiftCancelReasonDto.order,
      });

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('findOne', () => {
    const id = '1';

    it('should return Shift Cancel Reason if found', async () => {
      const mockShiftCancelReason = new ShiftCancelReason();

      shiftCancelReasonService.findOneWhere.mockResolvedValue(
        mockShiftCancelReason,
      );

      const result = await controller.findOne(id);

      expect(shiftCancelReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Shift Cancel Reason'),
          data: mockShiftCancelReason,
        }),
      );
    });

    it('should return a bad request if the Shift Cancel Reason is not found', async () => {
      shiftCancelReasonService.findOneWhere.mockResolvedValue(null);

      const result = await controller.findOne(id);

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift Cancel Reason'),
          data: {},
        }),
      );
    });

    it('should handle errors during the profile fetching process', async () => {
      const errorMessage = 'Error fetching Shift Cancel Reason';
      shiftCancelReasonService.findOneWhere.mockRejectedValue(
        new Error(errorMessage),
      ); // Simulate an error

      const result = await controller.findOne(id);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('update', () => {
    const id = '1';
    const updateShiftCancelReasonDto = new UpdateShiftCancelReasonDto();

    it('should return a bad request if shift cancel reason is found for the given id', async () => {
      shiftCancelReasonService.findOneWhere.mockResolvedValue(null);

      const result = await controller.update(id, updateShiftCancelReasonDto);

      expect(shiftCancelReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift Cancel Reason'),
          data: {},
        }),
      );
    });

    it('should return a bad request if shift cancel reason is found for the given id', async () => {
      const reason = new ShiftCancelReason();
      shiftCancelReasonService.findOneWhere.mockResolvedValueOnce(reason);
      shiftCancelReasonService.checkName.mockResolvedValueOnce(
        new ShiftCancelReason(),
      );

      const result = await controller.update(id, updateShiftCancelReasonDto);

      expect(shiftCancelReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(shiftCancelReasonService.checkName).toHaveBeenCalledWith(
        reason.reason,
        reason.user_type,
        reason.id,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Shift Cancel Reason'),
          data: {},
        }),
      );
    });

    it('should successfully update the shift cancel reason is found', async () => {
      const reason = new ShiftCancelReason();
      shiftCancelReasonService.findOneWhere.mockResolvedValueOnce(reason);
      shiftCancelReasonService.checkName.mockResolvedValueOnce(null);
      shiftCancelReasonService.updateWhere.mockResolvedValue({ affected: 1 }); // Update successful

      const result = await controller.update(id, updateShiftCancelReasonDto);
      expect(shiftCancelReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(shiftCancelReasonService.checkName).toHaveBeenCalledWith(
        reason.reason,
        reason.user_type,
        reason.id,
      );
      expect(shiftCancelReasonService.updateWhere).toHaveBeenCalledWith(
        { id: id },
        updateShiftCancelReasonDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Shift Cancel Reason'),
          data: {},
        }),
      );
    });

    it('should return a not found response if no records are updated', async () => {
      updateShiftCancelReasonDto.reason = 'test';
      updateShiftCancelReasonDto.user_type = USER_TYPE.facility;
      const reason = new ShiftCancelReason();
      shiftCancelReasonService.findOneWhere.mockResolvedValueOnce(reason);
      shiftCancelReasonService.checkName.mockResolvedValueOnce(null);
      shiftCancelReasonService.updateWhere.mockResolvedValue({ affected: 0 }); // No records updated

      const result = await controller.update(id, updateShiftCancelReasonDto);
      expect(shiftCancelReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(shiftCancelReasonService.checkName).toHaveBeenCalledWith(
        updateShiftCancelReasonDto.reason,
        updateShiftCancelReasonDto.user_type,
        reason.id,
      );
      expect(shiftCancelReasonService.updateWhere).toHaveBeenCalledWith(
        { id: id },
        updateShiftCancelReasonDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift Cancel Reason'),
          data: {},
        }),
      );
    });

    it('should handle errors during the update process', async () => {
      const errorMessage = 'Error updating profile';

      // Simulate the user existing and no duplicates
      shiftCancelReasonService.findOneWhere.mockResolvedValueOnce(
        new ShiftCancelReason(),
      );

      // Simulate an error in the update process
      shiftCancelReasonService.updateWhere.mockRejectedValue(
        new Error(errorMessage),
      );

      const result = await controller.update(id, updateShiftCancelReasonDto);

      // Ensure the correct failure response is expected
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('remove', () => {
    const id = '1';
    const deletedDto: DeleteDto = { deleted_at_ip: '127.0.0.1' };

    it('should handle delete process', async () => {
      shiftCancelReasonService.isAlreadyUsed.mockResolvedValue(null);
      shiftCancelReasonService.remove.mockResolvedValue(null);
      shiftCancelReasonService.remove.mockResolvedValue({ affected: 1 });

      const result = await controller.remove(id, deletedDto);
      expect(shiftCancelReasonService.remove).toHaveBeenCalledWith(
        id,
        deletedDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_DELETED('Shift Cancel Reason'),
          data: {},
        }),
      );
    });

    it('should return a not found response if no records are deleted', async () => {
      shiftCancelReasonService.isAlreadyUsed.mockResolvedValue(null);
      shiftCancelReasonService.remove.mockResolvedValue(null);
      shiftCancelReasonService.remove.mockResolvedValue({ affected: 0 });

      const result = await controller.remove(id, deletedDto);

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift Cancel Reason'),
          data: {},
        }),
      );
    });

    it('should handle errors during the delete process', async () => {
      const errorMessage = 'Error deleting shift cancel reason';

      // Simulate an error in the update process
      shiftCancelReasonService.remove.mockRejectedValue(
        new Error(errorMessage),
      );

      const result = await controller.remove(id, deletedDto);

      // Ensure the correct failure response is expected
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });
});
