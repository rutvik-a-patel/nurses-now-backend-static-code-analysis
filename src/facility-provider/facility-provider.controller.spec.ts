import { Test, TestingModule } from '@nestjs/testing';
import { FacilityProviderController } from './facility-provider.controller';
import { FacilityProviderService } from './facility-provider.service';
import { ProviderCredentialsService } from '@/provider-credentials/provider-credentials.service';
import { FilterFacilityProviderDto } from './dto/filter-facility-provider.dto';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { FacilityProvider } from './entities/facility-provider.entity';
import { FlagDnrDto } from './dto/flag-dnr.dto';
import { UpdateFacilityProviderDto } from './dto/update-facility-provider.dto';
import { Provider } from '@/provider/entities/provider.entity';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { Certificate } from '@/certificate/entities/certificate.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';
import { Facility } from '@/facility/entities/facility.entity';

describe('FacilityProviderController', () => {
  let controller: FacilityProviderController;
  let facilityProviderService: any;

  beforeEach(async () => {
    const facilityProviderServiceMock = {
      getAll: jest.fn(),
      findOneWhere: jest.fn(),
      flagAsDnr: jest.fn(),
      updateWhere: jest.fn(),
      getProviderDetails: jest.fn(),
      findProviderDetails: jest.fn(),
      findAllFacilities: jest.fn(),
      getProviderSummary: jest.fn(),
      getScheduledCalendar: jest.fn(),
      getShiftHistory: jest.fn(),
      getAllCredentials: jest.fn(),
      countOfShiftsWorked: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacilityProviderController],
      providers: [
        {
          provide: FacilityProviderService,
          useValue: facilityProviderServiceMock,
        },
        {
          provide: ProviderCredentialsService,
          useValue: {},
        },
        {
          provide: AccessControlGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
      ],
    })
      .overrideGuard(AccessControlGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<FacilityProviderController>(
      FacilityProviderController,
    );
    facilityProviderService = module.get<FacilityProviderService>(
      FacilityProviderService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    const filterFacilityProviderDto = new FilterFacilityProviderDto();
    const id = '1';
    it('should return record not found if there is not data', async () => {
      facilityProviderService.getAll.mockResolvedValue([[], 0]);

      const result = await controller.getAll(filterFacilityProviderDto, id);
      expect(facilityProviderService.getAll).toHaveBeenCalledWith(
        filterFacilityProviderDto,
        id,
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff'),
          total: 0,
          limit: +filterFacilityProviderDto.limit,
          offset: +filterFacilityProviderDto.offset,
          data: [],
        }),
      );
    });

    it('should return facility provider list', async () => {
      facilityProviderService.getAll.mockResolvedValue([
        [new FacilityProvider()],
        1,
      ]);

      const result = await controller.getAll(filterFacilityProviderDto, id);
      expect(facilityProviderService.getAll).toHaveBeenCalledWith(
        filterFacilityProviderDto,
        id,
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Staff'),
          total: 1,
          limit: +filterFacilityProviderDto.limit,
          offset: +filterFacilityProviderDto.offset,
          data: [new FacilityProvider()],
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      facilityProviderService.getAll.mockRejectedValue(error);

      const result = await controller.getAll(filterFacilityProviderDto, id);
      expect(facilityProviderService.getAll).toHaveBeenCalledWith(
        filterFacilityProviderDto,
        id,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getOne', () => {
    const id = '1';
    it('should return bad request if data not found', async () => {
      facilityProviderService.findOneWhere.mockResolvedValue(null);

      const result = await controller.getOne(id);
      expect(facilityProviderService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Record'),
          data: {},
        }),
      );
    });

    it('should return data if found', async () => {
      facilityProviderService.findOneWhere.mockResolvedValue(
        new FacilityProvider(),
      );

      const result = await controller.getOne(id);
      expect(facilityProviderService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Record'),
          data: new FacilityProvider(),
        }),
      );
    });

    it('should handle failure case', async () => {
      const error = new Error('error');
      facilityProviderService.findOneWhere.mockRejectedValue(error);

      const result = await controller.getOne(id);
      expect(facilityProviderService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('flagAsDnr', () => {
    const id = '1';
    const req: any = {
      user: {
        id: '1',
        profile_progress: 100,
        status: { name: 'active' },
      },
    };
    const flagDnrDto = new FlagDnrDto();

    it('should return bad request if record not found', async () => {
      facilityProviderService.findOneWhere.mockResolvedValue(null);

      const result = await controller.flagAsDnr(id, flagDnrDto, req);
      expect(facilityProviderService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
        relations: { provider: true, facility: true },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Record'),
          data: {},
        }),
      );
    });

    it('should return not found if not data updated', async () => {
      // Mock provider with required nested objects
      const mockProvider = new FacilityProvider();
      const provider = new Provider();
      provider.id = '1';
      provider.first_name = 'John';
      provider.last_name = 'Doe';
      mockProvider.provider = provider;
      const facility = new Facility();
      facility.id = '1';
      mockProvider.facility = facility;
      facilityProviderService.findOneWhere.mockResolvedValue(mockProvider);
      facilityProviderService.countOfShiftsWorked.mockResolvedValue(true);
      facilityProviderService.flagAsDnr.mockResolvedValue({ affected: 0 });

      const result = await controller.flagAsDnr(id, flagDnrDto, req);
      expect(facilityProviderService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
        relations: { provider: true, facility: true },
      });
      expect(facilityProviderService.flagAsDnr).toHaveBeenCalledWith(
        { id },
        flagDnrDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
          data: {},
        }),
      );
    });

    it('should return success message if data updated', async () => {
      // Mock provider with required nested objects
      const mockProvider = new FacilityProvider();
      const provider = new Provider();
      provider.id = '1';
      provider.first_name = 'John';
      provider.last_name = 'Doe';
      mockProvider.provider = provider;
      const facility = new Facility();
      facility.id = '1';
      mockProvider.facility = facility;
      facilityProviderService.findOneWhere.mockResolvedValue(mockProvider);
      facilityProviderService.countOfShiftsWorked.mockResolvedValue(true);
      facilityProviderService.flagAsDnr.mockResolvedValue({ affected: 1 });

      const result = await controller.flagAsDnr(id, flagDnrDto, req);
      expect(facilityProviderService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
        relations: { provider: true, facility: true },
      });
      expect(facilityProviderService.flagAsDnr).toHaveBeenCalledWith(
        { id },
        flagDnrDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY(`Flagged John Doe as DNR`),
          data: {},
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      facilityProviderService.findOneWhere.mockRejectedValue(error);

      const result = await controller.flagAsDnr(id, flagDnrDto, req);
      expect(facilityProviderService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
        relations: { provider: true, facility: true },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('update', () => {
    const id = '1';
    const updateFacilityProviderDto = new UpdateFacilityProviderDto();
    it('should return bad request if record not found', async () => {
      facilityProviderService.findOneWhere.mockResolvedValue(null);

      const result = await controller.update(id, updateFacilityProviderDto);
      expect(facilityProviderService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
        relations: { provider: true, facility: true },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        }),
      );
    });

    it('should return not found if not data updated', async () => {
      // Mock provider with required nested objects
      const mockProvider = new FacilityProvider();
      const provider = new Provider();
      provider.id = '1';
      provider.first_name = 'John';
      provider.last_name = 'Doe';
      mockProvider.provider = provider;
      const facility = new Facility();
      facility.id = '1';
      mockProvider.facility = facility;
      facilityProviderService.findOneWhere.mockResolvedValue(mockProvider);
      facilityProviderService.countOfShiftsWorked.mockResolvedValue(true);
      facilityProviderService.updateWhere.mockResolvedValue({ affected: 0 });

      const result = await controller.update(id, updateFacilityProviderDto);
      expect(facilityProviderService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
        relations: { provider: true, facility: true },
      });
      expect(facilityProviderService.updateWhere).toHaveBeenCalledWith(
        { id },
        updateFacilityProviderDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff'),
          data: {},
        }),
      );
    });

    it('should return success message if data updated', async () => {
      // Mock provider with required nested objects
      const mockProvider = new FacilityProvider();
      const provider = new Provider();
      provider.id = '1';
      provider.first_name = 'John';
      provider.last_name = 'Doe';
      mockProvider.provider = provider;
      const facility = new Facility();
      facility.id = '1';
      mockProvider.facility = facility;
      facilityProviderService.findOneWhere.mockResolvedValue(mockProvider);
      facilityProviderService.countOfShiftsWorked.mockResolvedValue(true);
      facilityProviderService.updateWhere.mockResolvedValue({ affected: 1 });

      const result = await controller.update(id, updateFacilityProviderDto);
      expect(facilityProviderService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
        relations: { provider: true, facility: true },
      });
      expect(facilityProviderService.updateWhere).toHaveBeenCalledWith(
        { id },
        updateFacilityProviderDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY(
            `Flagged John Doe as Preferred`,
          ),
          data: {},
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      facilityProviderService.findOneWhere.mockRejectedValue(error);

      const result = await controller.update(id, updateFacilityProviderDto);
      expect(facilityProviderService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
        relations: { provider: true, facility: true },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getProviderDetails', () => {
    const id = '1';
    const facility_id = '1';
    it('should return bad request if record not found', async () => {
      facilityProviderService.getProviderDetails.mockResolvedValue(null);

      const result = await controller.getProviderDetails(id, facility_id);
      expect(facilityProviderService.getProviderDetails).toHaveBeenCalledWith(
        id,
        facility_id,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        }),
      );
    });

    it('should return provider details', async () => {
      const mockProvider = new FacilityProvider();
      facilityProviderService.getProviderDetails.mockResolvedValue(
        mockProvider,
      );

      const result = await controller.getProviderDetails(id, facility_id);
      expect(facilityProviderService.getProviderDetails).toHaveBeenCalledWith(
        id,
        facility_id,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Staff Details'),
          data: mockProvider,
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      facilityProviderService.getProviderDetails.mockRejectedValue(error);

      const result = await controller.getProviderDetails(id, facility_id);
      expect(facilityProviderService.getProviderDetails).toHaveBeenCalledWith(
        id,
        facility_id,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getProviderSummary', () => {
    const id = '1';
    it('should return bad request if record not found', async () => {
      facilityProviderService.getProviderSummary.mockResolvedValue(null);

      const result = await controller.getProviderSummary(id);
      expect(facilityProviderService.getProviderSummary).toHaveBeenCalledWith(
        id,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        }),
      );
    });

    it('should return success message with summary', async () => {
      const mockProvider = new Provider();
      facilityProviderService.getProviderSummary.mockResolvedValue(
        mockProvider,
      );

      const result = await controller.getProviderSummary(id);
      expect(facilityProviderService.getProviderSummary).toHaveBeenCalledWith(
        id,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Staff Summary'),
          data: mockProvider,
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      facilityProviderService.getProviderSummary.mockRejectedValue(error);

      const result = await controller.getProviderSummary(id);
      expect(facilityProviderService.getProviderSummary).toHaveBeenCalledWith(
        id,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getScheduledCalendar', () => {
    const id = '1';
    const start_date = '2024-08-09';
    const end_date = '2024-08-09';
    it('should return bad request if record not found', async () => {
      facilityProviderService.findOneWhere.mockResolvedValue(null);

      const result = await controller.getScheduledCalendar(
        id,
        start_date,
        end_date,
      );
      expect(facilityProviderService.findOneWhere).toHaveBeenCalledWith({
        relations: { provider: true, facility: true },
        where: { id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        }),
      );
    });

    it('should return calendar list', async () => {
      const mockProvider = new FacilityProvider();
      facilityProviderService.findOneWhere.mockResolvedValue(mockProvider);
      facilityProviderService.getScheduledCalendar.mockResolvedValue([]);

      const result = await controller.getScheduledCalendar(
        id,
        start_date,
        end_date,
      );
      expect(facilityProviderService.findOneWhere).toHaveBeenCalledWith({
        relations: { provider: true, facility: true },
        where: { id },
      });
      expect(facilityProviderService.getScheduledCalendar).toHaveBeenCalledWith(
        mockProvider,
        start_date,
        end_date,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Scheduled Shift'),
          data: [],
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      facilityProviderService.findOneWhere.mockRejectedValue(error);

      const result = await controller.getScheduledCalendar(
        id,
        start_date,
        end_date,
      );
      expect(facilityProviderService.findOneWhere).toHaveBeenCalledWith({
        relations: { provider: true, facility: true },
        where: { id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getShiftHistory', () => {
    const id = '1';
    const queryParamsDto = new QueryParamsDto();
    it('should return bad request if record not found', async () => {
      facilityProviderService.findOneWhere.mockResolvedValue(null);

      const result = await controller.getShiftHistory(id, queryParamsDto);
      expect(facilityProviderService.findOneWhere).toHaveBeenCalledWith({
        relations: { provider: true, facility: true },
        where: { id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        }),
      );
    });

    it('should return not found if not data found', async () => {
      const mockProvider = new FacilityProvider();
      facilityProviderService.findOneWhere.mockResolvedValue(mockProvider);
      facilityProviderService.getShiftHistory.mockResolvedValue([[], 0]);

      const result = await controller.getShiftHistory(id, queryParamsDto);
      expect(facilityProviderService.findOneWhere).toHaveBeenCalledWith({
        relations: { provider: true, facility: true },
        where: { id },
      });
      expect(facilityProviderService.getShiftHistory).toHaveBeenCalledWith(
        mockProvider,
        queryParamsDto,
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift History'),
          total: 0,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: [],
        }),
      );
    });

    it('should return not found if not data found', async () => {
      const mockProvider = new FacilityProvider();
      facilityProviderService.findOneWhere.mockResolvedValue(mockProvider);
      facilityProviderService.getShiftHistory.mockResolvedValue([
        [new Shift()],
        1,
      ]);

      const result = await controller.getShiftHistory(id, queryParamsDto);
      expect(facilityProviderService.findOneWhere).toHaveBeenCalledWith({
        relations: { provider: true, facility: true },
        where: { id },
      });
      expect(facilityProviderService.getShiftHistory).toHaveBeenCalledWith(
        mockProvider,
        queryParamsDto,
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Shift History'),
          total: 1,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: [new Provider()],
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      facilityProviderService.findOneWhere.mockRejectedValue(error);

      const result = await controller.getShiftHistory(id, queryParamsDto);
      expect(facilityProviderService.findOneWhere).toHaveBeenCalledWith({
        relations: { provider: true, facility: true },
        where: { id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getCredentials', () => {
    const id = '1';
    const query = '';

    it('should return bad request if record not found', async () => {
      facilityProviderService.findProviderDetails.mockResolvedValue(null);

      const result = await controller.getCredentials(id, query);
      expect(facilityProviderService.findProviderDetails).toHaveBeenCalledWith({
        where: { id },
        relations: {
          certificate: true,
          speciality: true,
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        }),
      );
    });

    it('should return not found if not data found', async () => {
      const mockProvider = new Provider();
      mockProvider.certificate = new Certificate();
      facilityProviderService.findProviderDetails.mockResolvedValue(
        mockProvider,
      );
      facilityProviderService.getAllCredentials.mockResolvedValue(null);

      const result = await controller.getCredentials(id, query);
      expect(facilityProviderService.findProviderDetails).toHaveBeenCalledWith({
        where: { id },
        relations: {
          certificate: true,
          speciality: true,
        },
      });
      expect(facilityProviderService.getAllCredentials).toHaveBeenCalledWith(
        mockProvider,
        query,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Credentials'),
          data: [],
        }),
      );
    });

    it('should return not found if not data found', async () => {
      const mockProvider = new Provider();
      mockProvider.certificate = new Certificate();
      facilityProviderService.findProviderDetails.mockResolvedValue(
        mockProvider,
      );
      facilityProviderService.getAllCredentials.mockResolvedValue([]);

      const result = await controller.getCredentials(id, query);
      expect(facilityProviderService.findProviderDetails).toHaveBeenCalledWith({
        where: { id },
        relations: {
          certificate: true,
          speciality: true,
        },
      });
      expect(facilityProviderService.getAllCredentials).toHaveBeenCalledWith(
        mockProvider,
        query,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Credentials'),
          data: [],
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      facilityProviderService.findProviderDetails.mockRejectedValue(error);

      const result = await controller.getCredentials(id, query);
      expect(facilityProviderService.findProviderDetails).toHaveBeenCalledWith({
        where: { id },
        relations: {
          certificate: true,
          speciality: true,
        },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getFacilities', () => {
    const id = '1';
    const queryParamsDto = new QueryParamsDto();
    it('should return bad request if data not found', async () => {
      facilityProviderService.findProviderDetails.mockResolvedValue(null);

      const result = await controller.getFacilities(id, queryParamsDto);
      expect(facilityProviderService.findProviderDetails).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        }),
      );
    });

    it('should return bad request if data not found', async () => {
      facilityProviderService.findProviderDetails.mockResolvedValue(
        new Provider(),
      );
      const mockFacilities = [];
      const mockCount = mockFacilities.length;
      facilityProviderService.findAllFacilities.mockResolvedValue([
        mockFacilities,
        mockCount,
      ]);

      const result = await controller.getFacilities(id, queryParamsDto);
      expect(facilityProviderService.findProviderDetails).toHaveBeenCalledWith({
        where: { id },
      });
      expect(facilityProviderService.findAllFacilities).toHaveBeenCalledWith(
        id,
        queryParamsDto,
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facilities'),
          total: mockCount,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: mockFacilities,
        }),
      );
    });

    it('should return facility list', async () => {
      facilityProviderService.findProviderDetails.mockResolvedValue(
        new Provider(),
      );
      const mockFacilities = [new FacilityProvider()];
      const mockCount = mockFacilities.length;
      facilityProviderService.findAllFacilities.mockResolvedValue([
        mockFacilities,
        mockCount,
      ]);

      const result = await controller.getFacilities(id, queryParamsDto);
      expect(facilityProviderService.findProviderDetails).toHaveBeenCalledWith({
        where: { id },
      });
      expect(facilityProviderService.findAllFacilities).toHaveBeenCalledWith(
        id,
        queryParamsDto,
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Facilities'),
          total: mockCount,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: mockFacilities,
        }),
      );
    });

    it('should handle failure case', async () => {
      const error = new Error('error');
      facilityProviderService.findProviderDetails.mockRejectedValue(error);

      const result = await controller.getFacilities(id, queryParamsDto);
      expect(facilityProviderService.findProviderDetails).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
