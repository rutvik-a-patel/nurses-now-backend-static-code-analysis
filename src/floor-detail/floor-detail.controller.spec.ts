import { Test, TestingModule } from '@nestjs/testing';
import { FloorDetailController } from './floor-detail.controller';
import { FloorDetailService } from './floor-detail.service';
import { CreateFloorDetailDto } from './dto/create-floor-detail.dto';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { FloorDetail } from './entities/floor-detail.entity';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { UpdateFloorDetailDto } from './dto/update-floor-detail.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { IRequest } from '@/shared/constants/types';

describe('FloorDetailController', () => {
  let controller: FloorDetailController;
  let floorDetailService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FloorDetailController],
      providers: [
        {
          provide: FloorDetailService,
          useValue: {
            create: jest.fn(),
            findOneWhere: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findOneWithQueryBuilder: jest.fn(),
            floorActivityUpdateLog: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FloorDetailController>(FloorDetailController);
    floorDetailService = module.get<FloorDetailService>(FloorDetailService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createFloorDetailDto = new CreateFloorDetailDto();
    const req = {
      user: { first_name: 'Test', last_name: 'User', role: 'admin' },
    } as IRequest;
    it('should create new floor detail', async () => {
      const mockFloor = new FloorDetail();
      floorDetailService.create.mockResolvedValue(mockFloor);
      floorDetailService.findOneWithQueryBuilder.mockResolvedValue(
        new FloorDetail(),
      );
      const result = await controller.create(createFloorDetailDto, req);
      expect(floorDetailService.create).toHaveBeenCalledWith(
        createFloorDetailDto,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Floor'),
          data: mockFloor,
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      floorDetailService.create.mockRejectedValue(error);

      const result = await controller.create(createFloorDetailDto, req);
      expect(floorDetailService.create).toHaveBeenCalledWith(
        createFloorDetailDto,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findOne', () => {
    const id = '1';
    it('should return not found if data not found', async () => {
      floorDetailService.findOneWhere.mockResolvedValue(null);

      const result = await controller.findOne(id);
      expect(floorDetailService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
        relations: {
          speciality: true,
          client_contact: true,
          default_order_contact: true,
        },
        select: {
          id: true,
          name: true,
          beds: true,
          po_number: true,
          cost_center: true,
          phone_number: true,
          description: true,
          created_at: true,
          speciality: {
            id: true,
            name: true,
            abbreviation: true,
            background_color: true,
            text_color: true,
            created_at: true,
          },
          default_order_contact: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            base_url: true,
            image: true,
          },
          client_contact: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            base_url: true,
            image: true,
          },
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Floor Details'),
          data: {},
        }),
      );
    });

    it('should return shift setting details', async () => {
      floorDetailService.findOneWhere.mockResolvedValue(new FloorDetail());

      const result = await controller.findOne(id);
      expect(floorDetailService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
        relations: {
          speciality: true,
          client_contact: true,
          default_order_contact: true,
        },
        select: {
          id: true,
          name: true,
          beds: true,
          po_number: true,
          cost_center: true,
          phone_number: true,
          description: true,
          created_at: true,
          speciality: {
            id: true,
            name: true,
            abbreviation: true,
            background_color: true,
            text_color: true,
            created_at: true,
          },
          default_order_contact: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            base_url: true,
            image: true,
          },
          client_contact: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            base_url: true,
            image: true,
          },
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Floor Details'),
          data: new FloorDetail(),
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      floorDetailService.findOneWhere.mockRejectedValue(error);

      const result = await controller.findOne(id);
      expect(floorDetailService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
        relations: {
          speciality: true,
          client_contact: true,
          default_order_contact: true,
        },
        select: {
          id: true,
          name: true,
          beds: true,
          po_number: true,
          cost_center: true,
          phone_number: true,
          description: true,
          created_at: true,
          speciality: {
            id: true,
            name: true,
            abbreviation: true,
            background_color: true,
            text_color: true,
            created_at: true,
          },
          default_order_contact: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            base_url: true,
            image: true,
          },
          client_contact: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            base_url: true,
            image: true,
          },
        },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getAllFloor', () => {
    const id = '1';
    const queryParamsDto = new QueryParamsDto();
    it('should return not found if list is empty', async () => {
      queryParamsDto.search = 'test';
      floorDetailService.findAll.mockResolvedValue([[], 0]);

      const result = await controller.getAllFloor(id, queryParamsDto);
      expect(floorDetailService.findAll).toHaveBeenCalledWith({
        where: {
          facility: {
            id,
          },
        },
        relations: {
          speciality: true,
          client_contact: true,
          default_order_contact: true,
        },
        select: {
          id: true,
          name: true,
          beds: true,
          po_number: true,
          cost_center: true,
          phone_number: true,
          description: true,
          created_at: true,
          speciality: {
            id: true,
            name: true,
            abbreviation: true,
            background_color: true,
            text_color: true,
            created_at: true,
          },
          default_order_contact: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            base_url: true,
            image: true,
          },
          client_contact: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            base_url: true,
            image: true,
          },
        },
        order: queryParamsDto.order,
        take: +queryParamsDto.limit,
        skip: +queryParamsDto.offset,
      });
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Floor'),
          total: 0,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: [],
        }),
      );
    });

    it('should return floor detail list', async () => {
      queryParamsDto.search = 'test';
      floorDetailService.findAll.mockResolvedValue([[new FloorDetail()], 1]);

      const result = await controller.getAllFloor(id, queryParamsDto);
      expect(floorDetailService.findAll).toHaveBeenCalledWith({
        where: {
          facility: {
            id,
          },
        },
        relations: {
          speciality: true,
          client_contact: true,
          default_order_contact: true,
        },
        select: {
          id: true,
          name: true,
          beds: true,
          po_number: true,
          cost_center: true,
          phone_number: true,
          description: true,
          created_at: true,
          speciality: {
            id: true,
            name: true,
            abbreviation: true,
            background_color: true,
            text_color: true,
            created_at: true,
          },
          default_order_contact: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            base_url: true,
            image: true,
          },
          client_contact: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            base_url: true,
            image: true,
          },
        },
        order: queryParamsDto.order,
        take: +queryParamsDto.limit,
        skip: +queryParamsDto.offset,
      });
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Floor'),
          total: 1,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: [new FloorDetail()],
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      floorDetailService.findAll.mockRejectedValue(error);

      const result = await controller.getAllFloor(id, queryParamsDto);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('update', () => {
    const id = '1';
    const req = {
      user: { first_name: 'Test', last_name: 'User', role: 'admin' },
    } as IRequest;
    const updateFloorDetailDto = new UpdateFloorDetailDto();
    it('should return not found if data not found', async () => {
      floorDetailService.findOneWithQueryBuilder.mockResolvedValue(null);
      const result = await controller.update(id, updateFloorDetailDto, req);
      expect(floorDetailService.findOneWithQueryBuilder).toHaveBeenCalledWith(
        id,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Floor'),
          data: {},
        }),
      );
    });

    it('should return record no found if data not updated', async () => {
      floorDetailService.findOneWhere.mockResolvedValue(new FloorDetail());
      floorDetailService.update.mockResolvedValue({
        affected: 0,
      });
      floorDetailService.findOneWithQueryBuilder.mockResolvedValue(
        new FloorDetail(),
      );
      const result = await controller.update(id, updateFloorDetailDto, req);
      expect(floorDetailService.findOneWithQueryBuilder).toHaveBeenCalledWith(
        id,
      );
      expect(floorDetailService.update).toHaveBeenCalledWith(
        { id },
        updateFloorDetailDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Floor'),
          data: {},
        }),
      );
    });

    it('should return success message if data updated', async () => {
      floorDetailService.findOneWhere.mockResolvedValue(new FloorDetail());
      floorDetailService.update.mockResolvedValue({
        affected: 1,
      });

      floorDetailService.findOneWithQueryBuilder.mockResolvedValue(
        new FloorDetail(),
      );
      const result = await controller.update(id, updateFloorDetailDto, req);
      expect(floorDetailService.findOneWithQueryBuilder).toHaveBeenCalledWith(
        id,
      );
      expect(floorDetailService.update).toHaveBeenCalledWith(
        { id },
        updateFloorDetailDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Floor Detail'),
          data: {},
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      // floorDetailService.findOneWhere.mockRejectedValue(error);
      floorDetailService.findOneWithQueryBuilder.mockResolvedValue(error);

      const result = await controller.update(id, updateFloorDetailDto, req);
      expect(floorDetailService.findOneWithQueryBuilder).toHaveBeenCalledWith(
        id,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('remove', () => {
    const id = '1';
    const deleteDto = new DeleteDto();
    it('should return not found if data not found', async () => {
      floorDetailService.findOneWhere.mockResolvedValue(null);

      const result = await controller.remove(id, deleteDto);
      expect(floorDetailService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Floor'),
          data: {},
        }),
      );
    });

    it('should return record no found if data not removed', async () => {
      floorDetailService.findOneWhere.mockResolvedValue(new FloorDetail());
      floorDetailService.remove.mockResolvedValue({
        affected: 0,
      });

      const result = await controller.remove(id, deleteDto);
      expect(floorDetailService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(floorDetailService.remove).toHaveBeenCalledWith({ id }, deleteDto);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Floor'),
          data: {},
        }),
      );
    });

    it('should return success message if data removed', async () => {
      floorDetailService.findOneWhere.mockResolvedValue(new FloorDetail());
      floorDetailService.remove.mockResolvedValue({
        affected: 1,
      });

      const result = await controller.remove(id, deleteDto);
      expect(floorDetailService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(floorDetailService.remove).toHaveBeenCalledWith({ id }, deleteDto);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_DELETED('Floor'),
          data: {},
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      floorDetailService.findOneWhere.mockRejectedValue(error);

      const result = await controller.remove(id, deleteDto);
      expect(floorDetailService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
