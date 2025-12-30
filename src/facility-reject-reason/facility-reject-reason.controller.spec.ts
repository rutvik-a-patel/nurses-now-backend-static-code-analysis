import { Test, TestingModule } from '@nestjs/testing';
import { FacilityRejectReasonController } from './facility-reject-reason.controller';
import { FacilityRejectReasonService } from './facility-reject-reason.service';
import { CreateFacilityRejectReasonDto } from './dto/create-facility-reject-reason.dto';
import { FacilityRejectReason } from './entities/facility-reject-reason.entity';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { ILike } from 'typeorm';
import { UpdateFacilityRejectReasonDto } from './dto/update-facility-reject-reason.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';

describe('FacilityRejectReasonController', () => {
  let controller: FacilityRejectReasonController;
  let facilityRejectReasonService: any;

  beforeEach(async () => {
    const facilityRejectReasonServiceMock = {
      create: jest.fn(),
      checkName: jest.fn(),
      findAll: jest.fn(),
      findOneWhere: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacilityRejectReasonController],
      providers: [
        {
          provide: FacilityRejectReasonService,
          useValue: facilityRejectReasonServiceMock,
        },
      ],
    }).compile();

    controller = module.get<FacilityRejectReasonController>(
      FacilityRejectReasonController,
    );
    facilityRejectReasonService = module.get<FacilityRejectReasonService>(
      FacilityRejectReasonService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createFacilityRejectReasonDto = new CreateFacilityRejectReasonDto();
    it('should create reject reason', async () => {
      facilityRejectReasonService.checkName.mockResolvedValue(
        new FacilityRejectReason(),
      );

      const result = await controller.create(createFacilityRejectReasonDto);
      expect(facilityRejectReasonService.checkName).toHaveBeenCalledWith(
        createFacilityRejectReasonDto.reason,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Verification Reject Reason'),
          data: {},
        }),
      );
    });

    it('should create reject reason', async () => {
      facilityRejectReasonService.checkName.mockResolvedValue(null);
      facilityRejectReasonService.create.mockResolvedValue(
        new FacilityRejectReason(),
      );

      const result = await controller.create(createFacilityRejectReasonDto);
      expect(facilityRejectReasonService.checkName).toHaveBeenCalledWith(
        createFacilityRejectReasonDto.reason,
      );
      expect(facilityRejectReasonService.create).toHaveBeenCalledWith(
        createFacilityRejectReasonDto,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED(
            'Verification Reject Reason',
          ),
          data: new FacilityRejectReason(),
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      facilityRejectReasonService.checkName.mockRejectedValue(error);

      const result = await controller.create(createFacilityRejectReasonDto);
      expect(facilityRejectReasonService.checkName).toHaveBeenCalledWith(
        createFacilityRejectReasonDto.reason,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findAll', () => {
    const queryParamsDto = new QueryParamsDto();
    it('should return not found if no record found', async () => {
      queryParamsDto.search = 'test';
      facilityRejectReasonService.findAll.mockResolvedValue([[], 0]);

      const result = await controller.findAll(queryParamsDto);
      expect(facilityRejectReasonService.findAll).toHaveBeenCalledWith({
        where: {
          reason: ILike(`%${parseSearchKeyword(queryParamsDto.search)}%`),
        },
        order: queryParamsDto.order,
        take: +queryParamsDto.limit,
        skip: +queryParamsDto.offset,
      });
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND(
            'Verification Reject Reason',
          ),
          total: 0,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: [],
        }),
      );
    });

    it('should return reject reason list', async () => {
      queryParamsDto.search = 'test';
      facilityRejectReasonService.findAll.mockResolvedValue([
        [new FacilityRejectReason()],
        1,
      ]);

      const result = await controller.findAll(queryParamsDto);
      expect(facilityRejectReasonService.findAll).toHaveBeenCalledWith({
        where: {
          reason: ILike(`%${parseSearchKeyword(queryParamsDto.search)}%`),
        },
        order: queryParamsDto.order,
        take: +queryParamsDto.limit,
        skip: +queryParamsDto.offset,
      });
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Verification Reject Reason'),
          total: 1,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: [new FacilityRejectReason()],
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      facilityRejectReasonService.findAll.mockRejectedValue(error);

      const result = await controller.findAll(queryParamsDto);

      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findOne', () => {
    const id = '1';
    it('should return bad request if no record found', async () => {
      facilityRejectReasonService.findOneWhere.mockResolvedValue(null);

      const result = await controller.findOne(id);
      expect(facilityRejectReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND(
            'Verification Reject Reason',
          ),

          data: {},
        }),
      );
    });

    it('should return reject reason', async () => {
      facilityRejectReasonService.findOneWhere.mockResolvedValue(
        new FacilityRejectReason(),
      );

      const result = await controller.findOne(id);
      expect(facilityRejectReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Verification Reject Reason'),
          data: new FacilityRejectReason(),
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      facilityRejectReasonService.findOneWhere.mockRejectedValue(error);

      const result = await controller.findOne(id);
      expect(facilityRejectReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('update', () => {
    const id = '1';
    const updateFacilityRejectReasonDto = new UpdateFacilityRejectReasonDto();
    it('should return not found if there is no data', async () => {
      facilityRejectReasonService.findOneWhere.mockResolvedValue(null);

      const result = await controller.update(id, updateFacilityRejectReasonDto);
      expect(facilityRejectReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND(
            'Verification Reject Reason',
          ),
          data: {},
        }),
      );
    });

    it('should return not found if there is no data', async () => {
      const mockReason = new FacilityRejectReason();
      facilityRejectReasonService.findOneWhere.mockResolvedValue(mockReason);
      facilityRejectReasonService.checkName.mockResolvedValue(
        new FacilityRejectReason(),
      );

      const result = await controller.update(id, updateFacilityRejectReasonDto);
      expect(facilityRejectReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(facilityRejectReasonService.checkName).toHaveBeenCalledWith(
        mockReason.reason,
        mockReason.id,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Verification Reject Reason'),
          data: {},
        }),
      );
    });

    it('should return bad request if no record found', async () => {
      const mockReason = new FacilityRejectReason();
      facilityRejectReasonService.findOneWhere.mockResolvedValue(mockReason);
      facilityRejectReasonService.checkName.mockResolvedValue(null);
      facilityRejectReasonService.update.mockResolvedValue({ affected: 0 });

      const result = await controller.update(id, updateFacilityRejectReasonDto);
      expect(facilityRejectReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(facilityRejectReasonService.checkName).toHaveBeenCalledWith(
        mockReason.reason,
        mockReason.id,
      );
      expect(facilityRejectReasonService.update).toHaveBeenCalledWith(
        id,
        updateFacilityRejectReasonDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND(
            'Verification Reject Reason',
          ),
          data: {},
        }),
      );
    });

    it('should return reject reason', async () => {
      updateFacilityRejectReasonDto.reason = 'test';
      const mockReason = new FacilityRejectReason();
      facilityRejectReasonService.findOneWhere.mockResolvedValue(mockReason);
      facilityRejectReasonService.checkName.mockResolvedValue(null);
      facilityRejectReasonService.update.mockResolvedValue({ affected: 1 });

      const result = await controller.update(id, updateFacilityRejectReasonDto);
      expect(facilityRejectReasonService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(facilityRejectReasonService.checkName).toHaveBeenCalledWith(
        updateFacilityRejectReasonDto.reason,
        mockReason.id,
      );
      expect(facilityRejectReasonService.update).toHaveBeenCalledWith(
        id,
        updateFacilityRejectReasonDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED(
            'Verification Reject Reason',
          ),
          data: {},
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      facilityRejectReasonService.findOneWhere.mockRejectedValue(error);

      const result = await controller.update(id, updateFacilityRejectReasonDto);

      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('remove', () => {
    const id = '1';
    const deleteDto = new DeleteDto();
    it('should return bad request if no record found', async () => {
      facilityRejectReasonService.remove.mockResolvedValue({ affected: 0 });

      const result = await controller.remove(id, deleteDto);
      expect(facilityRejectReasonService.remove).toHaveBeenCalledWith(
        id,
        deleteDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND(
            'Verification Reject Reason',
          ),
          data: {},
        }),
      );
    });

    it('should return reject reason', async () => {
      facilityRejectReasonService.remove.mockResolvedValue({ affected: 1 });

      const result = await controller.remove(id, deleteDto);
      expect(facilityRejectReasonService.remove).toHaveBeenCalledWith(
        id,
        deleteDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_DELETED(
            'Verification Reject Reason',
          ),
          data: {},
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      facilityRejectReasonService.remove.mockRejectedValue(error);

      const result = await controller.remove(id, deleteDto);
      expect(facilityRejectReasonService.remove).toHaveBeenCalledWith(
        id,
        deleteDto,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
