jest.mock('@/shared/helpers/send-email-helper', () => ({
  __esModule: true, // This helps Jest understand that the module is an ES module
  default: jest.fn().mockResolvedValue(true), // Mocking the default export as a function
}));

import { Test, TestingModule } from '@nestjs/testing';
import { FacilityService } from './facility.service';
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { Facility } from './entities/facility.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FacilityUserPermission } from '@/facility-user/entities/facility-user-permission.entity';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { CreateFacilityUserPermissionDto } from '@/facility-user/dto/create-facility-user-permission.dto';
import { TimeEntrySetting } from './entities/time-entry-setting.entity';
import { FacilityPortalSetting } from './entities/facility-portal-setting.entity';
import { FloorDetail } from '@/floor-detail/entities/floor-detail.entity';
import { Invite } from '@/invite/entities/invite.entity';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import {
  TABLE,
  INVITE_STATUS,
  EJS_FILES,
  LINK_TYPE,
} from '@/shared/constants/enum';
import sendEmailHelper from '@/shared/helpers/send-email-helper';
import { CONSTANT } from '@/shared/constants/message';
import {
  TimeEntrySettingDto,
  FacilityPortalSettingDto,
  FloorDetailDto,
} from './dto/setup-facility.dto';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';
import { prospect } from '@/shared/constants/constant';
import { FacilityUserService } from '@/facility-user/facility-user.service';
import { FacilityShiftSetting } from '@/facility-shift-setting/entities/facility-shift-setting.entity';
import { AccountingSetting } from './entities/accounting-setting.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { ShiftCancelReason } from '@/shift-cancel-reason/entities/shift-cancel-reason.entity';
import { Token } from '@/token/entities/token.entity';
import { Activity } from '@/activity/entities/activity.entity';
import { City } from '@/city/entities/city.entity';

describe('FacilityService', () => {
  let service: FacilityService;
  let facilityRepository: any;
  let timeEntrySettingRepository: any;
  let facilityPortalSettingRepository: any;
  let inviteRepository: any;
  let floorDetailRepository: any;
  let sendEmail: any;
  let facilityUserPermissionRepository: any;
  let statusSettingRepository: any;

  beforeAll(() => {
    process.env.CRYPTO_ALGORITHM = 'your_algorithm';
    process.env.CRYPTO_KEY = 'your_crypto_key_in_hex';
    process.env.CRYPTO_IV = 'your_crypto_iv_in_hex';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacilityService,
        EncryptDecryptService,
        {
          provide: FacilityUserService,
          useValue: {
            create: jest.fn(),
            findOneWhere: jest.fn(),
            update: jest.fn(),
            getFacilityPermissions: jest.fn(),
            findOnePermissionWhere: jest.fn(),
            // add more as needed
          },
        },
        {
          provide: getRepositoryToken(Facility),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
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
          provide: getRepositoryToken(FacilityUserPermission),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TimeEntrySetting),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(FacilityPortalSetting),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(FloorDetail),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Invite),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(StatusSetting),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(FacilityShiftSetting),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AccountingSetting),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Shift),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ShiftCancelReason),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Token),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Activity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(City),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<FacilityService>(FacilityService);
    facilityRepository = module.get<Repository<Facility>>(
      getRepositoryToken(Facility),
    );

    timeEntrySettingRepository = module.get<Repository<TimeEntrySetting>>(
      getRepositoryToken(TimeEntrySetting),
    );
    facilityPortalSettingRepository = module.get<
      Repository<FacilityPortalSetting>
    >(getRepositoryToken(FacilityPortalSetting));
    floorDetailRepository = module.get<Repository<FloorDetail>>(
      getRepositoryToken(FloorDetail),
    );
    inviteRepository = module.get<Repository<Invite>>(
      getRepositoryToken(Invite),
    );
    statusSettingRepository = module.get<Repository<StatusSetting>>(
      getRepositoryToken(StatusSetting),
    );
    sendEmail = sendEmailHelper as jest.MockedFunction<typeof sendEmailHelper>;
    facilityUserPermissionRepository = module.get<
      Repository<FacilityUserPermission>
    >(getRepositoryToken(FacilityUserPermission));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new facility', async () => {
      const createDto: CreateFacilityDto = { name: 'Neurology' };
      const facility = new Facility();
      const mockSetting = new StatusSetting();

      statusSettingRepository.findOne.mockResolvedValue(mockSetting);
      facilityRepository.save.mockResolvedValue(facility);
      const result = await service.create(createDto);
      expect(statusSettingRepository.findOne).toHaveBeenCalledWith({
        where: {
          name: prospect,
        },
      });
      expect(facilityRepository.save).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(facility);
    });
  });

  describe('findOneWhere', () => {
    it('should find one facility by criteria', async () => {
      const options = { where: { email: 'test@example.com' } };
      const admin = new Facility();
      facilityRepository.findOne.mockResolvedValue(admin);
      const result = await service.findOneWhere(options);
      expect(facilityRepository.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual(admin);
    });
  });

  describe('findAll', () => {
    it('should find all facility by criteria', async () => {
      const options: FindManyOptions<Facility> = { where: { id: '1' } };
      const mockFacility = [new Facility()];
      const mockCount = mockFacility.length;
      facilityRepository.findAndCount.mockResolvedValue([
        mockFacility,
        mockCount,
      ]);
      const result = await service.findAll(options);
      expect(facilityRepository.findAndCount).toHaveBeenCalledWith(options);
      expect(result).toEqual([mockFacility, mockCount]);
    });
  });

  describe('update', () => {
    it('should update an facility and return the result', async () => {
      const updateFacilityDto = new UpdateFacilityDto();
      const id = '1';
      const updateResult = { affected: 1 };
      const expectedDto = {
        ...updateFacilityDto,
        updated_at: expect.any(String), // Expect any string for the 'updated_at', or mock Date to control output
      };

      facilityRepository.update.mockResolvedValue(updateResult);

      const result = await service.update(id, updateFacilityDto);

      expect(facilityRepository.update).toHaveBeenCalledWith(id, expectedDto);
      expect(result).toEqual(updateResult);
    });
  });

  describe('updateWhere', () => {
    it('should update multiple facility based on a condition', async () => {
      const where = { email: 'update@example.com' };
      const updateFacilityDto = new UpdateFacilityDto();
      const updateResult = { affected: 3 };
      facilityRepository.update.mockResolvedValue(updateResult);
      const result = await service.updateWhere(where, updateFacilityDto);
      expect(facilityRepository.update).toHaveBeenCalledWith(
        where,
        updateFacilityDto,
      );
      expect(result).toEqual(updateResult);
    });
  });

  describe('saveFacilityUserPermission', () => {
    it('save facility user permissions', async () => {
      const createFacilityUserPermissionDto = [
        new CreateFacilityUserPermissionDto(),
      ];

      const facilityUserPermission = new FacilityUserPermission();

      facilityUserPermissionRepository.save.mockResolvedValue(
        facilityUserPermission,
      );
      const result = await service.saveFacilityUserPermission(
        createFacilityUserPermissionDto,
      );
      expect(facilityUserPermissionRepository.save).toHaveBeenCalledWith(
        createFacilityUserPermissionDto,
      );
      expect(result).toEqual(facilityUserPermission);
    });
  });

  describe('saveTimeEntrySettings', () => {
    it('should create new time entry setting', async () => {
      const timeEntrySettingDto = new TimeEntrySettingDto();
      timeEntrySettingRepository.save.mockResolvedValue(new TimeEntrySetting());
      const result = await service.saveTimeEntrySettings(timeEntrySettingDto);
      expect(timeEntrySettingRepository.save).toHaveBeenCalledWith(
        timeEntrySettingDto,
      );
      expect(result).toEqual(new TimeEntrySetting());
    });
  });

  describe('saveFacilityPortalSettings', () => {
    it('should create new time entry setting', async () => {
      const facilityPortalSettingDto = new FacilityPortalSettingDto();
      facilityPortalSettingRepository.save.mockResolvedValue(
        new FacilityPortalSetting(),
      );
      const result = await service.saveFacilityPortalSettings(
        facilityPortalSettingDto,
      );
      expect(facilityPortalSettingRepository.save).toHaveBeenCalledWith(
        facilityPortalSettingDto,
      );
      expect(result).toEqual(new FacilityPortalSetting());
    });
  });

  describe('saveFloorDetails', () => {
    it('should create new time entry setting', async () => {
      const floorDetailDto = new FloorDetailDto();
      floorDetailRepository.save.mockResolvedValue(new FloorDetail());
      const result = await service.saveFloorDetails(floorDetailDto);
      expect(floorDetailRepository.save).toHaveBeenCalledWith(floorDetailDto);
      expect(result).toEqual(new FloorDetail());
    });
  });

  describe('deleteFloorDetails', () => {
    it('should delete time entry setting', async () => {
      const floorIds = ['1'];
      floorDetailRepository.delete.mockResolvedValue({ affected: 1 });
      await service.deleteFloorDetails(floorIds);
      expect(floorDetailRepository.delete).toHaveBeenCalledWith(floorIds);
    });
  });

  describe('updateTimeEntrySettings', () => {
    it('should create new time entry setting', async () => {
      const where: FindOptionsWhere<TimeEntrySetting> = { id: '1' };
      const timeEntrySettingDto = new TimeEntrySettingDto();
      timeEntrySettingRepository.findOne.mockResolvedValue(
        new TimeEntrySetting(),
      );
      timeEntrySettingRepository.update.mockResolvedValue({ affected: 0 });
      await service.updateTimeEntrySettings(where, timeEntrySettingDto);
      expect(timeEntrySettingRepository.update).toHaveBeenCalledWith(
        where,
        timeEntrySettingDto,
      );
      expect(timeEntrySettingRepository.findOne).toHaveBeenCalledWith({
        where,
      });
    });

    it('should create new time entry setting', async () => {
      const where: FindOptionsWhere<TimeEntrySetting> = { id: '1' };
      const timeEntrySettingDto = new TimeEntrySettingDto();
      timeEntrySettingRepository.findOne.mockResolvedValue(null);
      timeEntrySettingRepository.save.mockResolvedValue(new TimeEntrySetting());
      await service.updateTimeEntrySettings(where, timeEntrySettingDto);
      expect(timeEntrySettingRepository.save).toHaveBeenCalledWith(
        timeEntrySettingDto,
      );
      expect(timeEntrySettingRepository.findOne).toHaveBeenCalledWith({
        where,
      });
    });
  });

  describe('updateFacilityPortalSettings', () => {
    it('should create new time entry setting', async () => {
      const where: FindOptionsWhere<FacilityPortalSetting> = { id: '1' };
      const facilityPortalSettingDto = new FacilityPortalSettingDto();
      facilityPortalSettingRepository.findOne.mockResolvedValue(
        new FacilityPortalSetting(),
      );
      facilityPortalSettingRepository.update.mockResolvedValue({ affected: 0 });
      await service.updateFacilityPortalSettings(
        where,
        facilityPortalSettingDto,
      );
      expect(facilityPortalSettingRepository.findOne).toHaveBeenCalledWith({
        where,
      });
      expect(facilityPortalSettingRepository.update).toHaveBeenCalledWith(
        where,
        facilityPortalSettingDto,
      );
    });

    it('should create new time entry setting', async () => {
      const where: FindOptionsWhere<FacilityPortalSetting> = { id: '1' };
      const facilityPortalSettingDto = new FacilityPortalSettingDto();
      facilityPortalSettingRepository.findOne.mockResolvedValue(null);
      facilityPortalSettingRepository.save.mockResolvedValue(
        new FacilityPortalSetting(),
      );
      await service.updateFacilityPortalSettings(
        where,
        facilityPortalSettingDto,
      );
      expect(facilityPortalSettingRepository.findOne).toHaveBeenCalledWith({
        where,
      });
      expect(facilityPortalSettingRepository.save).toHaveBeenCalledWith(
        facilityPortalSettingDto,
      );
    });
  });

  describe('sendInvitation', () => {
    it('should send invitation successfully', async () => {
      const mockFacility = new FacilityUser();
      const type = LINK_TYPE.invitation;
      const invite = new Invite();
      invite.id = 'invite-id';
      inviteRepository.update.mockResolvedValue({ affected: 1 });
      inviteRepository.save.mockResolvedValue(invite);
      await service.sendInvitation(mockFacility);
      expect(inviteRepository.update).toHaveBeenCalledWith(
        {
          email: mockFacility.email,
          role: TABLE.facility_user,
          user_id: mockFacility.id,
          type,
        },
        {
          deleted_at: expect.any(String),
        },
      );
      expect(inviteRepository.save).toHaveBeenCalledWith({
        user_id: mockFacility.id,
        email: mockFacility.email,
        role: TABLE.facility_user,
        status: INVITE_STATUS.pending,
        type,
      });
      expect(sendEmail).toHaveBeenCalledWith({
        email: mockFacility.email,
        name: mockFacility.first_name,
        email_type: EJS_FILES.invitation,
        supportEmail: process.env.SUPPORT_EMAIL,
        authority: 'Nurses Now',
        redirectUrl: expect.any(String),
        subject: CONSTANT.EMAIL.ACCEPT_INVITE,
      });
    });
  });

  describe('isInvitationExpired', () => {
    const user = new FacilityUser();
    const table = TABLE.facility_user;
    it('should check invitation is expired or not', async () => {
      const mockInvite = new Invite();
      inviteRepository.findOne.mockResolvedValue(mockInvite);
      inviteRepository.update.mockResolvedValue({ affected: 0 });

      const result = await service.isInvitationExpired(user, table);

      expect(inviteRepository.findOne).toHaveBeenCalledWith({
        where: [
          {
            created_at: expect.any(Object),
            user_id: user.id,
            role: table,
            status: INVITE_STATUS.pending,
          },
          {
            user_id: user.id,
            role: table,
            status: INVITE_STATUS.expired,
          },
        ],
      });
      expect(inviteRepository.update).toHaveBeenCalledWith(mockInvite.id, {
        status: INVITE_STATUS.expired,
      });
      expect(result).toEqual(true);
    });

    it('should check invitation is expired or not', async () => {
      inviteRepository.findOne.mockResolvedValue(null);

      const result = await service.isInvitationExpired(user, table);

      expect(inviteRepository.findOne).toHaveBeenCalledWith({
        where: [
          {
            created_at: expect.any(Object),
            user_id: user.id,
            role: table,
            status: INVITE_STATUS.pending,
          },
          {
            user_id: user.id,
            role: table,
            status: INVITE_STATUS.expired,
          },
        ],
      });
      expect(result).toEqual(false);
    });
  });

  describe('acceptInvitation', () => {
    const user = new FacilityUser();
    const table = TABLE.facility_user;
    it('should accept invitation', async () => {
      inviteRepository.delete.mockResolvedValue({ affected: 0 });

      const result = await service.acceptInvitation(user, table);
      expect(inviteRepository.delete).toHaveBeenCalledWith({
        user_id: user.id,
        role: table,
        status: INVITE_STATUS.pending,
      });
      expect(result).toEqual(true);
    });

    it('should accept invitation', async () => {
      inviteRepository.delete.mockResolvedValue(null);

      const result = await service.acceptInvitation(user, table);
      expect(inviteRepository.delete).toHaveBeenCalledWith({
        user_id: user.id,
        role: table,
        status: INVITE_STATUS.pending,
      });
      expect(result).toEqual(false);
    });
  });

  describe('isInvitationExist', () => {
    const user = new FacilityUser();
    const table = TABLE.facility_user;
    const type = LINK_TYPE.invitation;
    it('should check invitation exist or not', async () => {
      inviteRepository.findOne.mockResolvedValue(new Invite());

      const result = await service.isInvitationExist(user, table, type);
      expect(inviteRepository.findOne).toHaveBeenCalledWith({
        where: {
          user_id: user.id,
          role: table,
          type,
        },
      });
      expect(result).toEqual(new Invite());
    });
  });
});
