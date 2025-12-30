import { Test, TestingModule } from '@nestjs/testing';
import { ProviderSavedFacilityController } from './provider-saved-facility.controller';
import { ProviderSavedFacilityService } from './provider-saved-facility.service';
import { ProviderSavedFacility } from './entities/provider-saved-facility.entity';
import response from '@/shared/response';
import { CreateProviderSavedFacilityDto } from './dto/create-provider-saved-facility.dto';
import { CONSTANT } from '@/shared/constants/message';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';

describe('ProviderSavedFacilityController', () => {
  let controller: ProviderSavedFacilityController;
  let providerSavedFacilityService: any;

  beforeEach(async () => {
    const providerSavedFacilityServiceMock = {
      create: jest.fn(),
      findOneWhere: jest.fn(),
      remove: jest.fn(),
      findAll: jest.fn(),
      findSelfFacility: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProviderSavedFacilityController],
      providers: [
        {
          provide: ProviderSavedFacilityService,
          useValue: providerSavedFacilityServiceMock,
        },
      ],
    }).compile();

    controller = module.get<ProviderSavedFacilityController>(
      ProviderSavedFacilityController,
    );
    providerSavedFacilityService = module.get<ProviderSavedFacilityService>(
      ProviderSavedFacilityService,
    );

    providerSavedFacilityService.findOneWhere = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof providerSavedFacilityService.findOneWhere
    >;
    providerSavedFacilityService.create = jest
      .fn()
      .mockResolvedValue(new ProviderSavedFacility()) as jest.MockedFunction<
      typeof providerSavedFacilityService.create
    >;
    providerSavedFacilityService.findAll = jest
      .fn()
      .mockResolvedValue([
        [new ProviderSavedFacility()],
        1,
      ]) as jest.MockedFunction<typeof providerSavedFacilityService.findAll>;
    providerSavedFacilityService.remove = jest
      .fn()
      .mockResolvedValue({ affected: 1 }) as jest.MockedFunction<
      typeof providerSavedFacilityService.remove
    >;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const req: any = { user: { id: '1' } };
    it('should save facility if not saved found', async () => {
      const createProviderSavedFacilityDto =
        new CreateProviderSavedFacilityDto();
      const mockFacility = new ProviderSavedFacility();
      providerSavedFacilityService.findOneWhere.mockResolvedValue(null);
      providerSavedFacilityService.create.mockResolvedValue(mockFacility);

      const result = await controller.saveOrRemoveFacility(
        req,
        createProviderSavedFacilityDto,
      );
      expect(providerSavedFacilityService.findOneWhere).toHaveBeenCalledWith({
        where: {
          provider: { id: req?.user?.id },
          facility: { id: createProviderSavedFacilityDto.facility },
        },
      });
      expect(providerSavedFacilityService.create).toHaveBeenCalledWith(
        createProviderSavedFacilityDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Facility Saved'),
          data: mockFacility,
        }),
      );
    });

    it('should return not found if no facility updated', async () => {
      const createProviderSavedFacilityDto =
        new CreateProviderSavedFacilityDto();
      const mockFacility = new ProviderSavedFacility();
      mockFacility.id = '1';
      providerSavedFacilityService.findOneWhere.mockResolvedValue(mockFacility);
      providerSavedFacilityService.remove.mockResolvedValue({ affected: 0 });

      const result = await controller.saveOrRemoveFacility(
        req,
        createProviderSavedFacilityDto,
      );
      expect(providerSavedFacilityService.findOneWhere).toHaveBeenCalledWith({
        where: {
          provider: { id: req?.user?.id },
          facility: { id: createProviderSavedFacilityDto.facility },
        },
      });
      expect(providerSavedFacilityService.remove).toHaveBeenCalledWith(
        mockFacility.id,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facility'),
          data: {},
        }),
      );
    });

    it('should remove facility if saved facility found', async () => {
      const createProviderSavedFacilityDto =
        new CreateProviderSavedFacilityDto();
      const mockFacility = new ProviderSavedFacility();
      mockFacility.id = '1';
      providerSavedFacilityService.findOneWhere.mockResolvedValue(mockFacility);
      providerSavedFacilityService.remove.mockResolvedValue({ affected: 1 });

      const result = await controller.saveOrRemoveFacility(
        req,
        createProviderSavedFacilityDto,
      );
      expect(providerSavedFacilityService.findOneWhere).toHaveBeenCalledWith({
        where: {
          provider: { id: req?.user?.id },
          facility: { id: createProviderSavedFacilityDto.facility },
        },
      });
      expect(providerSavedFacilityService.remove).toHaveBeenCalledWith(
        mockFacility.id,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Facility Removed'),
          data: {},
        }),
      );
    });

    it('should handle errors during process', async () => {
      const createProviderSavedFacilityDto =
        new CreateProviderSavedFacilityDto();
      const error = new Error('Database Error');
      providerSavedFacilityService.findOneWhere.mockRejectedValue(error);

      const result = await controller.saveOrRemoveFacility(
        req,
        createProviderSavedFacilityDto,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getSavedFacilities', () => {
    const queryParamsDto: QueryParamsDto = {
      limit: '10',
      offset: '0',
      search: 'John',
      order: { created_at: 'ASC' },
    };
    const req: any = { user: { id: '1' } };
    it('should successfully retrieve saved facilities', async () => {
      const mockReason = Array(10).fill(new ProviderSavedFacility());
      const mockCount = 10;

      providerSavedFacilityService.findAll.mockResolvedValue([
        mockReason,
        mockCount,
      ]); // Mock service response

      const result = await controller.getSavedFacilities(req, queryParamsDto);

      expect(providerSavedFacilityService.findAll).toHaveBeenCalledWith({
        relations: {
          facility: true,
        },
        where: {
          provider: { id: req?.user?.id },
        },
        select: {
          id: true,
          created_at: true,
          facility: {
            id: true,
            name: true,
            base_url: true,
            image: true,
          },
        },
        take: +queryParamsDto.limit,
        skip: +queryParamsDto.offset,
        order: queryParamsDto.order,
      });
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Saved Facilities'),
          total: mockCount,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: mockReason,
        }),
      );
    });

    it('should return no records found when there are no saved facilities', async () => {
      providerSavedFacilityService.findAll.mockResolvedValue([[], 0]);

      const result = await controller.getSavedFacilities(req, queryParamsDto);
      expect(providerSavedFacilityService.findAll).toHaveBeenCalledWith({
        relations: {
          facility: true,
        },
        where: {
          provider: { id: req?.user?.id },
        },
        select: {
          id: true,
          created_at: true,
          facility: {
            id: true,
            name: true,
            base_url: true,
            image: true,
          },
        },
        take: +queryParamsDto.limit,
        skip: +queryParamsDto.offset,
        order: queryParamsDto.order,
      });
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Saved Facilities'),
          total: 0,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: [],
        }),
      );
    });

    it('should handle errors during the fetch process', async () => {
      const errorMessage = 'Database error';
      providerSavedFacilityService.findAll.mockRejectedValue(
        new Error(errorMessage),
      ); // Simulate an error

      const result = await controller.getSavedFacilities(req, queryParamsDto);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });
});
