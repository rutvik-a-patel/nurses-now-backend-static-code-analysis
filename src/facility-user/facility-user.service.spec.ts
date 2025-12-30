import { Test, TestingModule } from '@nestjs/testing';
import { FacilityUserService } from './facility-user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FacilityUser } from './entities/facility-user.entity';
import { FacilityUserPermission } from './entities/facility-user-permission.entity';
import { FacilityPermission } from './entities/facility-permission.entity';
import { In, IsNull, Repository } from 'typeorm';
import { CreateFacilityUserDto } from './dto/create-facility-user.dto';
import { dummyEmail, dummyPassword } from '@/shared/constants/constant';
import { ENTITY_STATUS } from '@/shared/constants/enum';
import { UpdateFacilityUserDto } from './dto/update-facility-user.dto';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { Admin } from '@/admin/entities/admin.entity';

describe('FacilityUserService', () => {
  let service: FacilityUserService;
  let facilityUserRepository: any;
  let facilityUserPermissionRepository: any;
  let facilityPermissionRepository: any;

  const mockQueryBuilder: any = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    getRawMany: jest.fn(),
    getCount: jest.fn(),
    getRawOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacilityUserService,
        {
          provide: getRepositoryToken(FacilityUser),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(FacilityUserPermission),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(FacilityPermission),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Admin),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<FacilityUserService>(FacilityUserService);
    facilityUserRepository = module.get<Repository<FacilityUser>>(
      getRepositoryToken(FacilityUser),
    );
    facilityPermissionRepository = module.get<Repository<FacilityPermission>>(
      getRepositoryToken(FacilityPermission),
    );
    facilityUserPermissionRepository = module.get<
      Repository<FacilityUserPermission>
    >(getRepositoryToken(FacilityUserPermission));
    facilityUserRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new facility', async () => {
      const createFacilityUserDto: CreateFacilityUserDto = {
        first_name: 'Aftab',
        last_name: 'Arbiyani',
        email: dummyEmail,
        country_code: '+91',
        mobile_no: '85114841',
        status: ENTITY_STATUS.active,
        password: dummyPassword,
        facility_id: ['7'],
        permissions: ['f'],
      };
      const facility = new FacilityUser();

      facilityUserRepository.save.mockResolvedValue(facility);
      const result = await service.create(createFacilityUserDto);
      expect(facilityUserRepository.save).toHaveBeenCalledWith(
        createFacilityUserDto,
      );
      expect(result).toEqual(facility);
    });
  });

  describe('findOneWhere', () => {
    it('should find one facility by criteria', async () => {
      const options = { where: { email: 'test@example.com' } };
      const admin = new FacilityUser();
      facilityUserRepository.findOne.mockResolvedValue(admin);
      const result = await service.findOneWhere(options);
      expect(facilityUserRepository.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual(admin);
    });
  });

  describe('update', () => {
    it('should update an facility and return the result', async () => {
      const updateFacilityDto = new UpdateFacilityUserDto();
      const id = '1';
      const updateResult = { affected: 1 };
      const expectedDto = {
        ...updateFacilityDto,
        updated_at: expect.any(String), // Expect any string for the 'updated_at', or mock Date to control output
      };

      facilityUserRepository.update.mockResolvedValue(updateResult);

      const result = await service.update(id, updateFacilityDto);

      expect(facilityUserRepository.update).toHaveBeenCalledWith(
        id,
        expectedDto,
      );
      expect(result).toEqual(updateResult);
    });
  });

  describe('updateWhere', () => {
    it('should update multiple facility based on a condition', async () => {
      const where = { email: 'update@example.com' };
      const updateFacilityDto = new UpdateFacilityUserDto();
      const updateResult = { affected: 3 };
      facilityUserRepository.update.mockResolvedValue(updateResult);
      const result = await service.updateWhere(where, updateFacilityDto);
      expect(facilityUserRepository.update).toHaveBeenCalledWith(
        where,
        updateFacilityDto,
      );
      expect(result).toEqual(updateResult);
    });
  });

  describe('getAllFacilityContacts', () => {
    it('should return all contacts based on query parameters without search', async () => {
      const queryParams = new QueryParamsDto(); // No search parameter set
      const contacts = [new FacilityUser(), new FacilityUser()]; // Ensure this matches your expected output
      const count = contacts.length;
      mockQueryBuilder.getRawMany.mockResolvedValue(contacts);
      mockQueryBuilder.getCount.mockResolvedValue(count);

      const result = await service.getAllFacilityContacts(
        'id',
        queryParams,
        'user_id',
      );

      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalled(); // Ensure 'where' was not called since no search param
      expect(result).toEqual([contacts, count]);
    });

    it('should apply search filter when search parameter is provided', async () => {
      const queryParams = new QueryParamsDto();
      queryParams.search = 'John'; // Setting a search parameter
      const contacts = [new FacilityUser(), new FacilityUser()];
      const count = contacts.length;
      const user = new FacilityUser();
      user.id = 'user_id';
      mockQueryBuilder.getRawMany.mockResolvedValue(contacts);
      mockQueryBuilder.getCount.mockResolvedValue(count);

      const result = await service.getAllFacilityContacts(
        'id',
        queryParams,
        user,
      );

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'fu.facility_id @> :id',
        {
          id: ['id'],
        },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        `(fu.first_name ILIKE :search OR fu.last_name ILIKE :search OR fu.first_name || ' ' || fu.last_name ILIKE :search OR fu.email ILIKE :search OR fu.title ILIKE :search)`,
        { search: `%${parseSearchKeyword(queryParams.search)}%` },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        `fu.id != '${user.id}'`,
      );
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
      expect(result).toEqual([contacts, count]);
    });
  });

  describe('getAllBillingContacts', () => {
    it('should return all contacts based on query parameters without search', async () => {
      const queryParams = new QueryParamsDto(); // No search parameter set
      const contacts = [new FacilityUser(), new FacilityUser()]; // Ensure this matches your expected output
      const count = contacts.length;
      mockQueryBuilder.getRawMany.mockResolvedValue(contacts);
      mockQueryBuilder.getCount.mockResolvedValue(count);

      const result = await service.getAllBillingContacts(
        'id',
        queryParams,
        new FacilityUser(),
      );

      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalled(); // Ensure 'where' was not called since no search param
      expect(result).toEqual([contacts, count]);
    });

    it('should apply search filter when search parameter is provided', async () => {
      const queryParams = new QueryParamsDto();
      queryParams.search = 'John'; // Setting a search parameter
      const contacts = [new FacilityUser(), new FacilityUser()];
      const count = contacts.length;
      mockQueryBuilder.getRawMany.mockResolvedValue(contacts);
      mockQueryBuilder.getCount.mockResolvedValue(count);
      const user = new FacilityUser();
      user.id = 'user_id';
      const result = await service.getAllBillingContacts(
        'id',
        queryParams,
        user,
      );

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'fu.facility_id @> :id',
        {
          id: ['id'],
        },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        `(fu.first_name ILIKE :search OR fu.last_name ILIKE :search OR fu.first_name || ' ' || fu.last_name ILIKE :search OR fu.email ILIKE :search OR fu.title ILIKE :search)`,
        { search: `%${parseSearchKeyword(queryParams.search)}%` },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        `fu.id != '${user.id}'`,
      );
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
      expect(result).toEqual([contacts, count]);
    });
  });

  describe('getContactProfile', () => {
    it('should return all contacts based on query parameters', async () => {
      const contact = new FacilityUser(); // Ensure this matches your expected output
      mockQueryBuilder.getRawOne.mockResolvedValue(contact);

      const result = await service.getContactProfile('id');

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(`id = :id`, {
        id: 'id',
      });
      expect(mockQueryBuilder.getRawOne).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalled(); // Ensure 'where' was not called since no search param
      expect(result).toEqual(contact);
    });
  });

  describe('getFacilityPermissions', () => {
    it('should return user permission', async () => {
      facilityPermissionRepository.find.mockResolvedValue([
        { id: '1' },
        { id: '2' },
      ]);

      const result = await service.getFacilityPermissions({
        select: {
          id: true,
        },
      });

      expect(facilityPermissionRepository.find).toHaveBeenCalledWith({
        select: {
          id: true,
        },
      });

      expect(result).toEqual([{ id: '1' }, { id: '2' }]);
    });
  });

  describe('getFacilityUserPermissions', () => {
    it('should return user permission', async () => {
      const data = [
        {
          id: '1',
          has_access: true,
          facility_permission: {
            id: '2',
            name: 'BCD',
          },
        },
        {
          id: '2',
          has_access: true,
          facility_permission: {
            id: '1',
            name: 'ADB',
          },
        },
      ];

      facilityUserPermissionRepository.find.mockResolvedValue(data);
      const result = await service.getFacilityUserPermissions('id');

      expect(facilityUserPermissionRepository.find).toHaveBeenCalledWith({
        relations: {
          facility_permission: true,
        },
        where: { facility_user: { id: 'id' } },
        select: {
          id: true,
          has_access: true,
          facility_permission: {
            id: true,
            name: true,
          },
        },
      });

      expect(result).toEqual(data);
    });
  });

  describe('addPermissions', () => {
    const data = new FacilityUser();
    data.id = '1';
    it('should save facility user permission', async () => {
      facilityUserPermissionRepository.find.mockResolvedValue([
        {
          id: '1',
          facility_permission: {
            id: '2',
          },
        },
      ]);
      facilityUserPermissionRepository.save.mockResolvedValue(
        new FacilityUserPermission(),
      );

      const result = await service.addPermissions(data, ['1', '2']);
      expect(facilityUserPermissionRepository.find).toHaveBeenCalledWith({
        where: {
          facility_user: { id: data.id },
          facility_permission: { id: In(['1', '2']) },
          deleted_at: IsNull(),
        },
        relations: {
          facility_permission: true,
        },
        select: {
          id: true,
          facility_permission: {
            id: true,
          },
        },
      });

      expect(facilityUserPermissionRepository.save).toHaveBeenCalledWith([
        {
          facility_user: data,
          facility_permission: { id: '1' },
          has_access: true,
        },
      ]);
      expect(result).toEqual(new FacilityUserPermission());
    });

    it('should save facility user permission', async () => {
      facilityUserPermissionRepository.find.mockResolvedValue([
        {
          id: '1',
          facility_permission: {
            id: '2',
          },
        },
      ]);
      facilityUserPermissionRepository.save.mockResolvedValue(
        new FacilityUserPermission(),
      );

      const result = await service.addPermissions(data, []);
      expect(facilityUserPermissionRepository.find).toHaveBeenCalledWith({
        where: {
          facility_user: { id: data.id },
          facility_permission: { id: In([]) },
          deleted_at: IsNull(),
        },
        relations: {
          facility_permission: true,
        },
        select: {
          id: true,
          facility_permission: {
            id: true,
          },
        },
      });

      expect(facilityUserPermissionRepository.save).toHaveBeenCalled();
      expect(result).toEqual(new FacilityUserPermission());
    });

    it('should save facility user permission', async () => {
      facilityUserPermissionRepository.find.mockResolvedValue([]);
      facilityUserPermissionRepository.save.mockResolvedValue(
        new FacilityUserPermission(),
      );

      const result = await service.addPermissions(data, ['1', '2']);
      expect(facilityUserPermissionRepository.find).toHaveBeenCalledWith({
        where: {
          facility_user: { id: data.id },
          facility_permission: { id: In(['1', '2']) },
          deleted_at: IsNull(),
        },
        relations: {
          facility_permission: true,
        },
        select: {
          id: true,
          facility_permission: {
            id: true,
          },
        },
      });

      expect(facilityUserPermissionRepository.save).toHaveBeenCalled();
      expect(result).toEqual(new FacilityUserPermission());
    });
  });

  describe('removePermissions', () => {
    it('should remove user permission', async () => {
      facilityUserPermissionRepository.update.mockResolvedValue({
        affected: 1,
      });

      const result = await service.removePermissions('id', ['1', '2']);
      expect(facilityUserPermissionRepository.update).toHaveBeenCalledWith(
        {
          facility_user: { id: 'id' },
          facility_permission: { id: In(['1', '2']) },
          deleted_at: IsNull(),
        },
        {
          // deleted_at_ip: deleteDto.deleted_at_ip,
          deleted_at: expect.any(String),
        },
      );

      expect(result).toEqual({
        affected: 1,
      });
    });
  });

  describe('findOnePermissionWhere', () => {
    it('should return user permission', async () => {
      facilityPermissionRepository.findOne.mockResolvedValue(
        new FacilityPermission(),
      );

      const result = await service.findOnePermissionWhere({
        select: {
          id: true,
        },
      });

      expect(facilityPermissionRepository.findOne).toHaveBeenCalledWith({
        select: {
          id: true,
        },
      });

      expect(result).toEqual(new FacilityPermission());
    });
  });
});
