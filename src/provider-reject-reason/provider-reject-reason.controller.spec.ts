import { Test, TestingModule } from '@nestjs/testing';
import { ProviderRejectReasonController } from './provider-reject-reason.controller';
import { ProviderRejectReasonService } from './provider-reject-reason.service';
import { CreateProviderRejectReasonDto } from './dto/create-provider-reject-reason.dto';
import { ProviderRejectReason } from './entities/provider-reject-reason.entity';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { ILike } from 'typeorm';
import { UpdateProviderRejectReasonDto } from './dto/update-provider-reject-reason.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('ProviderRejectReasonController', () => {
  let controller: ProviderRejectReasonController;
  let providerRejectReasonService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProviderRejectReasonController],
      providers: [
        {
          provide: ProviderRejectReasonService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            checkName: jest.fn(),
            findOneWhere: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            isAlreadyInUse: jest.fn(),
          },
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

    controller = module.get<ProviderRejectReasonController>(
      ProviderRejectReasonController,
    );
    providerRejectReasonService = module.get<ProviderRejectReasonService>(
      ProviderRejectReasonService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createProviderRejectReasonDto = new CreateProviderRejectReasonDto();
    it('should create new reject reason', async () => {
      providerRejectReasonService.checkName.mockResolvedValue(
        new ProviderRejectReason(),
      );
      const result = await controller.create(createProviderRejectReasonDto);
      expect(providerRejectReasonService.checkName).toHaveBeenCalledWith(
        createProviderRejectReasonDto.reason,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Staff Rejection Reason'),
          data: {},
        }),
      );
    });

    it('should create new reject reason', async () => {
      providerRejectReasonService.checkName.mockResolvedValue(null);
      providerRejectReasonService.create.mockResolvedValue(
        new ProviderRejectReason(),
      );
      const result = await controller.create(createProviderRejectReasonDto);
      expect(providerRejectReasonService.checkName).toHaveBeenCalledWith(
        createProviderRejectReasonDto.reason,
      );
      expect(providerRejectReasonService.create).toHaveBeenCalledWith(
        createProviderRejectReasonDto,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Staff Rejection Reason'),
          data: new ProviderRejectReason(),
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      providerRejectReasonService.checkName.mockRejectedValue(error);

      const result = await controller.create(createProviderRejectReasonDto);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findAll', () => {
    const queryParamsDto = new QueryParamsDto();
    queryParamsDto.search = 'test';
    it('should return not found if no data there', async () => {
      providerRejectReasonService.findAll.mockResolvedValue([[], 0]);
      const result = await controller.findAll(queryParamsDto);
      expect(providerRejectReasonService.findAll).toHaveBeenCalledWith({
        where: {
          reason: ILike(`%${parseSearchKeyword(queryParamsDto.search)}%`),
        },
        order: queryParamsDto.order,
        take: +queryParamsDto.limit,
        skip: +queryParamsDto.offset,
      });
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff Rejection Reason'),
          total: 0,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: [],
        }),
      );
    });

    it('should return reject reason list', async () => {
      providerRejectReasonService.findAll.mockResolvedValue([
        [new ProviderRejectReason()],
        1,
      ]);
      const result = await controller.findAll(queryParamsDto);
      expect(providerRejectReasonService.findAll).toHaveBeenCalledWith({
        where: {
          reason: ILike(`%${parseSearchKeyword(queryParamsDto.search)}%`),
        },
        order: queryParamsDto.order,
        take: +queryParamsDto.limit,
        skip: +queryParamsDto.offset,
      });
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Staff Rejection Reason'),
          total: 1,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: [new ProviderRejectReason()],
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      providerRejectReasonService.findAll.mockRejectedValue(error);

      const result = await controller.findAll(queryParamsDto);
      expect(providerRejectReasonService.findAll).toHaveBeenCalledWith({
        where: {
          reason: ILike(`%${parseSearchKeyword(queryParamsDto.search)}%`),
        },
        order: queryParamsDto.order,
        take: +queryParamsDto.limit,
        skip: +queryParamsDto.offset,
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findOne', () => {
    const id = '1';
    it('should return bad request if data not found', async () => {
      providerRejectReasonService.findOneWhere.mockResolvedValue(null);
      const result = await controller.findOne(id);
      expect(providerRejectReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff Rejection Reason'),
          data: {},
        }),
      );
    });

    it('should return reject reason detail', async () => {
      providerRejectReasonService.findOneWhere.mockResolvedValue(
        new ProviderRejectReason(),
      );
      const result = await controller.findOne(id);
      expect(providerRejectReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Staff Rejection Reason'),
          data: new ProviderRejectReason(),
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      providerRejectReasonService.findOneWhere.mockRejectedValue(error);

      const result = await controller.findOne(id);
      expect(providerRejectReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('update', () => {
    const id = '1';
    const updateProviderRejectReasonDto = new UpdateProviderRejectReasonDto();
    it('should return bad request if data not found', async () => {
      providerRejectReasonService.findOneWhere.mockResolvedValue(null);
      const result = await controller.update(id, updateProviderRejectReasonDto);
      expect(providerRejectReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff Rejection Reason'),
          data: {},
        }),
      );
    });

    it('should return bad request if data not found', async () => {
      const reason = new ProviderRejectReason();
      providerRejectReasonService.findOneWhere.mockResolvedValue(reason);
      providerRejectReasonService.isAlreadyInUse.mockResolvedValue(null);
      providerRejectReasonService.checkName.mockResolvedValue(
        new ProviderRejectReason(),
      );

      const result = await controller.update(id, updateProviderRejectReasonDto);
      expect(providerRejectReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(providerRejectReasonService.checkName).toHaveBeenCalledWith(
        reason.reason,
        reason.id,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Staff Rejection Reason'),
          data: {},
        }),
      );
    });

    it('should return not found if no record updated', async () => {
      const reason = new ProviderRejectReason();
      providerRejectReasonService.findOneWhere.mockResolvedValue(reason);
      providerRejectReasonService.isAlreadyInUse.mockResolvedValue(null);
      providerRejectReasonService.checkName.mockResolvedValue(null);
      providerRejectReasonService.update.mockResolvedValue({ affected: 0 });

      const result = await controller.update(id, updateProviderRejectReasonDto);
      expect(providerRejectReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(providerRejectReasonService.checkName).toHaveBeenCalledWith(
        reason.reason,
        reason.id,
      );
      expect(providerRejectReasonService.update).toHaveBeenCalledWith(
        id,
        updateProviderRejectReasonDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff Rejection Reason'),
          data: {},
        }),
      );
    });

    it('should return success message if record updated', async () => {
      updateProviderRejectReasonDto.reason = 'test';
      const reason = new ProviderRejectReason();
      providerRejectReasonService.findOneWhere.mockResolvedValueOnce(reason);
      providerRejectReasonService.isAlreadyInUse.mockResolvedValue(null);
      providerRejectReasonService.checkName.mockResolvedValueOnce(null);
      providerRejectReasonService.update.mockResolvedValue({ affected: 1 });

      const result = await controller.update(id, updateProviderRejectReasonDto);
      expect(providerRejectReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(providerRejectReasonService.checkName).toHaveBeenCalledWith(
        updateProviderRejectReasonDto.reason,
        reason.id,
      );
      expect(providerRejectReasonService.update).toHaveBeenCalledWith(
        id,
        updateProviderRejectReasonDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Staff Rejection Reason'),
          data: {},
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      providerRejectReasonService.findOneWhere.mockRejectedValue(error);

      const result = await controller.update(id, updateProviderRejectReasonDto);
      expect(providerRejectReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('remove', () => {
    const id = '1';
    const deleteDto = new DeleteDto();
    it('should return bad request if data not found', async () => {
      providerRejectReasonService.findOneWhere.mockResolvedValue(null);
      const result = await controller.remove(id, deleteDto);
      expect(providerRejectReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff Rejection Reason'),
          data: {},
        }),
      );
    });

    it('should return not found if no record removed', async () => {
      providerRejectReasonService.findOneWhere.mockResolvedValue(
        new ProviderRejectReason(),
      );
      providerRejectReasonService.isAlreadyInUse.mockResolvedValue(null);
      providerRejectReasonService.remove.mockResolvedValue({ affected: 0 });
      const result = await controller.remove(id, deleteDto);
      expect(providerRejectReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(providerRejectReasonService.remove).toHaveBeenCalledWith(
        id,
        deleteDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff Rejection Reason'),
          data: {},
        }),
      );
    });

    it('should return success message if record removed', async () => {
      providerRejectReasonService.findOneWhere.mockResolvedValue(
        new ProviderRejectReason(),
      );
      providerRejectReasonService.isAlreadyInUse.mockResolvedValue(null);
      providerRejectReasonService.remove.mockResolvedValue({ affected: 1 });
      const result = await controller.remove(id, deleteDto);
      expect(providerRejectReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(providerRejectReasonService.remove).toHaveBeenCalledWith(
        id,
        deleteDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_DELETED('Staff Rejection Reason'),
          data: {},
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      providerRejectReasonService.findOneWhere.mockRejectedValue(error);

      const result = await controller.remove(id, deleteDto);
      expect(providerRejectReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
