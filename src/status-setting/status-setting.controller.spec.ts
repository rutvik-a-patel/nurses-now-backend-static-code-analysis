import { Test, TestingModule } from '@nestjs/testing';
import { StatusSettingController } from './status-setting.controller';
import { StatusSettingService } from './status-setting.service';
import { StatusSetting } from './entities/status-setting.entity';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { CreateStatusSettingDto } from './dto/create-status-setting.dto';
import { UpdateStatusSettingDto } from './dto/update-status-setting.dto';
import { FilterStatusSettingDto } from './dto/filter-status-setting.dto';
import { USER_TYPE } from '@/shared/constants/enum';
import { DeleteDto } from '@/shared/dto/delete.dto';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { ILike } from 'typeorm';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('StatusSettingController', () => {
  let controller: StatusSettingController;
  let statusSettingService: any;

  beforeEach(async () => {
    const statusSettingServiceMock = {
      create: jest.fn(),
      findOneWhere: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findAll: jest.fn(),
      checkName: jest.fn(),
      isAlreadyUsed: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusSettingController],
      providers: [
        {
          provide: StatusSettingService,
          useValue: statusSettingServiceMock,
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

    controller = module.get<StatusSettingController>(StatusSettingController);
    statusSettingService =
      module.get<StatusSettingService>(StatusSettingService);

    statusSettingService.findOneWhere = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof statusSettingService.findOneWhere
    >;
    statusSettingService.create = jest
      .fn()
      .mockResolvedValue(new StatusSetting()) as jest.MockedFunction<
      typeof statusSettingService.create
    >;
    statusSettingService.update = jest
      .fn()
      .mockResolvedValue({ affected: 1 }) as jest.MockedFunction<
      typeof statusSettingService.update
    >;
    statusSettingService.findAll = jest
      .fn()
      .mockResolvedValue([[new StatusSetting()], 1]) as jest.MockedFunction<
      typeof statusSettingService.findAll
    >;
    statusSettingService.remove = jest
      .fn()
      .mockResolvedValue({ affected: 1 }) as jest.MockedFunction<
      typeof statusSettingService.remove
    >;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createStatusSettingDto = new CreateStatusSettingDto();
    it('should return a bad request if the dnr already exists', async () => {
      statusSettingService.checkName.mockResolvedValue(new StatusSetting()); // Simulate finding an existing dnr

      const result = await controller.create(createStatusSettingDto);

      expect(statusSettingService.checkName).toHaveBeenCalledWith(
        createStatusSettingDto.name,
        createStatusSettingDto.status_for,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Status Option'),
          data: {},
        }),
      );
    });

    it('should create status setting', async () => {
      const mockSetting = new StatusSetting();
      createStatusSettingDto.name = 'test';
      createStatusSettingDto.status_for = 'provider' as USER_TYPE;
      statusSettingService.checkName.mockResolvedValue(null);
      statusSettingService.create.mockResolvedValue(mockSetting);

      const result = await controller.create(createStatusSettingDto);
      expect(statusSettingService.checkName).toHaveBeenCalledWith(
        'test',
        'provider',
      );
      expect(statusSettingService.create).toHaveBeenCalledWith(
        createStatusSettingDto,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Status Option'),
          data: mockSetting,
        }),
      );
    });

    it('should handle errors during creation', async () => {
      const createStatusSettingDto = new CreateStatusSettingDto();
      const error = new Error('Database Error');
      statusSettingService.create.mockRejectedValue(error);

      const result = await controller.create(createStatusSettingDto);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findAll', () => {
    const filterStatusSettingDto: FilterStatusSettingDto = {
      limit: '10',
      offset: '0',
      search: 'John',
      status_for: USER_TYPE.provider,
      order: { created_at: 'ASC' },
    };
    it('should successfully retrieve Reject Reason', async () => {
      const mockSetting = Array(10).fill(new StatusSetting());
      const mockCount = 10;

      statusSettingService.findAll.mockResolvedValue([mockSetting, mockCount]); // Mock service response

      const result = await controller.findAll(filterStatusSettingDto);

      expect(statusSettingService.findAll).toHaveBeenCalledWith({
        where: {
          status_for: filterStatusSettingDto.status_for,
          name: ILike(`%${parseSearchKeyword(filterStatusSettingDto.search)}%`),
        },
        order: filterStatusSettingDto.order,
        take: +filterStatusSettingDto.limit,
        skip: +filterStatusSettingDto.offset,
      });
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Status Options'),
          total: mockCount,
          limit: +filterStatusSettingDto.limit,
          offset: +filterStatusSettingDto.offset,
          data: mockSetting,
        }),
      );
    });

    it('should return no records found when there are no Status Option', async () => {
      statusSettingService.findAll.mockResolvedValue([[], 0]);

      const result = await controller.findAll(filterStatusSettingDto);
      expect(statusSettingService.findAll).toHaveBeenCalledWith({
        where: {
          status_for: filterStatusSettingDto.status_for,
          name: ILike(`%${parseSearchKeyword(filterStatusSettingDto.search)}%`),
        },
        order: filterStatusSettingDto.order,
        take: +filterStatusSettingDto.limit,
        skip: +filterStatusSettingDto.offset,
      });
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Status Options'),
          total: 0,
          limit: +filterStatusSettingDto.limit,
          offset: +filterStatusSettingDto.offset,
          data: [],
        }),
      );
    });

    it('should handle errors during the fetch process', async () => {
      const errorMessage = 'Database error';
      statusSettingService.findAll.mockRejectedValue(new Error(errorMessage)); // Simulate an error

      const result = await controller.findAll(filterStatusSettingDto);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('findOne', () => {
    it('should return the Status Option if found', async () => {
      const id = '1';
      const expectedRejectReason = new StatusSetting();

      statusSettingService.findOneWhere.mockResolvedValue(expectedRejectReason);

      const result = await controller.findOne(id);

      expect(statusSettingService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Status Option'),
          data: expectedRejectReason,
        }),
      );
    });

    it('should return a bad request if the Status Option is not found', async () => {
      const id = '2';
      statusSettingService.findOneWhere.mockResolvedValue(null);

      const result = await controller.findOne(id);

      expect(statusSettingService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Status Option'),
          data: {},
        }),
      );
    });

    it('should handle errors during the retrieval process', async () => {
      const id = '3';
      const error = new Error('Database Error');
      statusSettingService.findOneWhere.mockRejectedValue(error);

      const result = await controller.findOne(id);

      expect(statusSettingService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('update', () => {
    const id = '1';
    it('should return bad request if not Status Option found', async () => {
      const updateStatusSettingDto = new UpdateStatusSettingDto();
      statusSettingService.findOneWhere.mockResolvedValue(null);

      const result = await controller.update(id, updateStatusSettingDto);

      expect(statusSettingService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Status Option'),
          data: {},
        }),
      );
    });

    it('should return a bad request if another lob with the same name exists', async () => {
      const id = '1';
      const updateStatusSettingDto = new UpdateStatusSettingDto();
      updateStatusSettingDto.name = 'Existing Name';

      statusSettingService.findOneWhere.mockResolvedValueOnce(
        new StatusSetting(),
      );
      statusSettingService.checkName.mockResolvedValueOnce(new StatusSetting());

      const result = await controller.update(id, updateStatusSettingDto);

      expect(statusSettingService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: id,
        },
      });

      expect(statusSettingService.checkName).toHaveBeenCalledWith(
        updateStatusSettingDto.name,
        updateStatusSettingDto.status_for,
      );

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Status Option'),
          data: {},
        }),
      );
    });

    it('should return record not found if no Status Option updated', async () => {
      const updateStatusSettingDto = new UpdateStatusSettingDto();
      const mockSetting = new StatusSetting();
      statusSettingService.findOneWhere.mockResolvedValue(mockSetting);
      statusSettingService.update.mockResolvedValue({ affected: 0 });

      const result = await controller.update(id, updateStatusSettingDto);

      expect(statusSettingService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(statusSettingService.update).toHaveBeenCalledWith(
        id,
        updateStatusSettingDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Status Option'),
          data: {},
        }),
      );
    });

    it('should return success message if Status Option updated', async () => {
      const updateStatusSettingDto = new UpdateStatusSettingDto();
      const mockSetting = new StatusSetting();
      statusSettingService.findOneWhere.mockResolvedValue(mockSetting);
      statusSettingService.update.mockResolvedValue({ affected: 1 });

      const result = await controller.update(id, updateStatusSettingDto);

      expect(statusSettingService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(statusSettingService.update).toHaveBeenCalledWith(
        id,
        updateStatusSettingDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Status Option'),
          data: {},
        }),
      );
    });

    it('should return success message if Status Option updated', async () => {
      const updateStatusSettingDto = new UpdateStatusSettingDto();
      const error = new Error('Database error');
      statusSettingService.findOneWhere.mockRejectedValue(error);
      const result = await controller.update(id, updateStatusSettingDto);

      expect(statusSettingService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('remove', () => {
    it('should return a success response when a Status Option is successfully deleted', async () => {
      const id = '1';
      const deleteDto = new DeleteDto();
      deleteDto.deleted_at_ip = '192.168.1.1';
      statusSettingService.findOneWhere.mockResolvedValue(new StatusSetting());
      statusSettingService.isAlreadyUsed.mockResolvedValue(0); // Not used by any facility
      statusSettingService.remove.mockResolvedValue({ affected: 1 }); // Simulate successful deletion

      const result = await controller.remove(id, deleteDto);

      expect(statusSettingService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id,
        },
      });
      expect(statusSettingService.isAlreadyUsed).toHaveBeenCalledWith(id);
      expect(statusSettingService.remove).toHaveBeenCalledWith(id, deleteDto);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_DELETED('Status Option'),
          data: {},
        }),
      );
    });

    it('should return a success response when a Status Option is successfully deleted', async () => {
      const id = '1';
      const deleteDto = new DeleteDto();
      deleteDto.deleted_at_ip = '192.168.1.1';
      statusSettingService.findOneWhere.mockResolvedValue(null);

      const result = await controller.remove(id, deleteDto);

      expect(statusSettingService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id,
        },
      });

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Status Option'),
          data: {},
        }),
      );
    });

    it('should return a not found response when no Status Option is deleted', async () => {
      const id = '2';
      const deleteDto = new DeleteDto();
      deleteDto.deleted_at_ip = '192.168.1.2';

      statusSettingService.findOneWhere.mockResolvedValue(new StatusSetting());
      statusSettingService.isAlreadyUsed.mockResolvedValue(0); // Not used by any facility
      statusSettingService.remove.mockResolvedValue({ affected: 0 }); // Simulate no records affected

      const result = await controller.remove(id, deleteDto);

      expect(statusSettingService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id,
        },
      });
      expect(statusSettingService.isAlreadyUsed).toHaveBeenCalledWith(id);
      expect(statusSettingService.remove).toHaveBeenCalledWith(id, deleteDto);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Status Option'),
          data: {},
        }),
      );
    });

    it('should handle errors during the deletion process', async () => {
      const id = '3';
      const deleteDto = new DeleteDto();
      deleteDto.deleted_at_ip = '192.168.1.3';
      const error = new Error('Database error');
      statusSettingService.findOneWhere.mockRejectedValue(error);
      const result = await controller.remove(id, deleteDto);
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
