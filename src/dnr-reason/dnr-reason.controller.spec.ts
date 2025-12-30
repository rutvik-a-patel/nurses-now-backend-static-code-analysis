import { Test, TestingModule } from '@nestjs/testing';
import { DnrReasonController } from './dnr-reason.controller';
import { DnrReasonService } from './dnr-reason.service';
import { CreateDnrReasonDto } from './dto/create-dnr-reason.dto';
import { DnrReason } from './entities/dnr-reason.entity';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { DnrReasonFilterDto } from './dto/dnr-reason-filter.dto';
import { DNR_TYPE } from '@/shared/constants/enum';
import { ILike } from 'typeorm';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { UpdateDnrReasonDto } from './dto/update-dnr-reason.dto';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('DnrReasonController', () => {
  let controller: DnrReasonController;
  let service: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DnrReasonController],
      providers: [
        {
          provide: DnrReasonService,
          useValue: {
            checkName: jest.fn(),
            create: jest.fn(),
            findOneWhere: jest.fn(),
            findAll: jest.fn(),
            remove: jest.fn(),
            updateWhere: jest.fn(),
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

    controller = module.get<DnrReasonController>(DnrReasonController);
    service = module.get<DnrReasonService>(DnrReasonService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createDNR', () => {
    const createDnrReasonDto = new CreateDnrReasonDto();
    createDnrReasonDto.reason = 'Test dnr';
    it('should return a bad request if the dnr already exists', async () => {
      service.checkName.mockResolvedValue(new DnrReason()); // Simulate finding an existing dnr

      const result = await controller.create(createDnrReasonDto);

      expect(service.checkName).toHaveBeenCalledWith(
        createDnrReasonDto.reason,
        createDnrReasonDto.reason_type,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('DNR Reason'),
          data: {},
        }),
      );
    });

    it('should successfully create a dnr', async () => {
      service.checkName.mockResolvedValue(null); // No existing dnr found
      service.create.mockResolvedValue({
        id: '123',
        reason: 'New dnr',
      }); // Simulate successful dnr creation

      const result = await controller.create(createDnrReasonDto);

      expect(service.create).toHaveBeenCalledWith(createDnrReasonDto);
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('DNR Reason'),
          data: { id: '123', reason: 'New dnr' },
        }),
      );
    });

    it('should handle errors during dnr creation', async () => {
      const error = new Error('Database Error');
      service.checkName.mockRejectedValue(error); // Simulate an error during the findOne operation

      const result = await controller.create(createDnrReasonDto);

      expect(service.checkName).toHaveBeenCalledWith(
        createDnrReasonDto.reason,
        createDnrReasonDto.reason_type,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findAll', () => {
    const queryParamsDto: DnrReasonFilterDto = {
      limit: '10',
      offset: '0',
      search: 'John',
      order: { created_at: 'ASC' },
      reason_type: DNR_TYPE.clinical,
    };
    it('should successfully retrieve dnr', async () => {
      const mockDnr = Array(10).fill(new DnrReason());
      const mockCount = 10;

      service.findAll.mockResolvedValue([mockDnr, mockCount]); // Mock service response

      const result = await controller.findAll(queryParamsDto);

      expect(service.findAll).toHaveBeenCalledWith({
        where: {
          reason: ILike(`%${parseSearchKeyword(queryParamsDto.search)}%`),
          reason_type: DNR_TYPE.clinical,
        },

        order: queryParamsDto.order,
        take: +queryParamsDto.limit,
        skip: +queryParamsDto.offset,
      });
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('DNR Reason'),
          total: mockCount,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: mockDnr,
        }),
      );
    });

    it('should return no records found when there are no dnr', async () => {
      queryParamsDto.search = null;
      service.findAll.mockResolvedValue([[], 0]);

      const result = await controller.findAll(queryParamsDto);
      expect(service.findAll).toHaveBeenCalledWith({
        where: {
          reason_type: queryParamsDto.reason_type,
        },
        order: queryParamsDto.order,
        take: +queryParamsDto.limit,
        skip: +queryParamsDto.offset,
      });
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('DNR Reason'),
          total: 0,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: [],
        }),
      );
    });

    it('should handle errors during the fetch process', async () => {
      const errorMessage = 'Database error';
      service.findAll.mockRejectedValue(new Error(errorMessage)); // Simulate an error

      const result = await controller.findAll(queryParamsDto);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('remove', () => {
    it('should return a success response when a lob is successfully deleted', async () => {
      const id = '1';
      const deleteDto = new DeleteDto();
      deleteDto.deleted_at_ip = '192.168.1.1';

      service.findOneWhere.mockResolvedValue(null);

      const result = await controller.remove(id, deleteDto);

      expect(service.findOneWhere).toHaveBeenCalledWith({ where: { id: id } });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('DNR Reason'),
          data: {},
        }),
      );
    });

    it('should return a not found response when no lob is deleted', async () => {
      const id = '2';
      const deleteDto = new DeleteDto();
      deleteDto.deleted_at_ip = '192.168.1.2';

      service.findOneWhere.mockResolvedValue(new DnrReason());
      service.remove.mockResolvedValue({ affected: 1 }); // Simulate no records affected

      const result = await controller.remove(id, deleteDto);

      expect(service.findOneWhere).toHaveBeenCalledWith({ where: { id: id } });
      expect(service.remove).toHaveBeenCalledWith(id, deleteDto);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_DELETED('DNR Reason'),
          data: {},
        }),
      );
    });

    it('should return a not found response when no lob is deleted', async () => {
      const id = '2';
      const deleteDto = new DeleteDto();
      deleteDto.deleted_at_ip = '192.168.1.2';

      service.findOneWhere.mockResolvedValue(new DnrReason());
      service.remove.mockResolvedValue({ affected: 0 }); // Simulate no records affected

      const result = await controller.remove(id, deleteDto);

      expect(service.findOneWhere).toHaveBeenCalledWith({ where: { id: id } });
      expect(service.remove).toHaveBeenCalledWith(id, deleteDto);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('DNR Reason'),
          data: {},
        }),
      );
    });

    it('should handle errors during the deletion process', async () => {
      const id = '3';
      const deleteDto = new DeleteDto();
      deleteDto.deleted_at_ip = '192.168.1.3';
      const error = new Error('Database error');

      service.findOneWhere.mockRejectedValue(error); // Simulate an error

      const result = await controller.remove(id, deleteDto);

      expect(service.findOneWhere).toHaveBeenCalledWith({ where: { id: id } });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findOne', () => {
    it('should return the lob if found', async () => {
      const id = '1';
      const lob = new DnrReason();
      lob.id = id;
      lob.reason = 'Test lob';

      service.findOneWhere.mockResolvedValue(lob);

      const result = await controller.findOne(id);

      expect(service.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: id,
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('DNR Reason'),
          data: lob,
        }),
      );
    });

    it('should return a bad request if the lob is not found', async () => {
      const id = '2';
      service.findOneWhere.mockResolvedValue(null);

      const result = await controller.findOne(id);

      expect(service.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: id,
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('DNR Reason'),
          data: {},
        }),
      );
    });

    it('should handle errors during the retrieval process', async () => {
      const id = '3';
      const error = new Error('Database Error');
      service.findOneWhere.mockRejectedValue(error);

      const result = await controller.findOne(id);

      expect(service.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: id,
        },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('update', () => {
    it('should return a bad request if the lob does not exist', async () => {
      const id = '1';
      const updateLineOfBusinessDto = new UpdateDnrReasonDto();
      updateLineOfBusinessDto.reason = 'Updated Name';

      service.findOneWhere.mockResolvedValue(null);

      const result = await controller.update(id, updateLineOfBusinessDto);

      expect(service.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('DNR Reason'),
          data: {},
        }),
      );
    });

    const updateLineOfBusinessDto = new UpdateDnrReasonDto();
    it('should return a bad request if another lob with the same name exists', async () => {
      const id = '1';
      updateLineOfBusinessDto.reason = 'Existing Name';

      service.findOneWhere.mockResolvedValueOnce(new DnrReason());
      service.checkName.mockResolvedValueOnce(new DnrReason());

      const result = await controller.update(id, updateLineOfBusinessDto);

      expect(service.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: id,
        },
      });

      expect(service.checkName).toHaveBeenCalledWith(
        updateLineOfBusinessDto.reason,
        updateLineOfBusinessDto.reason_type,
      );

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('DNR Reason'),
          data: {},
        }),
      );
    });

    it('should successfully update the lob', async () => {
      const id = '1';
      updateLineOfBusinessDto.reason = 'Updated Name';

      service.findOneWhere.mockResolvedValueOnce(new DnrReason());
      service.checkName.mockResolvedValueOnce(null);

      service.updateWhere.mockResolvedValue({ affected: 1 });

      const result = await controller.update(id, updateLineOfBusinessDto);

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('DNR Reason'),
          data: {},
        }),
      );
    });

    it('should return an error if no records were updated', async () => {
      const id = '1';

      service.findOneWhere.mockResolvedValueOnce(new DnrReason());
      service.checkName.mockResolvedValueOnce(null);

      service.updateWhere.mockResolvedValue({ affected: 0 });

      const result = await controller.update(id, updateLineOfBusinessDto);

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('DNR Reason'),
          data: {},
        }),
      );
    });

    it('should handle errors during the update process', async () => {
      const id = '1';
      const error = new Error('Unexpected Error');

      service.findOneWhere.mockRejectedValue(error);

      const result = await controller.update(id, updateLineOfBusinessDto);

      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
