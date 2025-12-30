jest.mock('@/shared/helpers/send-email-helper', () => ({
  __esModule: true, // This helps Jest understand that the module is an ES module
  default: jest.fn().mockResolvedValue(true), // Mocking the default export as a function
}));

import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { Facility } from '@/facility/entities/facility.entity';
import { FilterFacilityDto } from './dto/filter-facility.dto';
import { Invite } from '@/invite/entities/invite.entity';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import sendEmailHelper from '@/shared/helpers/send-email-helper';
import {
  DEFAULT_STATUS,
  EJS_FILES,
  INVITE_STATUS,
  LINK_TYPE,
  TABLE,
} from '@/shared/constants/enum';
import { CONSTANT } from '@/shared/constants/message';
import { Activity } from '@/activity/entities/activity.entity';

describe('AdminService', () => {
  let service: AdminService;
  let adminRepository: any;
  let facilityRepository: any;
  let inviteRepository: any;
  let sendEmail: any;
  let encryptDecryptService: any;

  beforeAll(() => {
    process.env.CRYPTO_ALGORITHM = 'your_algorithm';
    process.env.CRYPTO_KEY = 'your_crypto_key_in_hex';
    process.env.CRYPTO_IV = 'your_crypto_iv_in_hex';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Admin),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              addOrderBy: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              offset: jest.fn().mockReturnThis(),
              getManyAndCount: jest.fn().mockResolvedValue([[new Admin()], 1]),
            })),
          },
        },
        {
          provide: getRepositoryToken(Facility),
          useValue: {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              addOrderBy: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              offset: jest.fn().mockReturnThis(),
              getManyAndCount: jest
                .fn()
                .mockResolvedValue([[new Facility()], 1]),
            })),
          },
        },
        {
          provide: getRepositoryToken(Invite),
          useValue: {
            save: jest.fn(),
            update: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: EncryptDecryptService,
          useValue: {
            encrypt: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Activity),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    encryptDecryptService = module.get<EncryptDecryptService>(
      EncryptDecryptService,
    );
    adminRepository = module.get<Repository<Admin>>(getRepositoryToken(Admin));
    facilityRepository = module.get<Repository<Facility>>(
      getRepositoryToken(Facility),
    );
    inviteRepository = module.get<Repository<Invite>>(
      getRepositoryToken(Invite),
    );
    sendEmail = sendEmailHelper as jest.MockedFunction<typeof sendEmailHelper>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a new admin', async () => {
      const createAdminDto = new CreateAdminDto();
      const admin = new Admin();
      adminRepository.save.mockResolvedValue(admin);
      const result = await service.create(createAdminDto);
      expect(adminRepository.save).toHaveBeenCalledWith(createAdminDto);
      expect(result).toEqual(admin);
    });
  });

  describe('findOneWhere', () => {
    it('should find one admin by criteria', async () => {
      const options = { where: { email: 'test@example.com' } };
      const admin = new Admin();
      adminRepository.findOne.mockResolvedValue(admin);
      const result = await service.findOneWhere(options);
      expect(adminRepository.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual(admin);
    });
  });

  describe('findAll', () => {
    it('should return a list of admins and count', async () => {
      const options = {};
      const admins = [new Admin(), new Admin()];
      const count = admins.length;
      adminRepository.findAndCount.mockResolvedValue([admins, count]);
      const result = await service.findAll(options);
      expect(adminRepository.findAndCount).toHaveBeenCalledWith(options);
      expect(result).toEqual([admins, count]);
    });
  });

  describe('update', () => {
    it('should update an admin and return the result', async () => {
      const updateAdminDto = new UpdateAdminDto();
      const id = '1';
      const updateResult = { affected: 1 };
      const expectedDto = {
        ...updateAdminDto,
        updated_at: expect.any(String), // Expect any string for the 'updated_at', or mock Date to control output
      };

      adminRepository.update.mockResolvedValue(updateResult);

      const result = await service.update(id, updateAdminDto);

      expect(adminRepository.update).toHaveBeenCalledWith(id, expectedDto);
      expect(result).toEqual(updateResult);
    });
  });

  describe('getAllContacts', () => {
    let mockQueryBuilder;
    beforeEach(() => {
      mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      };

      // Setup mock for createQueryBuilder to return the mock query builder
      adminRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
    });

    it('should return all contacts based on query parameters without search', async () => {
      const queryParams = new QueryParamsDto(); // No search parameter set
      const contacts = [new Admin(), new Admin()]; // Ensure this matches your expected output
      const count = contacts.length;
      queryParams.order = { 'role.name': 'ASC' };
      mockQueryBuilder.getManyAndCount.mockResolvedValue([contacts, count]);
      // Mock adminRepository.findOne to return an Admin with hide_inactive_users
      const user = new Admin();
      user.hide_inactive_users = false;
      adminRepository.findOne.mockResolvedValue(user);

      const result = await service.getAllContacts(queryParams, 'user_id');

      expect(result).toEqual([contacts, count]);
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
      expect(mockQueryBuilder.where).not.toHaveBeenCalled(); // Ensure 'where' was not called since no search param
    });

    it('should apply search filter when search parameter is provided', async () => {
      const queryParams = new QueryParamsDto();
      queryParams.search = 'John'; // Setting a search parameter
      const contacts = [new Admin(), new Admin()];
      const count = contacts.length;
      mockQueryBuilder.getManyAndCount.mockResolvedValue([contacts, count]);
      // Mock adminRepository.findOne to return an Admin with hide_inactive_users
      const user = new Admin();
      user.hide_inactive_users = false;
      adminRepository.findOne.mockResolvedValue(user);

      await service.getAllContacts(queryParams, 'user_id');

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        `(a.first_name ILIKE :search OR a.last_name ILIKE :search OR a.email ILIKE :search OR role.name ILIKE :search OR a.first_name || ' ' || a.last_name ILIKE :search)`,
        { search: `%${parseSearchKeyword(queryParams.search)}%` },
      );
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
    });
  });

  describe('getAllFacilities', () => {
    let mockQueryBuilder;
    beforeEach(() => {
      mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
        getCount: jest.fn(),
      };

      // Setup mock for createQueryBuilder to return the mock query builder
      facilityRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
    });

    it('should return all Facilities based on query parameters without search', async () => {
      const queryParams = new FilterFacilityDto(); // No search parameter set
      const facilities = [new Facility(), new Facility()]; // Ensure this matches your expected output
      const count = facilities.length;
      mockQueryBuilder.getRawMany.mockResolvedValue(facilities);
      mockQueryBuilder.getCount.mockResolvedValue(count);

      const result = await service.getAllFacilities(queryParams);

      expect(result).toEqual([facilities, count]);
      mockQueryBuilder.getRawMany.mockResolvedValue(facilities);
      mockQueryBuilder.getCount.mockResolvedValue(count);
    });

    it('should apply search filter when search parameter is provided', async () => {
      const queryParams = new FilterFacilityDto();
      queryParams.search = 'demo';
      const Facilities = [new Facility(), new Facility()];
      const count = Facilities.length;
      mockQueryBuilder.getRawMany.mockResolvedValue(Facilities);
      mockQueryBuilder.getCount.mockResolvedValue(count);

      await service.getAllFacilities(queryParams);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        `(f.name ILIKE :search OR CONCAT(f.country_code, ' ', f.mobile_no) ILIKE :search OR f.street_address ILIKE :search OR f.house_no ILIKE :search OR f.zip_code ILIKE :search)`,
        { search: `%${parseSearchKeyword(queryParams.search)}%` },
      );
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
    });

    it('should apply facility type filter when facility type parameter is provided', async () => {
      const queryParams = new FilterFacilityDto();
      queryParams.facility_type = ['uuid-of-nursing-facility-type'];
      const Facilities = [new Facility(), new Facility()];
      const count = Facilities.length;
      mockQueryBuilder.getRawMany.mockResolvedValue(Facilities);
      mockQueryBuilder.getCount.mockResolvedValue(count);

      await service.getAllFacilities(queryParams);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        `facility_type.id IN (:...facility_type)`,
        { facility_type: queryParams.facility_type },
      );
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
    });

    it('should apply status filter when status parameter is provided', async () => {
      const queryParams = new FilterFacilityDto();
      queryParams.status = [DEFAULT_STATUS.active];
      const Facilities = [new Facility(), new Facility()];
      const count = Facilities.length;
      mockQueryBuilder.getRawMany.mockResolvedValue(Facilities);
      mockQueryBuilder.getCount.mockResolvedValue(count);

      await service.getAllFacilities(queryParams);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        `status.id IN (:...status)`,
        { status: queryParams.status },
      );
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
    });

    it('should apply city filter when city parameter is provided', async () => {
      const queryParams = new FilterFacilityDto();
      queryParams.city = '1';
      const Facilities = [new Facility(), new Facility()];
      const count = Facilities.length;
      mockQueryBuilder.getRawMany.mockResolvedValue(Facilities);
      mockQueryBuilder.getCount.mockResolvedValue(count);

      await service.getAllFacilities(queryParams);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        `f.city ILIKE :city`,
        {
          city: `%${parseSearchKeyword(queryParams.city)}%`,
        },
      );
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
    });
  });

  describe('getFacilityDetails', () => {
    it('should get facility details by criteria', async () => {
      const options = {
        relations: {
          status: true,
          facility_type: true,
        },
        where: {
          id: '1',
        },
        select: {
          id: true,
          name: true,
          base_url: true,
          image: true,
          email: true,
          country_code: true,
          mobile_no: true,
          facility_type: {
            id: true,
            name: true,
            work_comp_code: true,
          },
          total_beds: true,
          street_address: true,
          house_no: true,
          zip_code: true,
          latitude: true,
          longitude: true,
          first_shift: true,
          orientation: true,
          shift_description: true,
          breaks_instruction: true,
          dress_code: true,
          parking_instruction: true,
          doors_locks: true,
          timekeeping: true,
          created_at: true,
          updated_at: true,
          is_corporate_client: true,
          general_notes: true,
          staff_note: true,
          bill_notes: true,
          website: true,
          status: {
            id: true,
            name: true,
          },
          country: true,
          state: true,
          city: true,
          employee_id: true,
          timezone: true,
          description: true,
          is_master: true,
          is_email_verified: true,
          master_facility_id: true,
        },
      };
      const facility = new Facility();
      facilityRepository.findOne.mockResolvedValue(facility);
      const result = await service.getFacilityDetails('1');
      expect(facilityRepository.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual(facility);
    });
  });

  describe('sendInvitation', () => {
    it('should send invitation successfully', async () => {
      const mockAdmin = new Admin();
      const type = LINK_TYPE.invitation;
      const invite = new Invite();
      invite.id = 'invite-id';
      inviteRepository.update.mockResolvedValue({ affected: 1 });
      inviteRepository.save.mockResolvedValue(invite);
      await service.sendInvitation(mockAdmin);
      expect(inviteRepository.update).toHaveBeenCalledWith(
        {
          email: mockAdmin.email,
          role: TABLE.admin,
          user_id: mockAdmin.id,
          type,
        },
        {
          deleted_at: expect.any(String),
        },
      );
      expect(inviteRepository.save).toHaveBeenCalledWith({
        user_id: mockAdmin.id,
        email: mockAdmin.email,
        role: TABLE.admin,
        status: INVITE_STATUS.pending,
        type,
      });
      expect(sendEmail).toHaveBeenCalledWith({
        email: mockAdmin.email,
        name: mockAdmin.first_name,
        authority: 'Nurses Now',
        email_type: EJS_FILES.invitation,
        supportEmail: process.env.SUPPORT_EMAIL,
        redirectUrl:
          process.env[`ADMIN_INVITATION_URL`] +
          `?id=${encryptDecryptService.encrypt(mockAdmin.id)}&invite_id=${invite.id}`,
        subject: CONSTANT.EMAIL.ACCEPT_INVITE,
      });
    });
  });
});
