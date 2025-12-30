import { Test, TestingModule } from '@nestjs/testing';
import { FacilityUserController } from './facility-user.controller';
import { FacilityUserService } from './facility-user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FacilityUserPermission } from './entities/facility-user-permission.entity';
import { FacilityPermission } from './entities/facility-permission.entity';
import { FacilityUser } from './entities/facility-user.entity';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { dummyPassword } from '@/shared/constants/constant';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Not } from 'typeorm';
import { Admin } from '@/admin/entities/admin.entity';

describe('FacilityUserController', () => {
  let controller: FacilityUserController;
  let facilityUserService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacilityUserController],
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
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(FacilityPermission),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Admin),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<FacilityUserController>(FacilityUserController);
    facilityUserService = module.get<FacilityUserService>(FacilityUserService);
    facilityUserService.getContactProfile = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof facilityUserService.getContactProfile
    >;
    facilityUserService.findOneWhere = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof facilityUserService.findOneWhere
    >;
    facilityUserService.update = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof facilityUserService.update
    >;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getContactDetails', () => {
    it('should return no record found if get blank array', async () => {
      facilityUserService.getContactProfile.mockResolvedValue(null);
      const result = await controller.getContactDetails('1');
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Contact'),
          data: null,
        }),
      );
    });

    it('should return record found if get data', async () => {
      const user = new FacilityUser();
      user.id = '1';
      facilityUserService.getContactProfile.mockResolvedValue(user);
      const result = await controller.getContactDetails('1');
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Contact'),
          data: user,
        }),
      );
    });

    it('should handle errors during the contact details process', async () => {
      const errorMessage = 'Error creating contact';
      facilityUserService.getContactProfile.mockRejectedValue(
        new Error(errorMessage),
      ); // Simulate an error

      const result = await controller.getContactDetails('1');

      expect(facilityUserService.getContactProfile).toHaveBeenCalled();
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('getMyProfile', () => {
    it('should return user data if user found', async () => {
      const req: any = { user: { id: '1' } };
      const user = new FacilityUser();
      user.id = '1';
      user.password = dummyPassword;
      facilityUserService.findOneWhere.mockResolvedValue(user);
      const result = await controller.getMyProfile(req);
      expect(facilityUserService.findOneWhere).toHaveBeenCalledWith({
        where: { id: req.user.id },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Profile'),
          data: user,
        }),
      );
    });

    it('should handle errors during the contact details process', async () => {
      const errorMessage = 'Error creating contact';
      const req: any = { user: { id: '1' } };
      facilityUserService.findOneWhere.mockRejectedValue(
        new Error(errorMessage),
      ); // Simulate an error

      const result = await controller.getMyProfile(req);

      expect(facilityUserService.findOneWhere).toHaveBeenCalled();
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('editProfile', () => {
    it('should return unauthenticated if user not found', async () => {
      const req: any = { user: { id: '1' } };
      facilityUserService.findOneWhere.mockResolvedValue(null);
      const result = await controller.editProfile(req, new UpdateProfileDto());
      expect(facilityUserService.findOneWhere).toHaveBeenCalledWith({
        where: { id: req.user.id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Record'),
          data: {},
        }),
      );
    });

    it('should return a bad request if updated email or mobile number already exists', async () => {
      const id = '1';
      const req: any = { user: { id: '1' } };
      const updateProfileDto: UpdateProfileDto = {
        email: 'john@example.com',
        mobile_no: '1234567890',
        country_code: '+91',
      };
      facilityUserService.findOneWhere
        .mockResolvedValueOnce({
          id,
          email: 'john@example.com',
          mobile_no: '1234567890',
        }) // User exists
        .mockResolvedValueOnce(true); // Duplicate found

      const result = await controller.editProfile(req, updateProfileDto);

      expect(facilityUserService.findOneWhere).toHaveBeenCalledWith({
        where: [
          { email: updateProfileDto.email, id: Not(id) },
          {
            country_code: updateProfileDto.country_code,
            mobile_no: updateProfileDto.mobile_no,
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

    it('should return a updated if get valid data', async () => {
      const id = '1';
      const req: any = { user: { id: '1' } };
      const user = new FacilityUser();
      user.id = '1';
      const updateProfileDto: UpdateProfileDto = {
        email: 'john@example.com',
        mobile_no: '1234567890',
        country_code: '+91',
        image: 'image.jpg',
        signature: 'signature.jpg',
      };
      facilityUserService.findOneWhere
        .mockResolvedValueOnce({
          id,
          email: 'john@example.com',
          mobile_no: '1234567890',
        }) // User exists
        .mockResolvedValueOnce(false); // Duplicate found
      facilityUserService.update.mockResolvedValue({ affected: 1 });

      const result = await controller.editProfile(req, updateProfileDto);

      expect(facilityUserService.findOneWhere).toHaveBeenCalledWith({
        where: [
          { email: updateProfileDto.email, id: Not(id) },
          {
            country_code: updateProfileDto.country_code,
            mobile_no: updateProfileDto.mobile_no,
            id: Not(id),
          },
        ],
      });

      expect(facilityUserService.update).toHaveBeenCalledWith(
        user.id,
        updateProfileDto,
      );

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Profile'),
          data: {},
        }),
      );
    });

    it('should return no record found if not updated', async () => {
      const id = '1';
      const req: any = { user: { id: '1' } };
      const user = new FacilityUser();
      user.id = '1';
      const updateProfileDto: UpdateProfileDto = {
        email: null,
        mobile_no: null,
        country_code: null,
      };
      facilityUserService.findOneWhere.mockResolvedValueOnce({
        id,
        email: 'john@example.com',
        mobile_no: '1234567890',
      });
      facilityUserService.update.mockResolvedValue({ affected: 0 });

      const result = await controller.editProfile(req, updateProfileDto);

      expect(facilityUserService.update).toHaveBeenCalledWith(
        user.id,
        updateProfileDto,
      );

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Profile'),
          data: {},
        }),
      );
    });

    it('should handle errors during the contact details process', async () => {
      const errorMessage = 'Error creating contact';
      const req: any = { user: { id: '1' } };
      facilityUserService.findOneWhere.mockRejectedValue(
        new Error(errorMessage),
      ); // Simulate an error

      const result = await await controller.editProfile(
        req,
        new UpdateProfileDto(),
      );

      expect(facilityUserService.findOneWhere).toHaveBeenCalled();
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });
});
