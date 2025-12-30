import { Test, TestingModule } from '@nestjs/testing';
import { DropdownController } from './dropdown.controller';
import { DropdownService } from './dropdown.service';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { Certificate } from '@/certificate/entities/certificate.entity';
import { Speciality } from '@/speciality/entities/speciality.entity';
import { Country } from '@/country/entities/country.entity';
import { ILike, In, IsNull, Not } from 'typeorm';
import { State } from '@/state/entities/state.entity';
import { City } from '@/city/entities/city.entity';
import { FacilityPermission } from '@/facility-user/entities/facility-permission.entity';
import {
  DEFAULT_STATUS,
  DNR_TYPE,
  FILTER_PROVIDER_BY,
  TABLE,
  USER_TYPE,
} from '@/shared/constants/enum';
import { Role } from '@/role/entities/role.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { ShiftCancelReason } from '@/shift-cancel-reason/entities/shift-cancel-reason.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { FacilityShiftSetting } from '@/facility-shift-setting/entities/facility-shift-setting.entity';
import { FilterProviderDto } from './dto/filter-provider.dto';
import { Provider } from '@/provider/entities/provider.entity';
import { ShiftType } from '@/shift-type/entities/shift-type.entity';
import { LineOfBusiness } from '@/line-of-business/entities/line-of-business.entity';
import { TimecardRejectReason } from '@/timecard-reject-reason/entities/timecard-reject-reason.entity';
import { CompetencyTestSetting } from '@/competency-test-setting/entities/competency-test-setting.entity';
import { SkillChecklistTemplate } from '@/skill-checklist-template/entities/skill-checklist-template.entity';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { FlagSetting } from '@/flag-setting/entities/flag-setting.entity';
import { DnrReason } from '@/dnr-reason/entities/dnr-reason.entity';
import { EDocsGroup } from '@/e-docs-group/entities/e-docs-group.entity';
import { Admin } from '@/admin/entities/admin.entity';
import { FilterDropdownDto } from './dto/filter.dropdown.dto';
import { IRequest } from '@/shared/constants/types';

describe('DropdownController', () => {
  let controller: DropdownController;
  let dropdownService: any;

  beforeEach(async () => {
    const dropdownServiceMock = {
      getCertificates: jest.fn(),
      getSpecialties: jest.fn(),
      getCountry: jest.fn(),
      getState: jest.fn(),
      getCity: jest.fn(),
      getFacilityPermissions: jest.fn(),
      getRoles: jest.fn(),
      getFacility: jest.fn(),
      getShiftCancelReason: jest.fn(),
      findOneFacilityWhere: jest.fn(),
      getFacilityUser: jest.fn(),
      getTimeSettingForShift: jest.fn(),
      getAllProvider: jest.fn(),
      getShiftTypes: jest.fn(),
      getLineOfBusiness: jest.fn(),
      getAllTimecardRejectReason: jest.fn(),
      getCompetencyTest: jest.fn(),
      getSkillChecklist: jest.fn(),
      getFlagList: jest.fn(),
      getDNRReason: jest.fn(),
      getAllAdminUser: jest.fn(),
      getEDocGroups: jest.fn(),
      getEDocs: jest.fn(),
      getAllFloorListing: jest.fn(),
      getAllProviderV3: jest.fn(),
      tags: jest.fn(),
      relatesTo: jest.fn(),
      getFacilityCertificatesOrNull: jest.fn(),
      getFacilitySpecialtiesOnly: jest.fn(),
      getReferenceRejectReasons: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ limit: 0, ttl: 0 }])],
      controllers: [DropdownController],
      providers: [
        {
          provide: DropdownService,
          useValue: dropdownServiceMock,
        },
        {
          provide: APP_GUARD,
          useClass: ThrottlerGuard,
        },
      ],
    }).compile();

    controller = module.get<DropdownController>(DropdownController);
    dropdownService = module.get<DropdownService>(DropdownService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCertificates', () => {
    const filter = new FilterDropdownDto();
    filter.search = null;
    filter.facility_id = null;

    it('should return bad request if certificate not found', async () => {
      dropdownService.getCertificates.mockResolvedValue(null);

      const result = await controller.getCertificates(filter);
      expect(dropdownService.getCertificates).toHaveBeenCalledWith(filter);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Licenses'),
          data: [],
        }),
      );
    });

    it('should return certificate list', async () => {
      const mockCertificate = [new Certificate()];
      dropdownService.getCertificates.mockResolvedValue(mockCertificate);

      const result = await controller.getCertificates(filter);
      expect(dropdownService.getCertificates).toHaveBeenCalledWith(filter);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Licenses'),
          data: mockCertificate,
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      dropdownService.getCertificates.mockRejectedValue(error);

      const result = await controller.getCertificates(filter);
      expect(dropdownService.getCertificates).toHaveBeenCalledWith(filter);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getSpecialties', () => {
    const filter = new FilterDropdownDto();
    it('should return bad request if speciality not found', async () => {
      dropdownService.getSpecialties.mockResolvedValue(null);

      const result = await controller.getSpecialties(filter);
      expect(dropdownService.getSpecialties).toHaveBeenCalledWith(filter);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Specialty'),
          data: [],
        }),
      );
    });

    it('should return speciality list', async () => {
      const mockSpeciality = [new Speciality()];
      dropdownService.getSpecialties.mockResolvedValue(mockSpeciality);

      const result = await controller.getSpecialties(filter);
      expect(dropdownService.getSpecialties).toHaveBeenCalledWith(filter);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Specialty'),
          data: mockSpeciality,
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      dropdownService.getSpecialties.mockRejectedValue(error);

      const result = await controller.getSpecialties(filter);
      expect(dropdownService.getSpecialties).toHaveBeenCalledWith(filter);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getCountry', () => {
    it('should return bad request if country not found', async () => {
      dropdownService.getCountry.mockResolvedValue(null);

      const result = await controller.getCountry();
      expect(dropdownService.getCountry).toHaveBeenCalledWith();
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Countries'),
          data: [],
        }),
      );
    });

    it('should return country list', async () => {
      const mockCountry = [new Country()];
      dropdownService.getCountry.mockResolvedValue(mockCountry);

      const result = await controller.getCountry();
      expect(dropdownService.getCountry).toHaveBeenCalledWith();
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Countries'),
          data: mockCountry,
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      dropdownService.getCountry.mockRejectedValue(error);

      const result = await controller.getCountry();
      expect(dropdownService.getCountry).toHaveBeenCalledWith();
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getState', () => {
    const req: any = { query: { country_id: '1' } };
    it('should return bad request if country not found', async () => {
      dropdownService.getState.mockResolvedValue(null);

      const result = await controller.getState(req);
      expect(dropdownService.getState).toHaveBeenCalledWith({
        where: { deleted_at: IsNull(), country: { id: req.query.country_id } },
        select: {
          id: true,
          name: true,
        },
        order: {
          name: 'ASC',
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('States'),
          data: [],
        }),
      );
    });

    it('should return country list', async () => {
      const mockState = [new State()];
      dropdownService.getState.mockResolvedValue(mockState);

      const result = await controller.getState(req);
      expect(dropdownService.getState).toHaveBeenCalledWith({
        where: { deleted_at: IsNull(), country: { id: req.query.country_id } },
        select: {
          id: true,
          name: true,
        },
        order: {
          name: 'ASC',
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('States'),
          data: mockState,
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      dropdownService.getState.mockRejectedValue(error);

      const result = await controller.getState(req);
      expect(dropdownService.getState).toHaveBeenCalledWith({
        where: { deleted_at: IsNull(), country: { id: req.query.country_id } },
        select: {
          id: true,
          name: true,
        },
        order: {
          name: 'ASC',
        },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getCity', () => {
    const req: any = { query: { state_id: '1' } };
    it('should return bad request if city not found', async () => {
      dropdownService.getCity.mockResolvedValue(null);

      const result = await controller.getCity(req);
      expect(dropdownService.getCity).toHaveBeenCalledWith({
        where: { deleted_at: IsNull(), state: { id: req.query.state_id } },
        select: {
          id: true,
          name: true,
        },
        order: {
          name: 'ASC',
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Cities'),
          data: [],
        }),
      );
    });

    it('should return city list', async () => {
      const mockCity = [new City()];
      dropdownService.getCity.mockResolvedValue(mockCity);

      const result = await controller.getCity(req);
      expect(dropdownService.getCity).toHaveBeenCalledWith({
        where: { deleted_at: IsNull(), state: { id: req.query.state_id } },
        select: {
          id: true,
          name: true,
        },
        order: {
          name: 'ASC',
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Cities'),
          data: mockCity,
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      dropdownService.getCity.mockRejectedValue(error);

      const result = await controller.getCity(req);
      expect(dropdownService.getCity).toHaveBeenCalledWith({
        where: { deleted_at: IsNull(), state: { id: req.query.state_id } },
        select: {
          id: true,
          name: true,
        },
        order: {
          name: 'ASC',
        },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getCitySearch', () => {
    it('should return bad request if city not found', async () => {
      const search = 'test';
      dropdownService.getCity.mockResolvedValue(null);

      const result = await controller.getCitySearch(search);
      expect(dropdownService.getCity).toHaveBeenCalledWith({
        where: { deleted_at: IsNull(), name: ILike(`%${search}%`) },
        relations: {
          state: {
            country: true,
          },
        },
        select: {
          id: true,
          name: true,
          state: {
            id: true,
            name: true,
            country: {
              id: true,
              name: true,
            },
          },
        },
        order: { name: 'ASC' },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Cities'),
          data: [],
        }),
      );
    });

    it('should return state list', async () => {
      const search = 'test';
      const mockCity = [new City()];
      dropdownService.getCity.mockResolvedValue(mockCity);

      const result = await controller.getCitySearch(search);
      expect(dropdownService.getCity).toHaveBeenCalledWith({
        where: { deleted_at: IsNull(), name: ILike(`%${search}%`) },
        relations: {
          state: {
            country: true,
          },
        },
        select: {
          id: true,
          name: true,
          state: {
            id: true,
            name: true,
            country: {
              id: true,
              name: true,
            },
          },
        },
        order: { name: 'ASC' },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Cities'),
          data: mockCity,
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const search = '';
      const error = new Error('Database Error');
      dropdownService.getCity.mockRejectedValue(error);

      const result = await controller.getCitySearch(search);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getFacilityPermissions', () => {
    it('should return bad request if permission not found', async () => {
      dropdownService.getFacilityPermissions.mockResolvedValue(null);

      const result = await controller.getFacilityPermissions();
      expect(dropdownService.getFacilityPermissions).toHaveBeenCalledWith({
        where: { deleted_at: IsNull() },
        select: {
          id: true,
          name: true,
        },
        order: {
          name: 'ASC',
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Permissions'),
          data: [],
        }),
      );
    });

    it('should return permission list', async () => {
      const mockFacilityPermission = [new FacilityPermission()];
      dropdownService.getFacilityPermissions.mockResolvedValue(
        mockFacilityPermission,
      );

      const result = await controller.getFacilityPermissions();
      expect(dropdownService.getFacilityPermissions).toHaveBeenCalledWith({
        where: { deleted_at: IsNull() },
        select: {
          id: true,
          name: true,
        },
        order: {
          name: 'ASC',
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Permissions'),
          data: mockFacilityPermission,
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      dropdownService.getFacilityPermissions.mockRejectedValue(error);

      const result = await controller.getFacilityPermissions();
      expect(dropdownService.getFacilityPermissions).toHaveBeenCalledWith({
        where: { deleted_at: IsNull() },
        select: {
          id: true,
          name: true,
        },
        order: {
          name: 'ASC',
        },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getRoles', () => {
    it('should return bad request if role not found', async () => {
      dropdownService.getRoles.mockResolvedValue(null);

      const result = await controller.getRoles();
      expect(dropdownService.getRoles).toHaveBeenCalledWith({
        where: { deleted_at: IsNull(), status: DEFAULT_STATUS.active },
        select: {
          id: true,
          name: true,
        },
        order: {
          name: 'ASC',
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Roles'),
          data: [],
        }),
      );
    });

    it('should return role list', async () => {
      const mockRole = [new Role()];
      dropdownService.getRoles.mockResolvedValue(mockRole);

      const result = await controller.getRoles();
      expect(dropdownService.getRoles).toHaveBeenCalledWith({
        where: { deleted_at: IsNull(), status: DEFAULT_STATUS.active },
        select: {
          id: true,
          name: true,
        },
        order: {
          name: 'ASC',
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Roles'),
          data: mockRole,
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      dropdownService.getRoles.mockRejectedValue(error);

      const result = await controller.getRoles();
      expect(dropdownService.getRoles).toHaveBeenCalledWith({
        where: { deleted_at: IsNull(), status: DEFAULT_STATUS.active },
        select: {
          id: true,
          name: true,
        },
        order: {
          name: 'ASC',
        },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getFacility', () => {
    const req: any = { user: { id: '1', facility_id: ['1'] } };
    it('should return bad request if facility not found', async () => {
      const search = '';
      dropdownService.getFacility.mockResolvedValue(null);

      const result = await controller.getFacility(req, search);
      expect(dropdownService.getFacility).toHaveBeenCalledWith({
        where: [
          {
            id: req.user.id,
            name: ILike(`%${search}%`),
          },
          {
            master_facility_id: req.user.id,
            name: ILike(`%${search}%`),
          },
          {
            name: ILike(`%${search}%`),
            id: In(req.user?.facility_id),
          },
        ],
        relations: { facility_type: true },
        select: {
          id: true,
          name: true,
          is_master: true,
          base_url: true,
          image: true,
          facility_type: {
            id: true,
            name: true,
            work_comp_code: true,
          },
          country: true,
          state: true,
          city: true,
        },
        order: {
          name: 'ASC',
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facility'),
          data: [],
        }),
      );
    });

    it('should return facility list', async () => {
      const search = 'test';
      const mockFacility = [new Facility()];
      dropdownService.getFacility.mockResolvedValue(mockFacility);

      const result = await controller.getFacility(req, search);
      expect(dropdownService.getFacility).toHaveBeenCalledWith({
        where: [
          {
            id: req.user.id,
            name: ILike(`%${search}%`),
          },
          {
            master_facility_id: req.user.id,
            name: ILike(`%${search}%`),
          },
          {
            name: ILike(`%${search}%`),
            id: In(req.user?.facility_id),
          },
        ],
        relations: { facility_type: true },
        select: {
          id: true,
          name: true,
          is_master: true,
          base_url: true,
          image: true,
          facility_type: {
            id: true,
            name: true,
            work_comp_code: true,
          },
          country: true,
          state: true,
          city: true,
        },
        order: {
          name: 'ASC',
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Facility'),
          data: mockFacility,
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const search = 'test';
      const error = new Error('Database Error');
      dropdownService.getFacility.mockRejectedValue(error);

      const result = await controller.getFacility(req, search);
      expect(dropdownService.getFacility).toHaveBeenCalledWith({
        where: [
          {
            id: req.user.id,
            name: ILike(`%${search}%`),
          },
          {
            master_facility_id: req.user.id,
            name: ILike(`%${search}%`),
          },
          {
            name: ILike(`%${search}%`),
            id: In(req.user?.facility_id),
          },
        ],
        relations: { facility_type: true },
        select: {
          id: true,
          name: true,
          is_master: true,
          base_url: true,
          image: true,
          facility_type: {
            id: true,
            name: true,
            work_comp_code: true,
          },
          country: true,
          state: true,
          city: true,
        },
        order: {
          name: 'ASC',
        },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getAllFacility', () => {
    const id = '1';
    it('should return bad request if facility not found', async () => {
      const search = '';
      dropdownService.getFacility.mockResolvedValue(null);

      const result = await controller.getAllFacility(id, search);
      expect(dropdownService.getFacility).toHaveBeenCalledWith({
        where: [
          {
            id,
            name: ILike(`%${search}%`),
            ...{ is_corporate_client: false },
          },
          {
            master_facility_id: id,
            name: ILike(`%${search}%`),
            ...{ is_corporate_client: false },
          },
        ],
        relations: { facility_type: true },
        select: {
          id: true,
          name: true,
          is_master: true,
          base_url: true,
          image: true,
          facility_type: {
            id: true,
            name: true,
            work_comp_code: true,
          },
          country: true,
          state: true,
          city: true,
          is_corporate_client: true,
        },
        order: {
          name: 'ASC',
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facility'),
          data: [],
        }),
      );
    });

    it('should return facility list', async () => {
      const search = 'test';
      const mockFacility = [new Facility()];
      dropdownService.getFacility.mockResolvedValue(mockFacility);

      const result = await controller.getAllFacility(id, search);
      expect(dropdownService.getFacility).toHaveBeenCalledWith({
        where: [
          {
            id,
            name: ILike(`%${search}%`),
            ...{ is_corporate_client: false },
          },
          {
            master_facility_id: id,
            name: ILike(`%${search}%`),
            ...{ is_corporate_client: false },
          },
        ],
        relations: { facility_type: true },
        select: {
          id: true,
          name: true,
          is_master: true,
          base_url: true,
          image: true,
          facility_type: {
            id: true,
            name: true,
            work_comp_code: true,
          },
          country: true,
          state: true,
          city: true,
          is_corporate_client: true,
        },
        order: {
          name: 'ASC',
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Facility'),
          data: mockFacility,
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const search = 'test';
      const error = new Error('Database Error');
      dropdownService.getFacility.mockRejectedValue(error);

      const result = await controller.getAllFacility(id, search);
      expect(dropdownService.getFacility).toHaveBeenCalledWith({
        where: [
          {
            id,
            name: ILike(`%${search}%`),
            ...{ is_corporate_client: false },
          },
          {
            master_facility_id: id,
            name: ILike(`%${search}%`),
            ...{ is_corporate_client: false },
          },
        ],
        relations: { facility_type: true },
        select: {
          id: true,
          name: true,
          is_master: true,
          base_url: true,
          image: true,
          facility_type: {
            id: true,
            name: true,
            work_comp_code: true,
          },
          country: true,
          state: true,
          city: true,
          is_corporate_client: true,
        },
        order: {
          name: 'ASC',
        },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getShiftCancelReason', () => {
    const type = USER_TYPE.provider;
    it('should return bad request if cancel reason not found', async () => {
      dropdownService.getShiftCancelReason.mockResolvedValue(null);

      const result = await controller.getShiftCancelReason(type);
      expect(dropdownService.getShiftCancelReason).toHaveBeenCalledWith({
        where: {
          deleted_at: IsNull(),
          user_type: type,
          status: DEFAULT_STATUS.active,
        },
        select: {
          id: true,
          reason: true,
        },
        order: { reason: 'ASC' },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
          data: [],
        }),
      );
    });

    it('should return facility list', async () => {
      const mockReason = [new ShiftCancelReason()];
      dropdownService.getShiftCancelReason.mockResolvedValue(mockReason);

      const result = await controller.getShiftCancelReason(type);
      expect(dropdownService.getShiftCancelReason).toHaveBeenCalledWith({
        where: {
          deleted_at: IsNull(),
          user_type: type,
          status: DEFAULT_STATUS.active,
        },
        select: {
          id: true,
          reason: true,
        },
        order: { reason: 'ASC' },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Record'),
          data: mockReason,
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      dropdownService.getShiftCancelReason.mockRejectedValue(error);

      const result = await controller.getShiftCancelReason(type);
      expect(dropdownService.getShiftCancelReason).toHaveBeenCalledWith({
        where: {
          deleted_at: IsNull(),
          user_type: type,
          status: DEFAULT_STATUS.active,
        },
        select: {
          id: true,
          reason: true,
        },
        order: { reason: 'ASC' },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getFacilityUsers', () => {
    const id = '1';
    const search = 'test';
    const is_billing = true;
    it('should return bad request if facility not found', async () => {
      dropdownService.findOneFacilityWhere.mockResolvedValue(null);

      const result = await controller.getFacilityUsers(id, search, is_billing);
      expect(dropdownService.findOneFacilityWhere).toHaveBeenCalledWith({
        where: { id: id, deleted_at: IsNull() },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility'),
          data: {},
        }),
      );
    });

    it('should return facility user list', async () => {
      const mockFacility = new Facility();
      mockFacility.id = '1';
      mockFacility.is_master = false;

      const mockFacilityUser = [new FacilityUser()];
      dropdownService.findOneFacilityWhere.mockResolvedValue(mockFacility);
      dropdownService.getFacilityUser.mockResolvedValue(mockFacilityUser);

      const result = await controller.getFacilityUsers(id, search, is_billing);
      expect(dropdownService.findOneFacilityWhere).toHaveBeenCalledWith({
        where: { id: id, deleted_at: IsNull() },
      });
      expect(dropdownService.getFacilityUser).toHaveBeenCalledWith(
        ['1'],
        search,
        is_billing,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Records'),
          data: mockFacilityUser,
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      dropdownService.findOneFacilityWhere.mockRejectedValue(error);

      const result = await controller.getFacilityUsers(id, search, is_billing);
      expect(dropdownService.findOneFacilityWhere).toHaveBeenCalledWith({
        where: { id: id, deleted_at: IsNull() },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getTimeSettingForShift', () => {
    const id = '1';
    it('should return bad request if facility not found', async () => {
      dropdownService.findOneFacilityWhere.mockResolvedValue(null);

      const result = await controller.getTimeSettingForShift(id);
      expect(dropdownService.findOneFacilityWhere).toHaveBeenCalledWith({
        where: { id: id, deleted_at: IsNull() },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility'),
          data: {},
        }),
      );
    });

    it('should return not found if record not found', async () => {
      const mockFacility = new Facility();

      dropdownService.findOneFacilityWhere.mockResolvedValue(mockFacility);
      dropdownService.getTimeSettingForShift.mockResolvedValue(null);

      const result = await controller.getTimeSettingForShift(id);
      expect(dropdownService.findOneFacilityWhere).toHaveBeenCalledWith({
        where: { id: id, deleted_at: IsNull() },
      });
      expect(dropdownService.getTimeSettingForShift).toHaveBeenCalledWith('1');
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
          data: [],
        }),
      );
    });

    it('should return time setting list', async () => {
      const mockFacility = new Facility();

      const mockSetting = [new FacilityShiftSetting()];
      dropdownService.findOneFacilityWhere.mockResolvedValue(mockFacility);
      dropdownService.getTimeSettingForShift.mockResolvedValue(mockSetting);

      const result = await controller.getTimeSettingForShift(id);
      expect(dropdownService.findOneFacilityWhere).toHaveBeenCalledWith({
        where: { id: id, deleted_at: IsNull() },
      });
      expect(dropdownService.getTimeSettingForShift).toHaveBeenCalledWith('1');
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Record'),
          data: mockSetting,
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      dropdownService.findOneFacilityWhere.mockRejectedValue(error);

      const result = await controller.getTimeSettingForShift(id);
      expect(dropdownService.findOneFacilityWhere).toHaveBeenCalledWith({
        where: { id: id, deleted_at: IsNull() },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getProviders', () => {
    const filterProviderDto = new FilterProviderDto();
    it('should return not found if not record found', async () => {
      dropdownService.getAllProvider.mockResolvedValue([]);

      const result = await controller.getProviders(filterProviderDto);
      expect(dropdownService.getAllProvider).toHaveBeenCalledWith(
        filterProviderDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
          data: [],
        }),
      );
    });

    it('should return not found if not record found', async () => {
      const mockProviders = [new Provider()];
      dropdownService.getAllProvider.mockResolvedValue(mockProviders);

      const result = await controller.getProviders(filterProviderDto);
      expect(dropdownService.getAllProvider).toHaveBeenCalledWith(
        filterProviderDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Record'),
          data: mockProviders,
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      dropdownService.getAllProvider.mockRejectedValue(error);

      const result = await controller.getProviders(filterProviderDto);
      expect(dropdownService.getAllProvider).toHaveBeenCalledWith(
        filterProviderDto,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getProvidersV2', () => {
    const req = { user: { id: '2', role: TABLE.admin } } as IRequest;
    it('should return providers list', async () => {
      const filterProviderDto = {
        search: '',
        facility_id: '123',
        filter: FILTER_PROVIDER_BY.preferred,
        speciality_id: '456',
        certificate_id: '789',
        start_date: '2024-01-01',
        start_time: '09:00',
        end_date: '2024-01-01',
        end_time: '17:00',
        dates: ['2024-01-01'],
      };

      const mockProviders = [{ id: '1', name: 'Test Provider' }];
      dropdownService.getAllProviderV3.mockResolvedValue(mockProviders);

      const result = await controller.getProvidersV2(filterProviderDto, req);
      expect(dropdownService.getAllProviderV3).toHaveBeenCalledWith(
        filterProviderDto,
        req,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Staff'),
          data: mockProviders,
        }),
      );
    });

    it('should return empty array when no providers found', async () => {
      const filterProviderDto = {
        search: '',
        facility_id: '123',
        filter: FILTER_PROVIDER_BY.preferred,
        speciality_id: '456',
        certificate_id: '789',
        start_date: '2024-01-01',
        start_time: '09:00',
        end_date: '2024-01-01',
        end_time: '17:00',
        dates: ['2024-01-01'],
      };

      dropdownService.getAllProviderV3.mockResolvedValue([]);

      const result = await controller.getProvidersV2(filterProviderDto, req);
      expect(dropdownService.getAllProviderV3).toHaveBeenCalledWith(
        filterProviderDto,
        req,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff'),
          data: [],
        }),
      );
    });

    it('should handle errors during provider search', async () => {
      const filterProviderDto = {
        search: '',
        facility_id: '123',
        filter: FILTER_PROVIDER_BY.preferred,
        speciality_id: '456',
        certificate_id: '789',
        start_date: '2024-01-01',
        start_time: '09:00',
        end_date: '2024-01-01',
        end_time: '17:00',
        dates: ['2024-01-01'],
      };

      const error = new Error('Database Error');
      dropdownService.getAllProviderV3.mockRejectedValue(error);

      const result = await controller.getProvidersV2(filterProviderDto, req);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getShiftTypes', () => {
    it('should return not found if not record found', async () => {
      dropdownService.getShiftTypes.mockResolvedValue(null);

      const result = await controller.getShiftTypes();
      expect(dropdownService.getShiftTypes).toHaveBeenCalledWith();
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift Types'),
          data: [],
        }),
      );
    });

    it('should return not found if not record found', async () => {
      const mockTypes = [new ShiftType()];
      dropdownService.getShiftTypes.mockResolvedValue(mockTypes);

      const result = await controller.getShiftTypes();
      expect(dropdownService.getShiftTypes).toHaveBeenCalledWith();
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Shift Types'),
          data: mockTypes,
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      dropdownService.getShiftTypes.mockRejectedValue(error);

      const result = await controller.getShiftTypes();
      expect(dropdownService.getShiftTypes).toHaveBeenCalledWith();
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getLineOfBusiness', () => {
    it('should return not found if not record found', async () => {
      dropdownService.getLineOfBusiness.mockResolvedValue(null);

      const result = await controller.getLineOfBusiness();
      expect(dropdownService.getLineOfBusiness).toHaveBeenCalledWith();
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Line Of Business'),
          data: [],
        }),
      );
    });

    it('should return not found if not record found', async () => {
      const mockLob = [new LineOfBusiness()];
      dropdownService.getLineOfBusiness.mockResolvedValue(mockLob);

      const result = await controller.getLineOfBusiness();
      expect(dropdownService.getLineOfBusiness).toHaveBeenCalledWith();
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Line Of Business'),
          data: mockLob,
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      dropdownService.getLineOfBusiness.mockRejectedValue(error);

      const result = await controller.getLineOfBusiness();
      expect(dropdownService.getLineOfBusiness).toHaveBeenCalledWith();
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getAllTimecardRejectReason', () => {
    it('should return not found if not record found', async () => {
      dropdownService.getAllTimecardRejectReason.mockResolvedValue(null);

      const result = await controller.getAllTimecardRejectReason();
      expect(dropdownService.getAllTimecardRejectReason).toHaveBeenCalledWith();
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Timecard Reject Reason'),
          data: [],
        }),
      );
    });

    it('should return not found if not record found', async () => {
      const mockReason = [new TimecardRejectReason()];
      dropdownService.getAllTimecardRejectReason.mockResolvedValue(mockReason);

      const result = await controller.getAllTimecardRejectReason();
      expect(dropdownService.getAllTimecardRejectReason).toHaveBeenCalledWith();
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Timecard Reject Reason'),
          data: mockReason,
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      dropdownService.getAllTimecardRejectReason.mockRejectedValue(error);

      const result = await controller.getAllTimecardRejectReason();
      expect(dropdownService.getAllTimecardRejectReason).toHaveBeenCalledWith();
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getCertificateAndSpeciality', () => {
    const filter = new FilterDropdownDto();
    it('should return not found if not record found', async () => {
      dropdownService.getFacilityCertificatesOrNull.mockResolvedValue(null);
      dropdownService.getFacilitySpecialtiesOnly.mockResolvedValue(null);

      const result = await controller.getCertificateAndSpeciality();
      expect(
        dropdownService.getFacilityCertificatesOrNull,
      ).toHaveBeenCalledWith(filter);
      expect(dropdownService.getFacilitySpecialtiesOnly).toHaveBeenCalledWith(
        filter,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('License And Speciality'),
          data: {},
        }),
      );
    });

    it('should return not found if not record found', async () => {
      const mockCertificate = [new Certificate()];
      const mockSpeciality = [new Speciality()];
      dropdownService.getFacilityCertificatesOrNull.mockResolvedValue(
        mockCertificate,
      );
      dropdownService.getFacilitySpecialtiesOnly.mockResolvedValue(
        mockSpeciality,
      );

      const result = await controller.getCertificateAndSpeciality();
      expect(
        dropdownService.getFacilityCertificatesOrNull,
      ).toHaveBeenCalledWith(filter);
      expect(dropdownService.getFacilitySpecialtiesOnly).toHaveBeenCalledWith(
        filter,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('License And Speciality'),
          data: { certificates: mockCertificate, specialities: mockSpeciality },
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      dropdownService.getFacilityCertificatesOrNull.mockRejectedValue(error);

      const result = await controller.getCertificateAndSpeciality();
      expect(
        dropdownService.getFacilityCertificatesOrNull,
      ).toHaveBeenCalledWith(filter);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getCredentials', () => {
    it('should return not found if not record found', async () => {
      dropdownService.getCompetencyTest.mockResolvedValue(null);
      dropdownService.getSkillChecklist.mockResolvedValue(null);

      const result = await controller.getCredentials();
      expect(dropdownService.getCompetencyTest).toHaveBeenCalledWith();
      expect(dropdownService.getSkillChecklist).toHaveBeenCalledWith();
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Credentials'),
          data: {},
        }),
      );
    });

    it('should return not found if not record found', async () => {
      const mockCompetencyTest = [new CompetencyTestSetting()];
      const mockSkillChecklist = [new SkillChecklistTemplate()];
      dropdownService.getCompetencyTest.mockResolvedValue(mockCompetencyTest);
      dropdownService.getSkillChecklist.mockResolvedValue(mockSkillChecklist);

      const result = await controller.getCredentials();
      expect(dropdownService.getCompetencyTest).toHaveBeenCalledWith();
      expect(dropdownService.getSkillChecklist).toHaveBeenCalledWith();
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Credentials'),
          data: {
            competency_test: mockCompetencyTest,
            skill_checklist: mockSkillChecklist,
          },
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      dropdownService.getSkillChecklist.mockRejectedValue(error);

      const result = await controller.getCredentials();
      expect(dropdownService.getSkillChecklist).toHaveBeenCalledWith();
      expect(result).toEqual(response.failureResponse(error));
    });

    it('should handle case when only some credential types are found', async () => {
      dropdownService.getCompetencyTest.mockResolvedValue([
        { id: 1, name: 'Cert1' },
      ]);
      dropdownService.getSkillChecklist.mockResolvedValue(null);
      dropdownService.getEDocs.mockResolvedValue(null);

      const result = await controller.getCredentials();
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Credentials'),
          data: {
            competency_test: [{ id: 1, name: 'Cert1' }],
            skill_checklist: null,
            e_doc: null,
          },
        }),
      );
    });
  });

  describe('getFlagList', () => {
    it('should return not found if not record found', async () => {
      dropdownService.getFlagList.mockResolvedValue(null);

      const result = await controller.getFlagList();
      expect(dropdownService.getFlagList).toHaveBeenCalledWith({
        where: { status: DEFAULT_STATUS.active },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Flags'),
          data: [],
        }),
      );
    });

    it('should return not found if not record found', async () => {
      const mockSetting = [new FlagSetting()];
      dropdownService.getFlagList.mockResolvedValue(mockSetting);

      const result = await controller.getFlagList();
      expect(dropdownService.getFlagList).toHaveBeenCalledWith({
        where: { status: DEFAULT_STATUS.active },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Flags'),
          data: mockSetting,
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      dropdownService.getFlagList.mockRejectedValue(error);

      const result = await controller.getFlagList();
      expect(dropdownService.getFlagList).toHaveBeenCalledWith({
        where: { status: DEFAULT_STATUS.active },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getDNRReason', () => {
    const reason_type = DNR_TYPE.clinical;
    it('should return not found if not record found', async () => {
      dropdownService.getDNRReason.mockResolvedValue(null);

      const result = await controller.getDNRReason(reason_type);
      expect(dropdownService.getDNRReason).toHaveBeenCalledWith(reason_type);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('DNR Reason'),
          data: [],
        }),
      );
    });

    it('should return not found if not record found', async () => {
      const mockSetting = [new DnrReason()];
      dropdownService.getDNRReason.mockResolvedValue(mockSetting);

      const result = await controller.getDNRReason(reason_type);
      expect(dropdownService.getDNRReason).toHaveBeenCalledWith(reason_type);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('DNR Reason'),
          data: mockSetting,
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      dropdownService.getDNRReason.mockRejectedValue(error);

      const result = await controller.getDNRReason(reason_type);
      expect(dropdownService.getDNRReason).toHaveBeenCalledWith(reason_type);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getEDocGroups', () => {
    it('should return not found if not record found', async () => {
      dropdownService.getEDocGroups.mockResolvedValue(null);

      const result = await controller.getEDocGroups();
      expect(dropdownService.getEDocGroups).toHaveBeenCalledWith();
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('E-Doc Groups'),
          data: [],
        }),
      );
    });

    it('should return not found if not record found', async () => {
      const mockSetting = [new EDocsGroup()];
      dropdownService.getEDocGroups.mockResolvedValue(mockSetting);

      const result = await controller.getEDocGroups();
      expect(dropdownService.getEDocGroups).toHaveBeenCalledWith();
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('E-Doc Groups'),
          data: mockSetting,
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      dropdownService.getEDocGroups.mockRejectedValue(error);

      const result = await controller.getEDocGroups();
      expect(dropdownService.getEDocGroups).toHaveBeenCalledWith();
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getAllAdminUser', () => {
    const req: any = { user: { id: '1' } };
    it('error', async () => {
      const error = new Error('Database Error');
      dropdownService.getAllAdminUser.mockRejectedValue(error);

      const result = await controller.getAllAdminUser(req);

      expect(result).toEqual(response.failureResponse(error));
    });

    it('should return not found if not record found', async () => {
      const mockSetting = [new Admin()];
      dropdownService.getAllAdminUser.mockResolvedValue(mockSetting);

      const result = await controller.getAllAdminUser(req);
      expect(dropdownService.getAllAdminUser).toHaveBeenCalledWith({
        where: { status: DEFAULT_STATUS.active, id: Not(req.user.id) },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Users'),
          data: mockSetting,
        }),
      );
    });

    it('should return not found if not record found', async () => {
      const mockSetting = [];
      dropdownService.getAllAdminUser.mockResolvedValue(mockSetting);

      const result = await controller.getAllAdminUser(req);
      expect(dropdownService.getAllAdminUser).toHaveBeenCalledWith({
        where: { status: DEFAULT_STATUS.active, id: Not(req.user.id) },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Users'),
          data: mockSetting,
        }),
      );
    });
  });
});
