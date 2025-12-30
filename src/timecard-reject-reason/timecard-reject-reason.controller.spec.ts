import { Test, TestingModule } from '@nestjs/testing';
import { TimecardRejectReasonController } from './timecard-reject-reason.controller';
import { TimecardRejectReasonService } from './timecard-reject-reason.service';
import { TimecardRejectReason } from './entities/timecard-reject-reason.entity';
import { CreateTimecardRejectReasonDto } from './dto/create-timecard-reject-reason.dto';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { ILike } from 'typeorm';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { UpdateTimecardRejectReasonDto } from './dto/update-timecard-reject-reason.dto';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('TimecardRejectReasonController', () => {
  let controller: TimecardRejectReasonController;
  let timecardRejectReasonService: any;

  beforeEach(async () => {
    const timecardRejectReasonServiceMock = {
      create: jest.fn(),
      checkName: jest.fn(),
      findOneWhere: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findAll: jest.fn(),
      isAlreadyInUse: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimecardRejectReasonController],
      providers: [
        {
          provide: TimecardRejectReasonService,
          useValue: timecardRejectReasonServiceMock,
        },
        {
          provide: AccessControlGuard,
          useValue: {
            canActivate: jest.fn(() => true),
          },
        },
      ],
    })
      .overrideGuard(AccessControlGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<TimecardRejectReasonController>(
      TimecardRejectReasonController,
    );
    timecardRejectReasonService = module.get<TimecardRejectReasonService>(
      TimecardRejectReasonService,
    );

    timecardRejectReasonService.findOneWhere = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof timecardRejectReasonService.findOneWhere
    >;
    timecardRejectReasonService.create = jest
      .fn()
      .mockResolvedValue(new TimecardRejectReason()) as jest.MockedFunction<
      typeof timecardRejectReasonService.create
    >;
    timecardRejectReasonService.update = jest
      .fn()
      .mockResolvedValue({ affected: 1 }) as jest.MockedFunction<
      typeof timecardRejectReasonService.update
    >;
    timecardRejectReasonService.findAll = jest
      .fn()
      .mockResolvedValue([
        [new TimecardRejectReason()],
        1,
      ]) as jest.MockedFunction<typeof timecardRejectReasonService.findAll>;
    timecardRejectReasonService.remove = jest
      .fn()
      .mockResolvedValue({ affected: 1 }) as jest.MockedFunction<
      typeof timecardRejectReasonService.remove
    >;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create time card reject reason', async () => {
      const createTimecardRejectReasonDto = new CreateTimecardRejectReasonDto();
      const mockReason = new TimecardRejectReason();
      timecardRejectReasonService.checkName.mockResolvedValue(mockReason);

      const result = await controller.create(createTimecardRejectReasonDto);
      expect(timecardRejectReasonService.checkName).toHaveBeenCalledWith(
        createTimecardRejectReasonDto.reason,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Dispute Timecard Reason'),
          data: {},
        }),
      );
    });

    it('should create time card reject reason', async () => {
      const createTimecardRejectReasonDto = new CreateTimecardRejectReasonDto();
      const mockReason = new TimecardRejectReason();
      timecardRejectReasonService.checkName.mockResolvedValue(null);
      timecardRejectReasonService.create.mockResolvedValue(mockReason);

      const result = await controller.create(createTimecardRejectReasonDto);
      expect(timecardRejectReasonService.checkName).toHaveBeenCalledWith(
        createTimecardRejectReasonDto.reason,
      );
      expect(timecardRejectReasonService.create).toHaveBeenCalledWith(
        createTimecardRejectReasonDto,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Dispute Timecard Reason'),
          data: mockReason,
        }),
      );
    });

    it('should handle errors during creation', async () => {
      const createTimecardRejectReasonDto = new CreateTimecardRejectReasonDto();
      const error = new Error('Database Error');
      timecardRejectReasonService.checkName.mockRejectedValue(error);

      const result = await controller.create(createTimecardRejectReasonDto);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findAll', () => {
    const queryParamsDto: QueryParamsDto = {
      limit: '10',
      offset: '0',
      search: 'John',
      order: { created_at: 'ASC' },
    };
    it('should successfully retrieve Reject Reason', async () => {
      const mockReason = Array(10).fill(new TimecardRejectReason());
      const mockCount = 10;

      timecardRejectReasonService.findAll.mockResolvedValue([
        mockReason,
        mockCount,
      ]); // Mock service response

      const result = await controller.findAll(queryParamsDto);

      expect(timecardRejectReasonService.findAll).toHaveBeenCalledWith({
        where: {
          reason: ILike(`%${parseSearchKeyword(queryParamsDto.search)}%`),
        },
        order: queryParamsDto.order,
        take: +queryParamsDto.limit,
        skip: +queryParamsDto.offset,
      });
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Dispute Timecard Reason'),
          total: mockCount,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: mockReason,
        }),
      );
    });

    it('should return no records found when there are no Dispute Timecard Reason', async () => {
      timecardRejectReasonService.findAll.mockResolvedValue([[], 0]);

      const result = await controller.findAll(queryParamsDto);
      expect(timecardRejectReasonService.findAll).toHaveBeenCalledWith({
        where: {
          reason: ILike(`%${parseSearchKeyword(queryParamsDto.search)}%`),
        },
        order: queryParamsDto.order,
        take: +queryParamsDto.limit,
        skip: +queryParamsDto.offset,
      });
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Dispute Timecard Reason'),
          total: 0,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: [],
        }),
      );
    });

    it('should handle errors during the fetch process', async () => {
      const errorMessage = 'Database error';
      queryParamsDto.search = null;
      timecardRejectReasonService.findAll.mockRejectedValue(
        new Error(errorMessage),
      ); // Simulate an error

      const result = await controller.findAll(queryParamsDto);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('findOne', () => {
    it('should return the Dispute Timecard Reason if found', async () => {
      const id = '1';
      const expectedRejectReason = new TimecardRejectReason();

      timecardRejectReasonService.findOneWhere.mockResolvedValue(
        expectedRejectReason,
      );

      const result = await controller.findOne(id);

      expect(timecardRejectReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Dispute Timecard Reason'),
          data: expectedRejectReason,
        }),
      );
    });

    it('should return a bad request if the Dispute Timecard Reason is not found', async () => {
      const id = '2';
      timecardRejectReasonService.findOneWhere.mockResolvedValue(null);

      const result = await controller.findOne(id);

      expect(timecardRejectReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Dispute Timecard Reason'),
          data: {},
        }),
      );
    });

    it('should handle errors during the retrieval process', async () => {
      const id = '3';
      const error = new Error('Database Error');
      timecardRejectReasonService.findOneWhere.mockRejectedValue(error);

      const result = await controller.findOne(id);

      expect(timecardRejectReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('update', () => {
    const id = '1';
    it('should return bad request if not Dispute Timecard Reason found', async () => {
      const updateTimecardRejectReasonDto = new UpdateTimecardRejectReasonDto();
      timecardRejectReasonService.findOneWhere.mockResolvedValue(null);

      const result = await controller.update(id, updateTimecardRejectReasonDto);

      expect(timecardRejectReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Dispute Timecard Reason'),
          data: {},
        }),
      );
    });

    it('should return bad request if not Dispute Timecard Reason found', async () => {
      const updateTimecardRejectReasonDto = new UpdateTimecardRejectReasonDto();
      const reason = new TimecardRejectReason();
      timecardRejectReasonService.findOneWhere.mockResolvedValue(reason);
      timecardRejectReasonService.checkName.mockResolvedValue(
        new TimecardRejectReason(),
      );

      const result = await controller.update(id, updateTimecardRejectReasonDto);

      expect(timecardRejectReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(timecardRejectReasonService.checkName).toHaveBeenCalledWith(
        reason.reason,
        reason.id,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Dispute Timecard Reason'),
          data: {},
        }),
      );
    });

    it('should return record not found if no Dispute Timecard Reason updated', async () => {
      const updateTimecardRejectReasonDto = new UpdateTimecardRejectReasonDto();
      const mockRejectReason = new TimecardRejectReason();
      timecardRejectReasonService.findOneWhere.mockResolvedValue(
        mockRejectReason,
      );
      timecardRejectReasonService.checkName.mockResolvedValue(null);
      timecardRejectReasonService.update.mockResolvedValue({ affected: 0 });

      const result = await controller.update(id, updateTimecardRejectReasonDto);

      expect(timecardRejectReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(timecardRejectReasonService.checkName).toHaveBeenCalledWith(
        mockRejectReason.reason,
        mockRejectReason.id,
      );
      expect(timecardRejectReasonService.update).toHaveBeenCalledWith(
        id,
        updateTimecardRejectReasonDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Dispute Timecard Reason'),
          data: {},
        }),
      );
    });

    it('should return success message if Dispute Timecard Reason updated', async () => {
      const updateTimecardRejectReasonDto = new UpdateTimecardRejectReasonDto();
      updateTimecardRejectReasonDto.reason = 'test';
      const mockRejectReason = new TimecardRejectReason();
      timecardRejectReasonService.findOneWhere.mockResolvedValue(
        mockRejectReason,
      );
      timecardRejectReasonService.checkName.mockResolvedValue(null);
      timecardRejectReasonService.update.mockResolvedValue({ affected: 1 });

      const result = await controller.update(id, updateTimecardRejectReasonDto);

      expect(timecardRejectReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(timecardRejectReasonService.checkName).toHaveBeenCalledWith(
        updateTimecardRejectReasonDto.reason,
        mockRejectReason.id,
      );
      expect(timecardRejectReasonService.update).toHaveBeenCalledWith(
        id,
        updateTimecardRejectReasonDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Dispute Timecard Reason'),
          data: {},
        }),
      );
    });

    it('should return success message if Dispute Timecard Reason updated', async () => {
      const updateTimecardRejectReasonDto = new UpdateTimecardRejectReasonDto();
      const error = new Error('Database error');
      timecardRejectReasonService.findOneWhere.mockRejectedValue(error);
      const result = await controller.update(id, updateTimecardRejectReasonDto);

      expect(timecardRejectReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('remove', () => {
    it('should return a success response when a Dispute Timecard Reason is successfully deleted', async () => {
      const id = '1';
      const deleteDto = new DeleteDto();
      deleteDto.deleted_at_ip = '192.168.1.1';

      timecardRejectReasonService.remove.mockResolvedValue({ affected: 1 }); // Simulate successful deletion

      const result = await controller.remove(id, deleteDto);

      expect(timecardRejectReasonService.remove).toHaveBeenCalledWith(
        id,
        deleteDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_DELETED('Dispute Timecard Reason'),
          data: {},
        }),
      );
    });

    it('should return a not found response when no Dispute Timecard Reason is deleted', async () => {
      const id = '2';
      const deleteDto = new DeleteDto();
      deleteDto.deleted_at_ip = '192.168.1.2';

      timecardRejectReasonService.remove.mockResolvedValue({ affected: 0 }); // Simulate no records affected

      const result = await controller.remove(id, deleteDto);

      expect(timecardRejectReasonService.remove).toHaveBeenCalledWith(
        id,
        deleteDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Dispute Timecard Reason'),
          data: {},
        }),
      );
    });

    it('should handle errors during the deletion process', async () => {
      const id = '3';
      const deleteDto = new DeleteDto();
      deleteDto.deleted_at_ip = '192.168.1.3';
      const error = new Error('Database error');

      timecardRejectReasonService.isAlreadyInUse.mockResolvedValue(false); // Simulate an error
      timecardRejectReasonService.remove.mockRejectedValue(error); // Simulate an error

      const result = await controller.remove(id, deleteDto);

      expect(timecardRejectReasonService.remove).toHaveBeenCalledWith(
        id,
        deleteDto,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
