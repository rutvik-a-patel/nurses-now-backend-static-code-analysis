jest.mock('@/shared/helpers/send-email-helper', () => ({
  __esModule: true, // This helps Jest understand that the module is an ES module
  default: jest.fn().mockResolvedValue(true), // Mocking the default export as a function
}));
import { Test, TestingModule } from '@nestjs/testing';
import { FacilityController } from './facility.controller';
import { FacilityService } from './facility.service';
import { Facility } from './entities/facility.entity';
import { FacilityUserService } from '@/facility-user/facility-user.service';
import { CreateFacilityUserDto } from '@/facility-user/dto/create-facility-user.dto';
import { ENTITY_STATUS, ORIENTATION_TYPE } from '@/shared/constants/enum';
import { CONSTANT } from '@/shared/constants/message';
import {
  active,
  dummyPassword,
  in_active,
  prospect,
} from '@/shared/constants/constant';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import response from '@/shared/response';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { UpdateFacilityUserDto } from '@/facility-user/dto/update-facility-user.dto';
import { ILike, Not } from 'typeorm';
import { CompleteProfileDto } from './dto/complete-facility-profile.dto';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { Invite } from '@/invite/entities/invite.entity';
import { FilterFacilityDto } from './dto/filter-facility.dto';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { UpdateFacilityDetailDto } from './dto/update-facility-detail.dto';
import { UpdateFacilitySettingDto } from './dto/update-facility-setting.dto';
import { AddFacilityDto } from './dto/add-facility.dto';
import {
  TimeEntrySettingDto,
  FacilityPortalSettingDto,
  SetupFacility,
} from './dto/setup-facility.dto';
import { StatusSettingService } from '@/status-setting/status-setting.service';
import { FacilityPermission } from '@/facility-user/entities/facility-permission.entity';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';
import { RejectFacilityDto } from './dto/update-facility.dto';
import { FloorDetail } from '@/floor-detail/entities/floor-detail.entity';
import { FacilityShiftSetting } from '@/facility-shift-setting/entities/facility-shift-setting.entity';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';
import { IRequest } from '@/shared/constants/types';

describe('FacilityController', () => {
  let controller: FacilityController;
  let facilityService: any;
  let facilityUserService: any;
  let encryptDecryptService: any;
  let statusSettingService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacilityController],
      providers: [
        FacilityService,
        FacilityUserService,
        {
          provide: FacilityService,
          useValue: {
            create: jest.fn(),
            findOneWhere: jest.fn(),
            update: jest.fn(),
            findAll: jest.fn(),
            saveFloorDetails: jest.fn(),
            saveTimeEntrySettings: jest.fn(),
            saveFacilityPortalSettings: jest.fn(),
            updateWhere: jest.fn(),
            updateTimeEntrySettings: jest.fn(),
            updateFacilityPortalSettings: jest.fn(),
            saveFacilityUserPermission: jest.fn(),
            isInvitationExpired: jest.fn(),
            acceptInvitation: jest.fn(),
            isInvitationExist: jest.fn(),
            sendInvitation: jest.fn(),
            deleteFloorDetails: jest.fn(),
            addContact: jest.fn(),
            setupFacility: jest.fn(),
            checkName: jest.fn(),
            getFacilityShiftSettings: jest.fn(),
            deleteOpenShifts: jest.fn(),
            logoutAllFacilityUsers: jest.fn(),
            getFacilityShiftSettingV2: jest.fn(),
            facilityActivityLog: jest.fn(),
            facilityActivityUpdateLog: jest.fn(),
            getCityByName: jest.fn(),
          },
        },
        {
          provide: EncryptDecryptService,
          useValue: {
            encrypt: jest.fn(),
            decrypt: jest.fn(),
          },
        },
        {
          provide: FacilityUserService,
          useValue: {
            findOneWhere: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            getFacilityPermissions: jest.fn(),
            findOnePermissionWhere: jest.fn(),
          },
        },
        {
          provide: StatusSettingService,
          useValue: {
            findOneWhere: jest.fn(),
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

    controller = module.get<FacilityController>(FacilityController);
    facilityService = module.get<FacilityService>(FacilityService);
    facilityUserService = module.get<FacilityUserService>(FacilityUserService);
    encryptDecryptService = module.get<EncryptDecryptService>(
      EncryptDecryptService,
    );
    statusSettingService =
      module.get<StatusSettingService>(StatusSettingService);
    // Initialize each method as a Jest mock directly
    facilityService.findOneWhere = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof facilityService.findOneWhere
    >;
    facilityService.create = jest
      .fn()
      .mockResolvedValue(new Facility()) as jest.MockedFunction<
      typeof facilityService.create
    >;
    facilityService.update = jest
      .fn()
      .mockResolvedValue({ affected: 1 }) as jest.MockedFunction<
      typeof facilityService.update
    >;
    facilityService.getAllContacts = jest
      .fn()
      .mockResolvedValue([[new Facility()], 1]) as jest.MockedFunction<
      typeof facilityService.getAllContacts
    >;
    facilityUserService.findOneWhere = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof facilityUserService.findOneWhere
    >;
    facilityUserService.create = jest
      .fn()
      .mockResolvedValue(new Facility()) as jest.MockedFunction<
      typeof facilityUserService.create
    >;
    facilityUserService.getAllFacilityContacts = jest
      .fn()
      .mockResolvedValue(new Facility()) as jest.MockedFunction<
      typeof facilityUserService.getAllFacilityContacts
    >;
    facilityUserService.getAllBillingContacts = jest
      .fn()
      .mockResolvedValue(new Facility()) as jest.MockedFunction<
      typeof facilityUserService.getAllBillingContacts
    >;
    facilityUserService.getFacilityPermissions = jest
      .fn()
      .mockResolvedValue(new Facility()) as jest.MockedFunction<
      typeof facilityUserService.getFacilityPermissions
    >;
    facilityUserService.removePermissions = jest
      .fn()
      .mockResolvedValue(new Facility()) as jest.MockedFunction<
      typeof facilityUserService.removePermissions
    >;
    facilityUserService.addPermissions = jest
      .fn()
      .mockResolvedValue(new Facility()) as jest.MockedFunction<
      typeof facilityUserService.addPermissions
    >;
    facilityUserService.update = jest
      .fn()
      .mockResolvedValue(new Facility()) as jest.MockedFunction<
      typeof facilityUserService.update
    >;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addFacilityContacts', () => {
    const createFacilityUserDto: CreateFacilityUserDto = {
      first_name: 'Aftab',
      last_name: 'Arbiyani',
      email: 'aftaba@solguruz.com',
      country_code: '+91',
      mobile_no: '8511484156',
      status: ENTITY_STATUS.active,
      password: dummyPassword,
      facility_id: ['7'],
      permissions: ['f'],
    };

    it('should give bad request if email or mobile exists', async () => {
      const facilities = new Facility();
      facilities.id = 'facility_id';
      facilities.name = 'Test Facility';
      const user = new FacilityUser();
      user.facility_id = [facilities.id];
      facilityUserService.findOneWhere.mockResolvedValue(user);
      facilityService.findOneWhere.mockResolvedValue(facilities);

      const result = await controller.addFacilityContacts(
        createFacilityUserDto,
        'facility-id',
      );

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.FACILITY_CONTACT_ALREADY_EXIST(
            facilities.name ? facilities.name : 'other facility',
          ),
          data: {},
        }),
      );
    });

    it('should create a new facility contact when valid data is provided and no existing contact is found', async () => {
      facilityUserService.findOneWhere.mockResolvedValue(null); // No existing contact
      facilityService.addContact.mockResolvedValue(createFacilityUserDto); // Mock addContact

      const result = await controller.addFacilityContacts(
        createFacilityUserDto,
        'facility-id',
      );

      expect(facilityUserService.findOneWhere).toHaveBeenCalledWith({
        where: [
          { email: createFacilityUserDto.email },
          {
            country_code: createFacilityUserDto.country_code,
            mobile_no: createFacilityUserDto.mobile_no,
          },
        ],
      });
      expect(facilityService.addContact).toHaveBeenCalledWith(
        createFacilityUserDto,
        'facility-id',
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.ADDED_TO_CONTACTS(
            createFacilityUserDto.first_name +
              ' ' +
              createFacilityUserDto.last_name,
          ),
          data: createFacilityUserDto,
        }),
      );
    });

    it('should handle errors during the contact creation process', async () => {
      const errorMessage = 'Error creating contact';
      facilityUserService.findOneWhere.mockRejectedValue(
        new Error(errorMessage),
      ); // Simulate an error

      const result = await controller.addFacilityContacts(
        createFacilityUserDto,
        'facility-id',
      );

      expect(facilityUserService.findOneWhere).toHaveBeenCalled();
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('getAllFacilityContacts', () => {
    const queryParamsDto: QueryParamsDto = {
      limit: '10',
      offset: '0',
      search: 'John',
      order: { created_at: 'DESC' },
    };
    const req: any = { user: { id: 'user-id' } };

    it('should return paginated contact list successfully', async () => {
      const mockContacts = Array(10).fill(new FacilityUser());
      const mockCount = 10;
      facilityUserService.getAllFacilityContacts.mockResolvedValue([
        mockContacts,
        mockCount,
      ]);

      const result = await controller.getAllFacilityContacts(
        '1',
        queryParamsDto,
        req,
      );

      expect(facilityUserService.getAllFacilityContacts).toHaveBeenCalledWith(
        '1',
        queryParamsDto,
        req.user,
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Facility Contact'),
          total: mockCount,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: mockContacts,
        }),
      );
    });

    it('should return no contacts found when list is empty', async () => {
      facilityUserService.getAllFacilityContacts.mockResolvedValue([[], 0]);

      const result = await controller.getAllFacilityContacts(
        '1',
        queryParamsDto,
        req,
      );

      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facility Contact'),
          total: 0,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: [],
        }),
      );
    });

    it('should handle errors when fetching contacts fails', async () => {
      const errorMessage = 'Database error';
      facilityUserService.getAllFacilityContacts.mockRejectedValue(
        new Error(errorMessage),
      );

      const result = await controller.getAllFacilityContacts(
        '1',
        queryParamsDto,
        req,
      );

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('getAllBillingContacts', () => {
    const queryParamsDto: QueryParamsDto = {
      limit: '10',
      offset: '0',
      search: 'John',
      order: { created_at: 'DESC' },
    };
    const req: any = { user: { id: 'user-id' } };

    it('should return paginated contact list successfully', async () => {
      const mockContacts = Array(10).fill(new FacilityUser());
      const mockCount = 10;
      facilityUserService.getAllBillingContacts.mockResolvedValue([
        mockContacts,
        mockCount,
      ]);

      const result = await controller.getAllBillingContacts(
        '1',
        queryParamsDto,
        req,
      );

      expect(facilityUserService.getAllBillingContacts).toHaveBeenCalledWith(
        '1',
        queryParamsDto,
        req.user,
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Billing Contact'),
          total: mockCount,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: mockContacts,
        }),
      );
    });

    it('should return no contacts found when list is empty', async () => {
      facilityUserService.getAllBillingContacts.mockResolvedValue([[], 0]);

      const result = await controller.getAllBillingContacts(
        '1',
        queryParamsDto,
        req,
      );

      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Billing Contact'),
          total: 0,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: [],
        }),
      );
    });

    it('should handle errors when fetching contacts fails', async () => {
      const errorMessage = 'Database error';
      facilityUserService.getAllBillingContacts.mockRejectedValue(
        new Error(errorMessage),
      );

      const result = await controller.getAllBillingContacts(
        '1',
        queryParamsDto,
        req,
      );

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('addFacility', () => {
    const addFacilityDto = new AddFacilityDto();
    addFacilityDto.master_facility_id = '1';
    addFacilityDto.email = 'james1@example.com';
    addFacilityDto.mobile_no = '4545566589';
    addFacilityDto.country_code = '+1';
    addFacilityDto.name = 'Test Facility';
    addFacilityDto.is_corporate_client = true;
    const req = {
      user: { first_name: 'Test', last_name: 'User', role: 'admin' },
    } as IRequest;

    it('should return bad request if email already exist', async () => {
      addFacilityDto.is_master = false;
      const mockExistFacility = new Facility();
      mockExistFacility.name = 'Test Facility';
      facilityService.checkName.mockResolvedValue(mockExistFacility);

      const result = await controller.addFacility(addFacilityDto, req);

      expect(facilityService.checkName).toHaveBeenCalledWith(
        addFacilityDto.name,
        addFacilityDto.mobile_no,
        addFacilityDto.email,
        addFacilityDto.is_corporate_client,
      );

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Corporate Client'),
          data: {},
        }),
      );
    });

    it('should successfully create facility when email does not exist', async () => {
      addFacilityDto.master_facility_id = '1';
      addFacilityDto.is_master = false;
      addFacilityDto.is_corporate_client = false;
      const mockFacility = new Facility();
      mockFacility.id = 'mockFacility.id';
      facilityService.create.mockResolvedValue(mockFacility);
      facilityUserService.findOneWhere.mockResolvedValue(null);
      const mockPermission = new FacilityPermission();
      facilityUserService.findOnePermissionWhere.mockResolvedValue(
        mockPermission,
      );
      const mockUser = new FacilityUser();
      // mockUser.primary_facility = mockFacility;
      facilityUserService.create.mockResolvedValue(mockUser);

      const result = await controller.addFacility(addFacilityDto, req);

      expect(facilityService.create).toHaveBeenCalledWith(
        addFacilityDto,
        false,
      );

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Facility'),
          data: mockFacility,
        }),
      );
    });

    it('should handle errors when fetching contacts fails', async () => {
      addFacilityDto.master_facility_id = null;
      const errorMessage = 'Database error';
      facilityService.create.mockRejectedValue(new Error(errorMessage));

      const result = await controller.addFacility(addFacilityDto, req);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('setupFacility', () => {
    const id = '1';
    const setupFacility = new SetupFacility();
    it('should return bad request if not found', async () => {
      facilityService.findOneWhere.mockResolvedValue(null);

      const result = await controller.setupFacility(id, setupFacility);
      expect(facilityService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id,
        },
        relations: {
          facility_portal_setting: true,
          time_entry_setting: true,
          floor_detail: true,
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility'),
          data: {},
        }),
      );
    });

    it('should setup facility successfully', async () => {
      // Setup a mock facility with floor_detail so deleteFloorDetails is called
      const mockFacility = new Facility();
      mockFacility.id = id;
      mockFacility.floor_detail = [new FloorDetail()];
      facilityService.findOneWhere.mockResolvedValue(mockFacility);
      facilityService.setupFacility = jest.fn().mockResolvedValue(undefined);

      const result = await controller.setupFacility(id, setupFacility);

      expect(facilityService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id,
        },
        relations: {
          facility_portal_setting: true,
          time_entry_setting: true,
          floor_detail: true,
        },
      });
      expect(facilityService.setupFacility).toHaveBeenCalledWith(
        setupFacility,
        mockFacility,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Facility Setup'),
          data: {},
        }),
      );
    });
    it('should handle errors when fetching contacts fails', async () => {
      const errorMessage = 'Database error';
      facilityService.findOneWhere.mockRejectedValue(new Error(errorMessage));

      const result = await controller.setupFacility(id, setupFacility);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('editFacility', () => {
    const id = '1';
    const req = {
      user: { first_name: 'Test', last_name: 'User', role: 'admin' },
    } as IRequest;
    const updateFacilityDto = new UpdateFacilityDetailDto();
    updateFacilityDto.status = '2';
    const statusActive = new StatusSetting();
    statusActive.id = '1';
    it('should return record not found', async () => {
      facilityService.findOneWhere.mockResolvedValue(null);

      const result = await controller.editFacility(id, updateFacilityDto, req);
      expect(facilityService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility'),
          data: {},
        }),
      );
    });

    it('should update facility data', async () => {
      facilityService.findOneWhere.mockResolvedValue(new Facility());
      facilityService.update.mockResolvedValue({ affected: 0 });
      statusSettingService.findOneWhere.mockResolvedValue(statusActive);

      const result = await controller.editFacility(id, updateFacilityDto, req);
      expect(facilityService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(facilityService.update).toHaveBeenCalledWith(
        id,
        updateFacilityDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility'),
          data: {},
        }),
      );
    });

    it('should update facility data', async () => {
      facilityService.findOneWhere.mockResolvedValue(new Facility());
      facilityService.update.mockResolvedValue({ affected: 1 });
      statusSettingService.findOneWhere.mockResolvedValue(statusActive);

      const result = await controller.editFacility(id, updateFacilityDto, req);
      expect(facilityService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(facilityService.update).toHaveBeenCalledWith(
        id,
        updateFacilityDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Facility Detail'),
          data: {},
        }),
      );
    });

    it('should handle errors when fetching contacts fails', async () => {
      const errorMessage = 'Database error';
      facilityService.findOneWhere.mockRejectedValue(new Error(errorMessage));

      const result = await controller.editFacility(id, updateFacilityDto, req);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('getFacilitySetting', () => {
    const id = '1';
    it('should return record not found', async () => {
      facilityService.findOneWhere.mockResolvedValue(null);

      const result = await controller.getFacilitySetting(id);
      expect(facilityService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
        relations: {
          facility_portal_setting: true,
          time_entry_setting: true,
          shift_setting: true,
        },
        select: {
          id: true,
          work_comp_code: true,
          latitude: true,
          longitude: true,
          street_address: true,
          house_no: true,
          state: true,
          city: true,
          zip_code: true,
          shift_setting: {
            id: true,
            start_time: true,
            end_time: true,
            name: true,
            is_default: true,
            status: true,
            shift_time_id: true,
          },
          time_entry_setting: {
            id: true,
            timecard_rounding: true,
            timecard_rounding_direction: true,
            default_lunch_duration: true,
            time_approval_method: true,
            allowed_entries: true,
            check_missed_meal_break: true,
            location: true,
          },
          facility_portal_setting: {
            id: true,
            allow_cancellation: true,
            cancellation_advance: true,
            scheduling_warnings: true,
            client_confirmation: true,
          },
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility'),
          data: {},
        }),
      );
    });

    it('should return data if found', async () => {
      const facility = new Facility();
      facility.shift_setting = [new FacilityShiftSetting()];
      facilityService.findOneWhere.mockResolvedValue(facility);

      const result = await controller.getFacilitySetting(id);
      expect(facilityService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
        relations: {
          facility_portal_setting: true,
          time_entry_setting: true,
          shift_setting: true,
        },
        select: {
          id: true,
          work_comp_code: true,
          latitude: true,
          longitude: true,
          street_address: true,
          house_no: true,
          state: true,
          city: true,
          zip_code: true,
          shift_setting: {
            id: true,
            start_time: true,
            end_time: true,
            name: true,
            is_default: true,
            status: true,
            shift_time_id: true,
          },
          time_entry_setting: {
            id: true,
            timecard_rounding: true,
            timecard_rounding_direction: true,
            default_lunch_duration: true,
            time_approval_method: true,
            allowed_entries: true,
            check_missed_meal_break: true,
            location: true,
          },
          facility_portal_setting: {
            id: true,
            allow_cancellation: true,
            cancellation_advance: true,
            scheduling_warnings: true,
            client_confirmation: true,
          },
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Facility Setting'),
          data: facility,
        }),
      );
    });

    it('should handle errors when fetching contacts fails', async () => {
      const errorMessage = 'Database error';
      facilityService.findOneWhere.mockRejectedValue(new Error(errorMessage));

      const result = await controller.getFacilitySetting(id);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('updateFacilitySetting', () => {
    const id = '1';
    const req = {
      user: { first_name: 'Test', last_name: 'User', role: 'admin' },
    } as IRequest;
    const updateFacilitySettingDto = new UpdateFacilitySettingDto();
    it('should return bad request if email already exist', async () => {
      facilityService.findOneWhere.mockResolvedValue(null);

      const result = await controller.updateFacilitySetting(
        id,
        updateFacilitySettingDto,
        req,
      );
      expect(facilityService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id,
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility'),
          data: {},
        }),
      );
    });

    it('should return bad request if email already exist', async () => {
      updateFacilitySettingDto.time_entry_setting = new TimeEntrySettingDto();
      updateFacilitySettingDto.facility_portal_setting =
        new FacilityPortalSettingDto();
      const { time_entry_setting, facility_portal_setting, ...dto } =
        updateFacilitySettingDto;
      const mockFacility = new Facility();
      const mockFacility1 = new Facility();
      facilityService.findOneWhere.mockResolvedValue(mockFacility);
      facilityService.getFacilityShiftSettingV2.mockResolvedValue(mockFacility);
      facilityService.updateWhere.mockResolvedValue({ affected: 0 });
      facilityService.getFacilityShiftSettingV2.mockResolvedValue(
        mockFacility1,
      );
      const result = await controller.updateFacilitySetting(
        id,
        updateFacilitySettingDto,
        req,
      );
      expect(facilityService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id,
        },
      });
      expect(facilityService.updateWhere).toHaveBeenCalledWith({ id }, dto);
      expect(facilityService.updateTimeEntrySettings).toHaveBeenCalledWith(
        { facility: { id } },
        time_entry_setting,
      );
      expect(facilityService.updateFacilityPortalSettings).toHaveBeenCalledWith(
        { facility: { id } },
        facility_portal_setting,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility Setting'),
          data: {},
        }),
      );
    });

    it('should return bad request if email already exist', async () => {
      updateFacilitySettingDto.time_entry_setting = new TimeEntrySettingDto();
      updateFacilitySettingDto.facility_portal_setting =
        new FacilityPortalSettingDto();
      const { time_entry_setting, facility_portal_setting, ...dto } =
        updateFacilitySettingDto;
      const mockFacility = new Facility();
      const mockFacility1 = new Facility();
      facilityService.findOneWhere.mockResolvedValue(mockFacility);
      facilityService.getFacilityShiftSettingV2.mockResolvedValue(mockFacility);
      facilityService.updateWhere.mockResolvedValue({ affected: 1 });
      facilityService.getFacilityShiftSettingV2.mockResolvedValue(
        mockFacility1,
      );
      const result = await controller.updateFacilitySetting(
        id,
        updateFacilitySettingDto,
        req,
      );
      expect(facilityService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id,
        },
      });
      expect(facilityService.getFacilityShiftSettingV2).toHaveBeenCalledWith(
        id,
      );
      expect(facilityService.updateWhere).toHaveBeenCalledWith({ id }, dto);
      expect(facilityService.updateTimeEntrySettings).toHaveBeenCalledWith(
        { facility: { id } },
        time_entry_setting,
      );
      expect(facilityService.updateFacilityPortalSettings).toHaveBeenCalledWith(
        { facility: { id } },
        facility_portal_setting,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Facility Setting'),
          data: {},
        }),
      );
    });

    it('should handle errors when fetching contacts fails', async () => {
      const errorMessage = 'Database error';
      facilityService.findOneWhere.mockRejectedValue(new Error(errorMessage));

      const result = await controller.updateFacilitySetting(
        id,
        updateFacilitySettingDto,
        req,
      );

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('updateContactProfile', () => {
    const id = '1';
    const updateFacilityUserDto: UpdateFacilityUserDto = {
      first_name: 'Aftab',
      last_name: 'Arbiyani',
      email: 'aftaba@solguruz.com',
      country_code: '+91',
      mobile_no: '85114841',
      status: ENTITY_STATUS.active,
      password: dummyPassword,
      facility_id: ['7'],
      permissions: ['1', '2', '3'],
    };

    it('should return bad request if user not found', async () => {
      facilityUserService.findOneWhere.mockResolvedValue(null); // No user found

      const result = await controller.updateContactProfile(
        id,
        updateFacilityUserDto,
      );

      expect(facilityUserService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Record'),
          data: {},
        }),
      );
    });

    it('should successfully update the contact if no duplicates are found', async () => {
      const id = '1';

      // Mock the user found in the database
      facilityUserService.findOneWhere.mockResolvedValueOnce({
        id,
        email: 'john@example.com',
        mobile_no: '1234567890',
      });

      // Mock no duplicates found
      facilityUserService.findOneWhere.mockResolvedValueOnce(null);

      // Mock existing permissions
      facilityUserService.getFacilityPermissions.mockResolvedValue([
        { id: '1' },
      ]);

      // Mock the update to be successful
      facilityUserService.update.mockResolvedValue({ affected: 1 });

      // Call the controller method
      const result = await controller.updateContactProfile(
        id,
        updateFacilityUserDto,
      );

      // Assertions
      expect(facilityUserService.findOneWhere).toHaveBeenCalledTimes(2); // Called twice
      expect(facilityUserService.update).toHaveBeenCalledWith(
        id,
        updateFacilityUserDto,
      );
      expect(facilityUserService.getFacilityPermissions).toHaveBeenCalledWith({
        select: { id: true },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Contact'),
          data: {},
        }),
      );
    });

    it('should successfully update the contact if no duplicates are found', async () => {
      const id = '1';
      updateFacilityUserDto.permissions = ['1', '2', '3'];
      // Mock the user found in the database
      facilityUserService.findOneWhere.mockResolvedValueOnce({
        id,
        email: 'john@example.com',
        mobile_no: '1234567890',
      });

      // Mock no duplicates found
      facilityUserService.findOneWhere.mockResolvedValueOnce(null);

      facilityUserService.update.mockResolvedValue({ affected: 1 });
      // Mock existing permissions
      facilityUserService.getFacilityPermissions.mockResolvedValue([]);

      // Mock the update to be successful

      // Call the controller method
      const result = await controller.updateContactProfile(
        id,
        updateFacilityUserDto,
      );

      // Assertions
      expect(facilityUserService.findOneWhere).toHaveBeenCalledTimes(2); // Called twice
      expect(facilityUserService.update).toHaveBeenCalledWith(
        id,
        updateFacilityUserDto,
      );
      expect(facilityUserService.getFacilityPermissions).toHaveBeenCalledWith({
        select: { id: true },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Contact'),
          data: {},
        }),
      );
    });

    it('should return a bad request if updated email or mobile number already exists', async () => {
      facilityUserService.findOneWhere
        .mockResolvedValueOnce({
          id,
          email: 'john@example.com',
          mobile_no: '1234567890',
        }) // User exists
        .mockResolvedValueOnce(true); // Duplicate found

      const result = await controller.updateContactProfile(
        id,
        updateFacilityUserDto,
      );

      expect(facilityUserService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(facilityUserService.findOneWhere).toHaveBeenNthCalledWith(2, {
        where: [
          { email: updateFacilityUserDto.email, id: Not(id) },
          {
            country_code: updateFacilityUserDto.country_code,
            mobile_no: updateFacilityUserDto.mobile_no,
            id: Not(id),
          },
        ],
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.EMAIL_OR_MOBILE_ALREADY_EXIST,
          data: {},
        }),
      );
    });

    it('should return a not found response if no records are updated', async () => {
      facilityUserService.findOneWhere
        .mockResolvedValueOnce({
          id,
          email: 'john@example.com',
          mobile_no: '1234567890',
        }) // User exists
        .mockResolvedValueOnce(null); // No duplicates

      facilityUserService.update.mockResolvedValue({ affected: 0 }); // No records updated

      const result = await controller.updateContactProfile(
        id,
        updateFacilityUserDto,
      );

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Contact'),
          data: {},
        }),
      );
    });

    it('should return a bad request if updated email or mobile number already exists', async () => {
      updateFacilityUserDto.email = null;
      updateFacilityUserDto.country_code = null;
      updateFacilityUserDto.mobile_no = null;

      facilityUserService.findOneWhere.mockResolvedValueOnce({
        id,
        email: 'john@example.com',
        mobile_no: '1234567890',
      });

      const result = await controller.updateContactProfile(
        id,
        updateFacilityUserDto,
      );

      expect(facilityUserService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Contact'),
          data: {},
        }),
      );
    });

    it('should handle errors during the update process', async () => {
      const req = { user: { id: 'user-id' } }; // Simulate an authenticated user
      const errorMessage = 'Error updating profile';

      // Simulate the user existing and no duplicates
      facilityUserService.findOneWhere
        .mockResolvedValueOnce({
          id: req.user.id,
          email: 'existing@example.com',
          mobile_no: '1234567890',
        }) // User exists
        .mockResolvedValueOnce(null); // No duplicate email or mobile

      // Simulate an error in the update process
      facilityUserService.update.mockRejectedValue(new Error(errorMessage));

      // Corrected to use 'updateContactProfile' instead of 'editMyProfile'
      const result = await controller.updateContactProfile(
        req.user.id,
        updateFacilityUserDto,
      );

      // Ensure the correct failure response is expected
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('completeProfile', () => {
    const completeProfileDto = new CompleteProfileDto();

    it('should return bad request if facility not found', async () => {
      facilityService.findOneWhere.mockResolvedValue(null);
      facilityService.isInvitationExist.mockResolvedValue(new Invite());

      const result = await controller.completeProfile('id', completeProfileDto);

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility'),
          data: {},
        }),
      );
    });

    it('should update facility if found', async () => {
      const facility = new Facility();
      completeProfileDto.image = 'image.png';
      encryptDecryptService.decrypt.mockResolvedValue('id');
      facilityService.findOneWhere.mockResolvedValue(facility);
      facilityService.isInvitationExist.mockResolvedValue(new Invite());
      facilityService.isInvitationExpired.mockResolvedValue(false);
      facilityService.update.mockResolvedValue({ affected: 1 });
      const result = await controller.completeProfile(
        'encrypted-id',
        completeProfileDto,
      );

      expect(facilityService.findOneWhere).toHaveBeenCalledWith({
        where: { id: 'id' },
      });

      expect(facilityService.update).toHaveBeenCalledWith(
        facility.id,
        completeProfileDto,
      );

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Facility'),
          data: {},
        }),
      );
    });

    it('should update facility if found', async () => {
      const facility = new Facility();
      completeProfileDto.image = 'image.png';
      encryptDecryptService.decrypt.mockResolvedValue('id');
      facilityService.findOneWhere.mockResolvedValue(facility);
      facilityService.isInvitationExist.mockResolvedValue(new Invite());
      facilityService.isInvitationExpired.mockResolvedValue(false);
      facilityService.update.mockResolvedValue({ affected: 0 });
      const result = await controller.completeProfile(
        'encrypted-id',
        completeProfileDto,
      );

      expect(facilityService.findOneWhere).toHaveBeenCalledWith({
        where: { id: 'id' },
      });

      expect(facilityService.update).toHaveBeenCalledWith(
        facility.id,
        completeProfileDto,
      );

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facility'),
          data: {},
        }),
      );
    });

    it('should return bad request if url expired', async () => {
      const facility = new Facility();
      encryptDecryptService.decrypt.mockResolvedValue('id');
      facilityService.findOneWhere.mockResolvedValue(facility);
      facilityService.isInvitationExist.mockResolvedValue(null);
      facilityService.isInvitationExpired.mockResolvedValue(true);
      const result = await controller.completeProfile(
        'encrypted-id',
        completeProfileDto,
      );

      expect(facilityService.findOneWhere).toHaveBeenCalledWith({
        where: { id: 'id' },
      });

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.URL_EXPIRED,
          data: {},
        }),
      );
    });

    it('should handle errors during the update process', async () => {
      const errorMessage = 'Error updating profile';
      // Simulate the user existing and no duplicates
      facilityService.findOneWhere.mockRejectedValue(new Error(errorMessage));

      const result = await controller.completeProfile(
        'encrypted-id',
        completeProfileDto,
      );
      // Ensure the correct failure response is expected
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('getAllVerification', () => {
    const queryParamsDto = new FilterFacilityDto();

    it('should return paginated facility list successfully', async () => {
      queryParamsDto.search = 'test';
      queryParamsDto.type = 'test';
      const mockFacilities = Array(10).fill(new Facility());
      const mockCount = 10;
      facilityService.findAll.mockResolvedValue([mockFacilities, mockCount]);

      const result = await controller.getAllVerification(queryParamsDto);

      expect(facilityService.findAll).toHaveBeenCalledWith({
        where: {
          status: {
            name: prospect,
          },
          name: ILike(`%${parseSearchKeyword(queryParamsDto.search)}%`),
          facility_type: {
            name: ILike(`%${parseSearchKeyword(queryParamsDto.type)}%`),
          },
        },
        relations: {
          status: true,
          facility_type: true,
        },
        select: {
          id: true,
          name: true,
          country_code: true,
          mobile_no: true,
          street_address: true,
          house_no: true,
          state: true,
          city: true,
          country: true,
          facility_type: {
            id: true,
            name: true,
            work_comp_code: true,
          },
          total_beds: true,
          email: true,
          base_url: true,
          image: true,
          created_at: true,
          updated_at: true,
          status: {
            id: true,
            name: true,
            background_color: true,
            text_color: true,
          },
        },
        take: +queryParamsDto.limit,
        skip: +queryParamsDto.offset,
        order: queryParamsDto.order,
      });
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Facility'),
          total: mockCount,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: mockFacilities,
        }),
      );
    });

    it('should return no facilities found when list is empty', async () => {
      facilityService.findAll.mockResolvedValue([[], 0]);

      const result = await controller.getAllVerification(queryParamsDto);

      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facility'),
          total: 0,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: [],
        }),
      );
    });

    it('should handle errors when fetching contacts fails', async () => {
      const errorMessage = 'Database error';
      facilityService.findAll.mockRejectedValue(new Error(errorMessage));

      const result = await controller.getAllVerification(queryParamsDto);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('approveFacility', () => {
    const id = '1';
    it('should return bad request if data not found', async () => {
      facilityService.findOneWhere.mockResolvedValue(null);

      const result = await controller.approveFacility(id);
      expect(facilityService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility'),
          data: {},
        }),
      );
    });

    it('should return bad request if orientation pending', async () => {
      facilityService.findOneWhere.mockResolvedValue(new Facility());

      const result = await controller.approveFacility(id);
      expect(facilityService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.FACILITY_ORIENTATION_PENDING,
          data: {},
        }),
      );
    });

    it('should return not found if data not updated', async () => {
      const mockFacility = new Facility();
      mockFacility.orientation_process = ORIENTATION_TYPE.orientation_shift;
      mockFacility.certificate = ['1'];
      mockFacility.speciality = ['1'];

      const mockSetting = new StatusSetting();
      mockSetting.id = '1';

      facilityService.findOneWhere.mockResolvedValue(mockFacility);
      statusSettingService.findOneWhere.mockResolvedValue(mockSetting);
      facilityService.updateWhere.mockResolvedValue({ affected: 0 });

      const result = await controller.approveFacility(id);
      expect(facilityService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(statusSettingService.findOneWhere).toHaveBeenCalledWith({
        where: {
          name: active,
        },
      });
      expect(facilityService.updateWhere).toHaveBeenCalledWith(
        { id },
        { status: mockSetting.id },
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility'),
          data: {},
        }),
      );
    });

    it('should approved facility', async () => {
      const mockFacility = new Facility();
      mockFacility.orientation_process = ORIENTATION_TYPE.orientation_shift;
      mockFacility.certificate = ['1'];
      mockFacility.speciality = ['1'];

      const mockSetting = new StatusSetting();
      mockSetting.id = '1';

      facilityService.findOneWhere.mockResolvedValue(mockFacility);
      statusSettingService.findOneWhere.mockResolvedValue(mockSetting);
      facilityService.updateWhere.mockResolvedValue({ affected: 1 });

      const result = await controller.approveFacility(id);
      expect(facilityService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(statusSettingService.findOneWhere).toHaveBeenCalledWith({
        where: {
          name: active,
        },
      });
      expect(facilityService.updateWhere).toHaveBeenCalledWith(
        { id },
        { status: mockSetting.id },
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Facility Approved'),
          data: {},
        }),
      );
    });

    it('should handle failure case', async () => {
      const error = new Error('error');
      facilityService.findOneWhere.mockRejectedValue(error);

      const result = await controller.approveFacility(id);
      expect(facilityService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('rejectFacility', () => {
    const id = '1';
    const rejectFacilityDto = new RejectFacilityDto();
    it('should return bad request if data not found', async () => {
      facilityService.findOneWhere.mockResolvedValue(null);

      const result = await controller.rejectFacility(id, rejectFacilityDto);
      expect(facilityService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility'),
          data: {},
        }),
      );
    });

    it('should return not found if data not updated', async () => {
      const mockFacility = new Facility();

      const mockSetting = new StatusSetting();
      mockSetting.id = '1';

      facilityService.findOneWhere.mockResolvedValue(mockFacility);
      statusSettingService.findOneWhere.mockResolvedValue(mockSetting);
      facilityService.updateWhere.mockResolvedValue({ affected: 0 });

      const result = await controller.rejectFacility(id, rejectFacilityDto);
      expect(facilityService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(statusSettingService.findOneWhere).toHaveBeenCalledWith({
        where: {
          name: in_active,
        },
      });
      expect(facilityService.updateWhere).toHaveBeenCalledWith(
        { id },
        { ...rejectFacilityDto },
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility'),
          data: {},
        }),
      );
    });

    it('should approved facility', async () => {
      const mockFacility = new Facility();

      const mockSetting = new StatusSetting();
      mockSetting.id = '1';

      facilityService.findOneWhere.mockResolvedValue(mockFacility);
      statusSettingService.findOneWhere.mockResolvedValue(mockSetting);
      facilityService.updateWhere.mockResolvedValue({ affected: 1 });

      const result = await controller.rejectFacility(id, rejectFacilityDto);
      expect(facilityService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(statusSettingService.findOneWhere).toHaveBeenCalledWith({
        where: {
          name: in_active,
        },
      });
      expect(facilityService.updateWhere).toHaveBeenCalledWith(
        { id },
        { status: mockSetting.id },
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Facility Rejected'),
          data: {},
        }),
      );
    });

    it('should handle failure case', async () => {
      const error = new Error('error');
      facilityService.findOneWhere.mockRejectedValue(error);

      const result = await controller.rejectFacility(id, rejectFacilityDto);
      expect(facilityService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
