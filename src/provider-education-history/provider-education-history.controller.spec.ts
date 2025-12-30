import { Test, TestingModule } from '@nestjs/testing';
import { ProviderEducationHistoryController } from './provider-education-history.controller';
import { ProviderEducationHistoryService } from './provider-education-history.service';
import { ProviderEducationHistory } from './entities/provider-education-history.entity';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { UpdateProviderEducationHistoryDto } from './dto/update-provider-education-history.dto';
import { CreateProviderEducationHistoryDto } from './dto/create-provider-education-history.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { IsNull } from 'typeorm';

describe('ProviderEducationHistoryController', () => {
  let controller: ProviderEducationHistoryController;
  let providerEducationHistoryService: any;

  beforeEach(async () => {
    const providerEducationHistoryServiceMock = {
      create: jest.fn(),
      findOneWhere: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findAll: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProviderEducationHistoryController],
      providers: [
        {
          provide: ProviderEducationHistoryService,
          useValue: providerEducationHistoryServiceMock,
        },
      ],
    }).compile();

    controller = module.get<ProviderEducationHistoryController>(
      ProviderEducationHistoryController,
    );
    providerEducationHistoryService =
      module.get<ProviderEducationHistoryService>(
        ProviderEducationHistoryService,
      );

    providerEducationHistoryService.findOneWhere = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof providerEducationHistoryService.findOneWhere
    >;
    providerEducationHistoryService.create = jest
      .fn()
      .mockResolvedValue(new ProviderEducationHistory()) as jest.MockedFunction<
      typeof providerEducationHistoryService.create
    >;
    providerEducationHistoryService.update = jest
      .fn()
      .mockResolvedValue({ affected: 1 }) as jest.MockedFunction<
      typeof providerEducationHistoryService.update
    >;
    providerEducationHistoryService.findAll = jest
      .fn()
      .mockResolvedValue([
        [new ProviderEducationHistory()],
        1,
      ]) as jest.MockedFunction<typeof providerEducationHistoryService.findAll>;
    providerEducationHistoryService.remove = jest
      .fn()
      .mockResolvedValue({ affected: 1 }) as jest.MockedFunction<
      typeof providerEducationHistoryService.remove
    >;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const req: any = { user: { id: '1' } };
    it('should create education history', async () => {
      const createProviderEducationHistoryDto =
        new CreateProviderEducationHistoryDto();
      const mockHistory = new ProviderEducationHistory();
      providerEducationHistoryService.create.mockResolvedValue(mockHistory);

      const result = await controller.create(
        createProviderEducationHistoryDto,
        req,
      );
      expect(providerEducationHistoryService.create).toHaveBeenCalledWith(
        createProviderEducationHistoryDto,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Education History'),
          data: mockHistory,
        }),
      );
    });

    it('should handle errors during creation', async () => {
      const createProviderEducationHistoryDto =
        new CreateProviderEducationHistoryDto();
      const error = new Error('Database Error');
      providerEducationHistoryService.create.mockRejectedValue(error);

      const result = await controller.create(
        createProviderEducationHistoryDto,
        req,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findAll', () => {
    const req: any = { user: { id: '1' } };
    it('should successfully retrieve Education History', async () => {
      const mockHistory = Array(10).fill(new ProviderEducationHistory());
      const mockCount = 10;

      providerEducationHistoryService.findAll.mockResolvedValue([
        mockHistory,
        mockCount,
      ]); // Mock service response

      const result = await controller.findAll(req);

      expect(providerEducationHistoryService.findAll).toHaveBeenCalledWith({
        where: {
          provider: {
            id: req.user.id,
          },
        },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Education History'),
          data: mockHistory,
        }),
      );
    });

    it('should return no records found when there are no Education History', async () => {
      providerEducationHistoryService.findAll.mockResolvedValue([[], 0]);

      const result = await controller.findAll(req);
      expect(providerEducationHistoryService.findAll).toHaveBeenCalledWith({
        where: {
          provider: {
            id: req.user.id,
          },
        },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Education History'),
          data: [],
        }),
      );
    });

    it('should handle errors during the fetch process', async () => {
      const errorMessage = 'Database error';
      providerEducationHistoryService.findAll.mockRejectedValue(
        new Error(errorMessage),
      ); // Simulate an error

      const result = await controller.findAll(req);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('findOne', () => {
    const req: any = { user: { id: '1' } };
    it('should return the Education History if found', async () => {
      const id = '1';
      const expectedRejectReason = new ProviderEducationHistory();

      providerEducationHistoryService.findOneWhere.mockResolvedValue(
        expectedRejectReason,
      );

      const result = await controller.findOne(id, req);

      expect(providerEducationHistoryService.findOneWhere).toHaveBeenCalledWith(
        {
          where: {
            id: id,
            provider: {
              id: req.user.id,
            },
          },
        },
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Education History'),
          data: expectedRejectReason,
        }),
      );
    });

    it('should return a bad request if the Education History is not found', async () => {
      const id = '2';
      providerEducationHistoryService.findOneWhere.mockResolvedValue(null);

      const result = await controller.findOne(id, req);

      expect(providerEducationHistoryService.findOneWhere).toHaveBeenCalledWith(
        {
          where: {
            id: id,
            provider: {
              id: req.user.id,
            },
          },
        },
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Education History'),
          data: {},
        }),
      );
    });

    it('should handle errors during the retrieval process', async () => {
      const id = '3';
      const error = new Error('Database Error');
      providerEducationHistoryService.findOneWhere.mockRejectedValue(error);

      const result = await controller.findOne(id, req);

      expect(providerEducationHistoryService.findOneWhere).toHaveBeenCalledWith(
        {
          where: {
            id: id,
            provider: {
              id: req.user.id,
            },
          },
        },
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('update', () => {
    const req: any = { user: { id: '1' } };
    const id = '1';
    it('should return bad request if not Education History found', async () => {
      const updateProviderEducationHistoryDto =
        new UpdateProviderEducationHistoryDto();
      providerEducationHistoryService.findOneWhere.mockResolvedValue(null);

      const result = await controller.update(
        id,
        updateProviderEducationHistoryDto,
        req,
      );

      expect(providerEducationHistoryService.findOneWhere).toHaveBeenCalledWith(
        {
          where: {
            id: id,
            provider: {
              id: req.user.id,
            },
          },
        },
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Education History'),
          data: {},
        }),
      );
    });

    it('should return record not found if no Education History updated', async () => {
      const updateProviderEducationHistoryDto =
        new UpdateProviderEducationHistoryDto();
      const mockRejectReason = new ProviderEducationHistory();
      providerEducationHistoryService.findOneWhere.mockResolvedValue(
        mockRejectReason,
      );
      providerEducationHistoryService.update.mockResolvedValue({ affected: 0 });

      const result = await controller.update(
        id,
        updateProviderEducationHistoryDto,
        req,
      );

      expect(providerEducationHistoryService.findOneWhere).toHaveBeenCalledWith(
        {
          where: {
            id: id,
            provider: {
              id: req.user.id,
            },
          },
        },
      );
      expect(providerEducationHistoryService.update).toHaveBeenCalledWith(
        id,
        updateProviderEducationHistoryDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Education History'),
          data: {},
        }),
      );
    });

    it('should return success message if Education History updated', async () => {
      const updateProviderEducationHistoryDto =
        new UpdateProviderEducationHistoryDto();
      const mockRejectReason = new ProviderEducationHistory();
      providerEducationHistoryService.findOneWhere.mockResolvedValue(
        mockRejectReason,
      );
      providerEducationHistoryService.update.mockResolvedValue({ affected: 1 });

      const result = await controller.update(
        id,
        updateProviderEducationHistoryDto,
        req,
      );

      expect(providerEducationHistoryService.findOneWhere).toHaveBeenCalledWith(
        {
          where: {
            id: id,
            provider: {
              id: req.user.id,
            },
          },
        },
      );
      expect(providerEducationHistoryService.update).toHaveBeenCalledWith(
        id,
        updateProviderEducationHistoryDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Education History'),
          data: {},
        }),
      );
    });

    it('should return success message if Education History updated', async () => {
      const updateProviderEducationHistoryDto =
        new UpdateProviderEducationHistoryDto();
      const error = new Error('Database error');
      providerEducationHistoryService.findOneWhere.mockRejectedValue(error);
      const result = await controller.update(
        id,
        updateProviderEducationHistoryDto,
        req,
      );

      expect(providerEducationHistoryService.findOneWhere).toHaveBeenCalledWith(
        {
          where: {
            id: id,
            provider: {
              id: req.user.id,
            },
          },
        },
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('remove', () => {
    const req: any = { user: { id: '1' } };
    it('should return a success response when a Education History is successfully deleted', async () => {
      const id = '1';
      const deleteDto = new DeleteDto();
      deleteDto.deleted_at_ip = '192.168.1.1';

      providerEducationHistoryService.remove.mockResolvedValue({ affected: 1 }); // Simulate successful deletion

      const result = await controller.remove(id, deleteDto, req);

      expect(providerEducationHistoryService.remove).toHaveBeenCalledWith(
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
          message: CONSTANT.SUCCESS.RECORD_DELETED('Education History'),
          data: {},
        }),
      );
    });

    it('should return a not found response when no Education History is deleted', async () => {
      const id = '2';
      const deleteDto = new DeleteDto();
      deleteDto.deleted_at_ip = '192.168.1.2';

      providerEducationHistoryService.remove.mockResolvedValue({ affected: 0 }); // Simulate no records affected

      const result = await controller.remove(id, deleteDto, req);

      expect(providerEducationHistoryService.remove).toHaveBeenCalledWith(
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
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Education History'),
          data: {},
        }),
      );
    });

    it('should handle errors during the deletion process', async () => {
      const id = '3';
      const deleteDto = new DeleteDto();
      deleteDto.deleted_at_ip = '192.168.1.3';
      const error = new Error('Database error');

      providerEducationHistoryService.remove.mockRejectedValue(error); // Simulate an error

      const result = await controller.remove(id, deleteDto, req);

      expect(providerEducationHistoryService.remove).toHaveBeenCalledWith(
        {
          id: id,
          provider: {
            id: req.user.id,
          },
          deleted_at: IsNull(),
        },
        deleteDto,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
