import { Test, TestingModule } from '@nestjs/testing';
import { LineOfBusinessController } from './line-of-business.controller';
import { LineOfBusinessService } from './line-of-business.service';
import { CONSTANT } from '@/shared/constants/message';
import { LineOfBusiness } from './entities/line-of-business.entity';
import response from '@/shared/response';
import { CreateLineOfBusinessDto } from './dto/create-line-of-business.dto';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { ILike } from 'typeorm';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { UpdateLineOfBusinessDto } from './dto/update-line-of-business.dto';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('LineOfBusinessController', () => {
  let controller: LineOfBusinessController;
  let service: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LineOfBusinessController],
      providers: [
        {
          provide: LineOfBusinessService,
          useValue: {
            checkName: jest.fn(),
            create: jest.fn(),
            findOneWhere: jest.fn(),
            findAll: jest.fn(),
            remove: jest.fn(),
            update: jest.fn(),
            isAlreadyUsed: jest.fn(),
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

    controller = module.get<LineOfBusinessController>(LineOfBusinessController);
    service = module.get<LineOfBusinessService>(LineOfBusinessService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createLineOfBusinessDto = new CreateLineOfBusinessDto();
    createLineOfBusinessDto.name = 'Test lob';
    createLineOfBusinessDto.work_comp_code = 'TL';
    it('should return a bad request if the lob already exists', async () => {
      const existingLob = new LineOfBusiness();
      existingLob.name = 'Test lob'; // Same name
      existingLob.work_comp_code = 'OLD'; // Different work_comp_code

      service.checkName.mockResolvedValue(existingLob); // Simulate finding an existing lob

      const result = await controller.create(createLineOfBusinessDto);

      expect(service.checkName).toHaveBeenCalledWith(
        createLineOfBusinessDto.name,
        createLineOfBusinessDto.work_comp_code,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS(
            'Facility Type or Work Comp Code',
          ),
          data: { name: true },
        }),
      );
    });

    it('should successfully create a lob', async () => {
      service.checkName.mockResolvedValue(null); // No existing lob found
      service.create.mockResolvedValue({
        id: '123',
        name: 'New lob',
      }); // Simulate successful lob creation

      const result = await controller.create(createLineOfBusinessDto);
      expect(service.checkName).toHaveBeenCalledWith(
        createLineOfBusinessDto.name,
        createLineOfBusinessDto.work_comp_code,
      );
      expect(service.create).toHaveBeenCalledWith(createLineOfBusinessDto);
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Facility Type'),
          data: { id: '123', name: 'New lob' },
        }),
      );
    });

    it('should handle errors during lob creation', async () => {
      const error = new Error('Database Error');
      service.checkName.mockRejectedValue(error); // Simulate an error during the findOne operation

      const result = await controller.create(createLineOfBusinessDto);

      expect(service.checkName).toHaveBeenCalledWith(
        createLineOfBusinessDto.name,
        createLineOfBusinessDto.work_comp_code,
      );
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
    it('should successfully retrieve lob', async () => {
      const mockLob = Array(10).fill(new LineOfBusiness());
      const mockCount = 10;

      service.findAll.mockResolvedValue([mockLob, mockCount]); // Mock service response

      const result = await controller.findAll(queryParamsDto);

      expect(service.findAll).toHaveBeenCalledWith({
        where: [
          { name: ILike(`%${parseSearchKeyword(queryParamsDto.search)}%`) },
          {
            work_comp_code: ILike(
              `%${parseSearchKeyword(queryParamsDto.search)}%`,
            ),
          },
        ],
        order: queryParamsDto.order,
        take: +queryParamsDto.limit,
        skip: +queryParamsDto.offset,
      });
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Facility Type'),
          total: mockCount,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: mockLob,
        }),
      );
    });

    it('should return no records found when there are no lob', async () => {
      service.findAll.mockResolvedValue([[], 0]);

      const result = await controller.findAll(queryParamsDto);
      expect(service.findAll).toHaveBeenCalledWith({
        where: [
          { name: ILike(`%${parseSearchKeyword(queryParamsDto.search)}%`) },
          {
            work_comp_code: ILike(
              `%${parseSearchKeyword(queryParamsDto.search)}%`,
            ),
          },
        ],
        order: queryParamsDto.order,
        take: +queryParamsDto.limit,
        skip: +queryParamsDto.offset,
      });
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facility Type'),
          total: 0,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: [],
        }),
      );
    });

    it('should handle errors during the fetch process', async () => {
      queryParamsDto.search = null;
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

      service.isAlreadyUsed.mockResolvedValue(0); // Not used by any facility
      service.remove.mockResolvedValue({ affected: 1 }); // Simulate successful deletion

      const result = await controller.remove(id, deleteDto);

      expect(service.isAlreadyUsed).toHaveBeenCalledWith(id);
      expect(service.remove).toHaveBeenCalledWith(id, deleteDto);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_DELETED('Facility Type'),
          data: {},
        }),
      );
    });

    it('should return a not found response when no lob is deleted', async () => {
      const id = '2';
      const deleteDto = new DeleteDto();
      deleteDto.deleted_at_ip = '192.168.1.2';

      service.isAlreadyUsed.mockResolvedValue(0); // Not used by any facility
      service.remove.mockResolvedValue({ affected: 0 }); // Simulate no records affected

      const result = await controller.remove(id, deleteDto);

      expect(service.isAlreadyUsed).toHaveBeenCalledWith(id);
      expect(service.remove).toHaveBeenCalledWith(id, deleteDto);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facility Type'),
          data: {},
        }),
      );
    });

    it('should handle errors during the deletion process', async () => {
      const id = '3';
      const deleteDto = new DeleteDto();
      deleteDto.deleted_at_ip = '192.168.1.3';
      const error = new Error('Database error');

      service.isAlreadyUsed.mockResolvedValue(0); // Not used by any facility
      service.remove.mockRejectedValue(error); // Simulate an error

      const result = await controller.remove(id, deleteDto);

      expect(service.isAlreadyUsed).toHaveBeenCalledWith(id);
      expect(service.remove).toHaveBeenCalledWith(id, deleteDto);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findOne', () => {
    it('should return the lob if found', async () => {
      const id = '1';
      const lob = new LineOfBusiness();
      lob.id = id;
      lob.name = 'Test lob';

      service.findOneWhere.mockResolvedValue(lob);

      const result = await controller.findOne(id);

      expect(service.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: id,
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Facility Type'),
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
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facility Type'),
          data: null,
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
      const updateLineOfBusinessDto = new UpdateLineOfBusinessDto();
      updateLineOfBusinessDto.name = 'Updated Name';

      service.findOneWhere.mockResolvedValue(null);

      const result = await controller.update(id, updateLineOfBusinessDto);

      expect(service.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility Type'),
          data: {},
        }),
      );
    });

    const updateLineOfBusinessDto = new UpdateLineOfBusinessDto();
    it('should return a bad request if another lob with the same name exists', async () => {
      const id = '1';
      updateLineOfBusinessDto.name = 'Existing Name';
      updateLineOfBusinessDto.work_comp_code = 'EX';

      const existingLob = new LineOfBusiness();
      existingLob.name = 'Existing Name'; // Same name
      existingLob.work_comp_code = 'OLD'; // Different work_comp_code

      service.findOneWhere.mockResolvedValueOnce(new LineOfBusiness());
      service.checkName.mockResolvedValueOnce(existingLob);

      const result = await controller.update(id, updateLineOfBusinessDto);

      expect(service.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: id,
        },
      });

      expect(service.checkName).toHaveBeenCalledWith(
        updateLineOfBusinessDto.name,
        updateLineOfBusinessDto.work_comp_code,
      );

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Facility Type'),
          data: { name: true },
        }),
      );
    });

    it('should successfully update the lob', async () => {
      const id = '1';
      updateLineOfBusinessDto.name = 'Updated Name';

      service.findOneWhere.mockResolvedValueOnce(new LineOfBusiness());
      service.checkName.mockResolvedValueOnce(null);

      service.update.mockResolvedValue({ affected: 1 });

      const result = await controller.update(id, updateLineOfBusinessDto);

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Facility Type'),
          data: {},
        }),
      );
    });

    it('should return an error if no records were updated', async () => {
      const id = '1';

      service.findOneWhere.mockResolvedValueOnce(new LineOfBusiness());
      service.checkName.mockResolvedValueOnce(null);

      service.update.mockResolvedValue({ affected: 0 });

      const result = await controller.update(id, updateLineOfBusinessDto);

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility Type'),
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
