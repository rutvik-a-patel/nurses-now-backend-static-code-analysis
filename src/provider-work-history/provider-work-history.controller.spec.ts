import { Test, TestingModule } from '@nestjs/testing';
import { ProviderWorkHistoryController } from './provider-work-history.controller';
import { ProviderWorkHistoryService } from './provider-work-history.service';
import { ProviderWorkHistory } from './entities/provider-work-history.entity';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { CreateProviderWorkHistoryDto } from './dto/create-provider-work-history.dto';
import { UpdateProviderWorkHistoryDto } from './dto/update-provider-work-history.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { IsNull } from 'typeorm';

describe('ProviderWorkHistoryController', () => {
  let controller: ProviderWorkHistoryController;
  let providerWorkHistoryService: any;

  beforeEach(async () => {
    const providerWorkHistoryServiceMock = {
      create: jest.fn(),
      findOneWhere: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findAll: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProviderWorkHistoryController],
      providers: [
        {
          provide: ProviderWorkHistoryService,
          useValue: providerWorkHistoryServiceMock,
        },
      ],
    }).compile();

    controller = module.get<ProviderWorkHistoryController>(
      ProviderWorkHistoryController,
    );
    providerWorkHistoryService = module.get<ProviderWorkHistoryService>(
      ProviderWorkHistoryService,
    );

    providerWorkHistoryService.findOneWhere = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof providerWorkHistoryService.findOneWhere
    >;
    providerWorkHistoryService.create = jest
      .fn()
      .mockResolvedValue(new ProviderWorkHistory()) as jest.MockedFunction<
      typeof providerWorkHistoryService.create
    >;
    providerWorkHistoryService.update = jest
      .fn()
      .mockResolvedValue({ affected: 1 }) as jest.MockedFunction<
      typeof providerWorkHistoryService.update
    >;
    providerWorkHistoryService.findAll = jest
      .fn()
      .mockResolvedValue([
        [new ProviderWorkHistory()],
        1,
      ]) as jest.MockedFunction<typeof providerWorkHistoryService.findAll>;
    providerWorkHistoryService.remove = jest
      .fn()
      .mockResolvedValue({ affected: 1 }) as jest.MockedFunction<
      typeof providerWorkHistoryService.remove
    >;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const req: any = { user: { id: '1' } };
    it('should create provider work history', async () => {
      const createProviderWorkHistoryDto = new CreateProviderWorkHistoryDto();
      const mockHistory = new ProviderWorkHistory();
      providerWorkHistoryService.create.mockResolvedValue(mockHistory);

      const result = await controller.create(createProviderWorkHistoryDto, req);
      expect(providerWorkHistoryService.create).toHaveBeenCalledWith(
        createProviderWorkHistoryDto,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Work History'),
          data: mockHistory,
        }),
      );
    });

    it('should handle errors during creation', async () => {
      const createProviderWorkHistoryDto = new CreateProviderWorkHistoryDto();
      const error = new Error('Database Error');
      providerWorkHistoryService.create.mockRejectedValue(error);

      const result = await controller.create(createProviderWorkHistoryDto, req);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findAll', () => {
    const req: any = { user: { id: '1' } };
    it('should successfully retrieve Work History', async () => {
      const mockHistory = Array(10).fill(new ProviderWorkHistory());
      const mockCount = 10;

      providerWorkHistoryService.findAll.mockResolvedValue([
        mockHistory,
        mockCount,
      ]); // Mock service response

      const result = await controller.findAll(req);

      expect(providerWorkHistoryService.findAll).toHaveBeenCalledWith({
        where: {
          provider: {
            id: req.user.id,
          },
        },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Work History'),
          data: mockHistory,
        }),
      );
    });

    it('should return no records found when there are no Work History', async () => {
      providerWorkHistoryService.findAll.mockResolvedValue([[], 0]);

      const result = await controller.findAll(req);
      expect(providerWorkHistoryService.findAll).toHaveBeenCalledWith({
        where: {
          provider: {
            id: req.user.id,
          },
        },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Work History'),
          data: [],
        }),
      );
    });

    it('should handle errors during the fetch process', async () => {
      const errorMessage = 'Database error';
      providerWorkHistoryService.findAll.mockRejectedValue(
        new Error(errorMessage),
      ); // Simulate an error

      const result = await controller.findAll(req);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('findOne', () => {
    const req: any = { user: { id: '1' } };
    it('should return the Work History if found', async () => {
      const id = '1';
      const mockHistory = new ProviderWorkHistory();

      providerWorkHistoryService.findOneWhere.mockResolvedValue(mockHistory);

      const result = await controller.findOne(id, req);

      expect(providerWorkHistoryService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: id,
          provider: {
            id: req.user.id,
          },
        },
        select: {
          id: true,
          created_at: true,
          location: true,
          employer_name: true,
          supervisors_name: true,
          supervisors_title: true,
          work_phone_country_code: true,
          work_phone: true,
          is_teaching_facility: true,
          charge_experience: true,
          can_contact_employer: true,
          start_date: true,
          end_date: true,
          is_current: true,
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Work History'),
          data: mockHistory,
        }),
      );
    });

    it('should return a bad request if the Work History is not found', async () => {
      const id = '2';
      providerWorkHistoryService.findOneWhere.mockResolvedValue(null);

      const result = await controller.findOne(id, req);

      expect(providerWorkHistoryService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: id,
          provider: {
            id: req.user.id,
          },
        },
        select: {
          id: true,
          created_at: true,
          location: true,
          employer_name: true,
          supervisors_name: true,
          supervisors_title: true,
          work_phone_country_code: true,
          work_phone: true,
          is_teaching_facility: true,
          charge_experience: true,
          can_contact_employer: true,
          start_date: true,
          end_date: true,
          is_current: true,
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Work History'),
          data: {},
        }),
      );
    });

    it('should handle errors during the retrieval process', async () => {
      const id = '3';
      const error = new Error('Database Error');
      providerWorkHistoryService.findOneWhere.mockRejectedValue(error);

      const result = await controller.findOne(id, req);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('update', () => {
    const req: any = { user: { id: '1' } };
    const id = '1';
    it('should return bad request if not Work History found', async () => {
      const updateProviderWorkHistoryDto = new UpdateProviderWorkHistoryDto();
      providerWorkHistoryService.findOneWhere.mockResolvedValue(null);

      const result = await controller.update(
        id,
        updateProviderWorkHistoryDto,
        req,
      );

      expect(providerWorkHistoryService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: id,
          provider: {
            id: req.user.id,
          },
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Work History'),
          data: {},
        }),
      );
    });

    it('should return record not found if no Work History updated', async () => {
      const updateProviderWorkHistoryDto = new UpdateProviderWorkHistoryDto();
      const mockRejectReason = new ProviderWorkHistory();
      providerWorkHistoryService.findOneWhere.mockResolvedValue(
        mockRejectReason,
      );
      providerWorkHistoryService.update.mockResolvedValue({ affected: 0 });

      const result = await controller.update(
        id,
        updateProviderWorkHistoryDto,
        req,
      );

      expect(providerWorkHistoryService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: id,
          provider: {
            id: req.user.id,
          },
        },
      });
      expect(providerWorkHistoryService.update).toHaveBeenCalledWith(
        id,
        updateProviderWorkHistoryDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Work History'),
          data: {},
        }),
      );
    });

    it('should return success message if Work History updated', async () => {
      const updateProviderWorkHistoryDto = new UpdateProviderWorkHistoryDto();
      const mockRejectReason = new ProviderWorkHistory();
      providerWorkHistoryService.findOneWhere.mockResolvedValue(
        mockRejectReason,
      );
      providerWorkHistoryService.update.mockResolvedValue({ affected: 1 });

      const result = await controller.update(
        id,
        updateProviderWorkHistoryDto,
        req,
      );

      expect(providerWorkHistoryService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: id,
          provider: {
            id: req.user.id,
          },
        },
      });
      expect(providerWorkHistoryService.update).toHaveBeenCalledWith(
        id,
        updateProviderWorkHistoryDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Work History'),
          data: {},
        }),
      );
    });

    it('should return success message if Work History updated', async () => {
      const updateProviderWorkHistoryDto = new UpdateProviderWorkHistoryDto();
      const error = new Error('Database error');
      providerWorkHistoryService.findOneWhere.mockRejectedValue(error);
      const result = await controller.update(
        id,
        updateProviderWorkHistoryDto,
        req,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('remove', () => {
    const req: any = { user: { id: '1' } };
    it('should return a success response when a Work History is successfully deleted', async () => {
      const id = '1';
      const deleteDto = new DeleteDto();
      deleteDto.deleted_at_ip = '192.168.1.1';

      providerWorkHistoryService.remove.mockResolvedValue({ affected: 1 }); // Simulate successful deletion

      const result = await controller.remove(id, deleteDto, req);

      expect(providerWorkHistoryService.remove).toHaveBeenCalledWith(
        {
          id: id,
          provider: {
            id: req.user.id,
          },
          deleted_at: IsNull(),
        },
        deleteDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_DELETED('Work History'),
          data: {},
        }),
      );
    });

    it('should return a not found response when no Work History is deleted', async () => {
      const id = '2';
      const deleteDto = new DeleteDto();
      deleteDto.deleted_at_ip = '192.168.1.2';

      providerWorkHistoryService.remove.mockResolvedValue({ affected: 0 }); // Simulate no records affected

      const result = await controller.remove(id, deleteDto, req);

      expect(providerWorkHistoryService.remove).toHaveBeenCalledWith(
        {
          id: id,
          provider: {
            id: req.user.id,
          },
          deleted_at: IsNull(),
        },
        deleteDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Work History'),
          data: {},
        }),
      );
    });

    it('should handle errors during the deletion process', async () => {
      const id = '3';
      const deleteDto = new DeleteDto();
      deleteDto.deleted_at_ip = '192.168.1.3';
      const error = new Error('Database error');

      providerWorkHistoryService.remove.mockRejectedValue(error); // Simulate an error

      const result = await controller.remove(id, deleteDto, req);

      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
