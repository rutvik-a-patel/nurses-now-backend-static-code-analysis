jest.mock('@/shared/helpers/send-email-helper', () => ({
  __esModule: true, // This helps Jest understand that the module is an ES module
  default: jest.fn().mockResolvedValue(true), // Mocking the default export as a function
}));

jest.mock('@/shared/helpers/s3-delete-file', () => ({
  __esModule: true, // This helps Jest understand that the module is an ES module
  default: jest.fn().mockResolvedValue(true), // Mocking the default export as a function
}));

import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Admin } from './entities/admin.entity';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import {
  ACCOUNT_STATUS,
  DEFAULT_STATUS,
  EJS_FILES,
} from '@/shared/constants/enum';
import { Not } from 'typeorm';
import { dummyPassword } from '@/shared/constants/constant';
import sendEmailHelper from '@/shared/helpers/send-email-helper';
import { FilterFacilityDto } from './dto/filter-facility.dto';
import { Facility } from '@/facility/entities/facility.entity';
import s3DeleteFile from '@/shared/helpers/s3-delete-file';
import { IRequest } from '@/shared/constants/types';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: any;
  let sendEmail: any;
  let deleteFile: any;

  beforeEach(async () => {
    const adminServiceMock = {
      create: jest.fn(),
      findOneWhere: jest.fn(),
      update: jest.fn(),
      getAllContacts: jest.fn(),
      sendInvitation: jest.fn(),
      contactActivityUpdateLog: jest.fn(),
      findRole: jest.fn(),
      contactActivityLog: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: adminServiceMock,
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

    controller = module.get<AdminController>(AdminController);
    adminService = module.get<AdminService>(AdminService);
    deleteFile = s3DeleteFile as jest.MockedFunction<typeof s3DeleteFile>;

    // Initialize each method as a Jest mock directly
    adminService.findOneWhere = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof adminService.findOneWhere
    >;
    adminService.create = jest
      .fn()
      .mockResolvedValue(new Admin()) as jest.MockedFunction<
      typeof adminService.create
    >;
    adminService.update = jest
      .fn()
      .mockResolvedValue({ affected: 1 }) as jest.MockedFunction<
      typeof adminService.update
    >;
    adminService.getAllContacts = jest
      .fn()
      .mockResolvedValue([[new Admin()], 1]) as jest.MockedFunction<
      typeof adminService.getAllContacts
    >;
    adminService.getAllFacilities = jest
      .fn()
      .mockResolvedValue([[new Facility()], 1]) as jest.MockedFunction<
      typeof adminService.getAllFacilities
    >;
    adminService.getFacilityDetails = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof adminService.getFacilityDetails
    >;
    sendEmail = sendEmailHelper as jest.MockedFunction<typeof sendEmailHelper>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addContact', () => {
    const req = { user: { id: 'user-id' } } as IRequest;
    const createAdminDto: any = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      country_code: '+1',
      mobile_no: '1234567890',
      role: 'role-id',
      status: ACCOUNT_STATUS.active,
      image: 'image.jpg',
    };

    const payload: any = {
      email: createAdminDto.email,
      email_type: EJS_FILES.invitation,
      redirectUrl: process.env.ADMIN_INVITATION_URL + `?id=123`,
      subject: CONSTANT.EMAIL.ACCEPT_INVITE,
    };

    it('should create a new admin contact when valid data is provided and no existing contact is found', async () => {
      adminService.findOneWhere.mockResolvedValue(null); // No existing contact
      adminService.create.mockResolvedValue(createAdminDto); // Resolve with input DTO

      const result = await controller.addContact(createAdminDto, req);

      expect(adminService.findOneWhere).toHaveBeenCalledWith({
        where: [
          { email: createAdminDto.email },
          {
            country_code: createAdminDto.country_code,
            mobile_no: createAdminDto.mobile_no,
          },
        ],
      });
      expect(adminService.create).toHaveBeenCalledWith(createAdminDto);

      await sendEmailHelper(payload);

      sendEmail.mockResolvedValue(null);
      sendEmail.mockResolvedValue(payload);
      expect(sendEmail).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalledWith(payload);

      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Admin Contact'),
          data: createAdminDto,
        }),
      );
    });

    it('should return a bad request when a contact with the same email or mobile number already exists', async () => {
      adminService.findOneWhere.mockResolvedValue(createAdminDto); // Existing contact found

      const result = await controller.addContact(createAdminDto, req);

      expect(adminService.findOneWhere).toHaveBeenCalled();
      expect(adminService.create).not.toHaveBeenCalled(); // Create should not be called
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.EMAIL_OR_MOBILE_ALREADY_EXIST,
          data: {},
        }),
      );
    });

    it('should handle errors during the contact creation process', async () => {
      const errorMessage = 'Error creating contact';
      adminService.findOneWhere.mockRejectedValue(new Error(errorMessage)); // Simulate an error

      const result = await controller.addContact(createAdminDto, req);

      expect(adminService.findOneWhere).toHaveBeenCalled();
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });

    // Additional tests for authentication would typically be handled at the integration level
  });

  describe('editContact', () => {
    const id = '1';
    const req = { user: { id: 'user-id' } } as IRequest;
    const updateAdminDto = {
      email: 'newjohn@example.com',
      country_code: '+1',
      mobile_no: '9876543210',
      image: 'image.jpg',
    };

    it('should return a bad request if no user is found for the given id', async () => {
      adminService.findOneWhere.mockResolvedValue(null); // No user found

      const result = await controller.editContact(id, updateAdminDto, req);

      expect(adminService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
        relations: { role: true },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Record'),
          data: {},
        }),
      );
    });

    it('should return a bad request if updated email or mobile number already exists', async () => {
      adminService.findOneWhere
        .mockResolvedValueOnce({
          id,
          email: 'john@example.com',
          mobile_no: '1234567890',
        }) // User exists
        .mockResolvedValueOnce(true); // Duplicate found

      const result = await controller.editContact(id, updateAdminDto, req);

      expect(adminService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
        relations: { role: true },
      });
      expect(adminService.findOneWhere).toHaveBeenNthCalledWith(2, {
        where: [
          { email: updateAdminDto.email, id: Not(id) },
          {
            country_code: updateAdminDto.country_code,
            mobile_no: updateAdminDto.mobile_no,
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

    it('should successfully update the contact if no duplicates are found', async () => {
      adminService.findOneWhere
        .mockResolvedValueOnce({
          id,
          email: 'john@example.com',
          mobile_no: '1234567890',
        }) // User exists
        .mockResolvedValueOnce(null); // No duplicates

      adminService.update.mockResolvedValue({ affected: 1 }); // Update successful

      const result = await controller.editContact(id, updateAdminDto, req);

      expect(adminService.update).toHaveBeenCalledWith(id, updateAdminDto);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Contact'),
          data: {},
        }),
      );
    });

    it('should return a not found response if no records are updated', async () => {
      adminService.findOneWhere
        .mockResolvedValueOnce({
          id,
          email: 'john@example.com',
          mobile_no: '1234567890',
        }) // User exists
        .mockResolvedValueOnce(null); // No duplicates

      adminService.update.mockResolvedValue({ affected: 0 }); // No records updated

      const result = await controller.editContact(id, updateAdminDto, req);

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Contact'),
          data: {},
        }),
      );
    });

    it('should return a not found response if no records are updated', async () => {
      updateAdminDto.email = null;
      updateAdminDto.mobile_no = null;
      updateAdminDto.country_code = null;
      adminService.findOneWhere.mockResolvedValueOnce({
        id,
        email: 'john@example.com',
        mobile_no: '1234567890',
      });

      adminService.update.mockResolvedValue({ affected: 0 }); // No records updated

      const result = await controller.editContact(id, updateAdminDto, req);

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Contact'),
          data: {},
        }),
      );
    });

    it('should handle errors during the update process', async () => {
      const req = { user: { id: 'user-id' } } as IRequest; // Simulate an authenticated user
      const errorMessage = 'Error updating profile';

      // Simulate the user existing and no duplicates
      adminService.findOneWhere
        .mockResolvedValueOnce({
          id: req.user.id,
          email: 'existing@example.com',
          mobile_no: '1234567890',
        }) // User exists
        .mockResolvedValueOnce(null); // No duplicate email or mobile

      // Simulate an error in the update process
      adminService.update.mockRejectedValue(new Error(errorMessage));

      // Corrected to use 'editContact' instead of 'editMyProfile'
      const result = await controller.editContact(
        req.user.id,
        updateAdminDto,
        req,
      );

      // Ensure the correct failure response is expected
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('getAllContacts', () => {
    const queryParamsDto: any = {
      limit: 10,
      offset: 0,
      search: 'John',
      order: { first_name: 'ASC' },
    };
    const req: any = { user: { id: 'user_id' } };

    it('should return paginated contact list successfully', async () => {
      const mockContacts = Array(10).fill(new Admin());
      const mockCount = 10;
      adminService.getAllContacts.mockResolvedValue([mockContacts, mockCount]);

      const result = await controller.getAllContacts(queryParamsDto, req);

      expect(adminService.getAllContacts).toHaveBeenCalledWith(
        queryParamsDto,
        req.user.id,
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Contacts'),
          total: mockCount,
          limit: queryParamsDto.limit,
          offset: queryParamsDto.offset,
          data: mockContacts,
        }),
      );
    });

    it('should return no contacts found when list is empty', async () => {
      adminService.getAllContacts.mockResolvedValue([[], 0]);

      const result = await controller.getAllContacts(queryParamsDto, req);

      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Contacts'),
          total: 0,
          limit: queryParamsDto.limit,
          offset: queryParamsDto.offset,
          data: [],
        }),
      );
    });

    it('should handle errors when fetching contacts fails', async () => {
      const errorMessage = 'Database error';
      adminService.getAllContacts.mockRejectedValue(new Error(errorMessage));

      const result = await controller.getAllContacts(queryParamsDto, req);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('getContactProfile', () => {
    const id = '123'; // Example admin ID

    it('should return the contact profile if found', async () => {
      const mockAdmin = {
        id: id,
        name: 'John Doe',
        role: { id: 'role1', name: 'Administrator' },
      };
      adminService.findOneWhere.mockResolvedValue(mockAdmin); // Simulate finding the admin

      const result = await controller.getContactProfile(id);

      expect(adminService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
        relations: { role: true },
        select: {
          role: {
            id: true,
            name: true,
          },
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Contact profile'),
          data: mockAdmin,
        }),
      );
    });

    it('should return a bad request if the contact profile is not found', async () => {
      adminService.findOneWhere.mockResolvedValue(null); // Simulate no admin found

      const result = await controller.getContactProfile(id);

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Record'),
          data: {},
        }),
      );
    });

    it('should handle errors during the profile fetching process', async () => {
      const errorMessage = 'Error fetching profile';
      adminService.findOneWhere.mockRejectedValue(new Error(errorMessage)); // Simulate an error

      const result = await controller.getContactProfile(id);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('getMyProfile', () => {
    const mockUser = {
      id: 'user-id',
      name: 'John Doe',
      role: {
        id: 'role-id',
        name: 'Administrator',
      },
      password: dummyPassword,
    }; // Example user with sensitive data

    it('should return the user profile if authenticated', async () => {
      const req: any = { user: { id: mockUser.id } }; // Simulate a request with authenticated user details
      adminService.findOneWhere.mockResolvedValue(mockUser); // Simulate finding the user

      const result = await controller.getMyProfile(req);

      expect(adminService.findOneWhere).toHaveBeenCalledWith({
        relations: { role: true },
        where: { id: req.user.id },
        select: {
          role: {
            id: true,
            name: true,
          },
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Profile'),
          data: {
            ...mockUser,
            password: undefined, // Expect password to be undefined in response
          },
        }),
      );
    });

    it('should handle errors during the profile fetching process', async () => {
      const req: any = { user: { id: mockUser.id } };
      const errorMessage = 'Error fetching profile';
      adminService.findOneWhere.mockRejectedValue(new Error(errorMessage)); // Simulate an error

      const result = await controller.getMyProfile(req);

      expect(adminService.findOneWhere).toHaveBeenCalledWith({
        relations: { role: true },
        where: { id: req.user.id },
        select: {
          role: {
            id: true,
            name: true,
          },
        },
      });
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('editMyProfile', () => {
    const req: any = {
      user: { id: 'user-id', image: 'image.jpg', signature: 'signature.jpg' },
    };
    const updateAdminDto: any = {
      email: 'update@example.com',
      country_code: '+2',
      mobile_no: '9876543210',
      image: 'image.jpg',
    };

    it('should return a bad request if email or mobile number already exists', async () => {
      adminService.findOneWhere
        .mockResolvedValueOnce({
          id: req.user.id,
          email: 'original@example.com',
          mobile_no: 'original',
        }) // Original user data
        .mockResolvedValueOnce(true); // Simulates existing email or mobile
      const result = await controller.editMyProfile(req, updateAdminDto);
      expect(adminService.update).not.toHaveBeenCalled();
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.EMAIL_OR_MOBILE_ALREADY_EXIST,
          data: {},
        }),
      );
    });

    it('should successfully update the profile if no duplicates are found', async () => {
      adminService.findOneWhere.mockResolvedValue(null); // No duplicate email or mobile
      adminService.update.mockResolvedValue({ affected: 0 });
      const result = await controller.editMyProfile(req, updateAdminDto);
      expect(deleteFile).toHaveBeenCalledWith(req.user.image);
      expect(adminService.update).toHaveBeenCalledWith(
        req.user.id,
        updateAdminDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
          data: {},
        }),
      );
    });

    it('should successfully update the profile if no duplicates are found', async () => {
      updateAdminDto.email = null;
      updateAdminDto.country_code = null;
      updateAdminDto.mobile_no = null;
      updateAdminDto.image = null;
      updateAdminDto.signature = 'signature.jpg';
      adminService.findOneWhere.mockResolvedValue(null); // No duplicate email or mobile
      adminService.update.mockResolvedValue({ affected: 1 });
      const result = await controller.editMyProfile(req, updateAdminDto);
      expect(deleteFile).toHaveBeenCalledWith(req.user.signature);
      expect(adminService.update).toHaveBeenCalledWith(
        req.user.id,
        updateAdminDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Profile'),
          data: {},
        }),
      );
    });

    it('should handle errors during the update process', async () => {
      const errorMessage = 'Error updating profile';
      // Ensure the user exists and there are no duplicate errors
      adminService.findOneWhere.mockResolvedValue(null); // No duplicate email or mobile

      // Simulate an error in the update process
      adminService.update.mockRejectedValue(new Error(errorMessage));

      const result = await controller.editMyProfile(req, updateAdminDto);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('getAllFacilities', () => {
    const queryParamsDto: FilterFacilityDto = {
      city: '1',
      limit: '10',
      offset: '0',
      search: 'John',
      order: { created_at: 'ASC' },
      facility_type: ['uuid-of-nursing-facility-type'],
      status: [DEFAULT_STATUS.active],
      address: '123 Main St',
    };

    it('should return paginated facilities list successfully', async () => {
      const mockContacts = Array(10).fill(new Facility());
      const mockCount = 10;
      adminService.getAllFacilities.mockResolvedValue([
        mockContacts,
        mockCount,
      ]);

      const result = await controller.getAllFacilities(queryParamsDto);

      expect(adminService.getAllFacilities).toHaveBeenCalledWith(
        queryParamsDto,
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Facilities'),
          total: mockCount,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: mockContacts,
        }),
      );
    });

    it('should return no facilities found when list is empty', async () => {
      adminService.getAllFacilities.mockResolvedValue([[], 0]);

      const result = await controller.getAllFacilities(queryParamsDto);

      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facilities'),
          total: 0,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: [],
        }),
      );
    });

    it('should handle errors when fetching facilities fails', async () => {
      const errorMessage = 'Database error';
      adminService.getAllFacilities.mockRejectedValue(new Error(errorMessage));

      const result = await controller.getAllFacilities(queryParamsDto);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('getFacilityDetails', () => {
    const id = '1'; // Example admin ID

    it('should return the facility details if found', async () => {
      const mockFacility = {
        id: id,
        name: 'John Doe',
        role: { id: 'role1', name: 'Administrator' },
      };
      adminService.getFacilityDetails.mockResolvedValue(mockFacility); // Simulate finding the admin

      const result = await controller.getFacilityDetails(id);

      expect(adminService.getFacilityDetails).toHaveBeenCalledWith('1');
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Facility'),
          data: mockFacility,
        }),
      );
    });

    it('should return a bad request if the facility details is not found', async () => {
      adminService.getFacilityDetails.mockResolvedValue(null); // Simulate no admin found

      const result = await controller.getFacilityDetails(id);

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility'),
          data: {},
        }),
      );
    });

    it('should handle errors during the facility details fetching process', async () => {
      const errorMessage = 'Error fetching facility details';
      adminService.getFacilityDetails.mockRejectedValue(
        new Error(errorMessage),
      ); // Simulate an error

      const result = await controller.getFacilityDetails(id);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });
});
