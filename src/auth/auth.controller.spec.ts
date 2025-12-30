jest.mock('@/shared/helpers/generate-token', () => ({
  __esModule: true, // This helps Jest understand that the module is an ES module
  default: jest.fn().mockResolvedValue(true), // Mocking the default export as a function
}));

jest.mock('@/shared/helpers/send-email-helper', () => ({
  __esModule: true, // This helps Jest understand that the module is an ES module
  default: jest.fn().mockResolvedValue(true), // Mocking the default export as a function
}));

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Otp } from '@/otp/entities/otp.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Provider } from '@/provider/entities/provider.entity';
import { ProviderService } from '@/provider/provider.service';
import { Token } from '@/token/entities/token.entity';
import { FacilityService } from '@/facility/facility.service';
import { FacilityUserService } from '@/facility-user/facility-user.service';
import { AdminService } from '@/admin/admin.service';
import { RoleSectionPermissionService } from '@/role-section-permission/role-section-permission.service';
import { Facility } from '@/facility/entities/facility.entity';
import { FacilityUserPermission } from '@/facility-user/entities/facility-user-permission.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { FacilityPermission } from '@/facility-user/entities/facility-permission.entity';
import { Admin } from '@/admin/entities/admin.entity';
import { Section } from '@/section/entities/section.entity';
import { RoleSectionPermission } from '@/role-section-permission/entities/role-section-permission.entity';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import {
  active,
  dummyEmail,
  dummyPassword,
  dummyToken,
  salt,
} from '@/shared/constants/constant';
import { ShiftTableColumns } from '@/shared/constants/default-column-preference';
import * as bcrypt from 'bcrypt';
import generateToken from '@/shared/helpers/generate-token';
import sendEmailHelper from '@/shared/helpers/send-email-helper';
import {
  EJS_FILES,
  ENTITY_STATUS,
  LINK_TYPE,
  OTP_TYPE,
  TABLE,
  USER_STATUS,
} from '@/shared/constants/enum';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { SignupFacilityDto } from './dto/signup-facility.dto';
import { SignupFacilityUserDto } from './dto/signup-facility-user.dto';
import { ProviderEmailSignupDto } from './dto/provider-email-signup.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ProviderMobileLoginDto } from './dto/provider-mobile-login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { EmailLoginDto } from './dto/email-login.dto';
import { SocialSignupProvider } from './dto/social-signup.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AppleSignupDto } from './dto/apple-signup.dto';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { Invite } from '@/invite/entities/invite.entity';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { SendOtpDto } from './dto/send-otp.dto';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';
import { Role } from '@/role/entities/role.entity';
import { Certificate } from '@/certificate/entities/certificate.entity';
import { ProviderAddress } from '@/provider-address/entities/provider-address.entity';
import { ColumnsPreferenceService } from '@/columns-preference/columns-preference.service';
import { Speciality } from '@/speciality/entities/speciality.entity';
import { Not } from 'typeorm';
import { ShiftService } from '@/shift/shift.service';
import { AIService } from '@/shared/helpers/ai-service';
import { AutoSchedulingService } from '@/shared/helpers/auto-scheduling';
import { SmsService } from '@/shared/helpers/send-sms';
import { AutoSchedulingSettingService } from '@/auto-scheduling-setting/auto-scheduling-setting.service';
import { IRequest } from '@/shared/constants/types';
import { ReferFriend } from '@/refer-friend/entities/refer-friend.entity';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;
  let facilityUserService: any;
  let providerService: any;
  let generateTokenHelper: any;
  let facilityService: any;
  let sendEmail: any;
  let adminService: any;
  let mockTokenRepository: any;
  let encryptDecryptService: any;
  let roleSectionPermissionService: any;
  let columnsPreferenceService: any;

  beforeAll(() => {
    process.env.CRYPTO_ALGORITHM = 'your_algorithm';
    process.env.CRYPTO_KEY = 'your_crypto_key_in_hex';
    process.env.CRYPTO_IV = 'your_crypto_iv_in_hex';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ limit: 0, ttl: 0 }])],
      controllers: [AuthController],
      providers: [
        AuthService,
        FacilityService,
        FacilityUserService,
        AdminService,
        ProviderService,
        {
          provide: APP_GUARD,
          useClass: ThrottlerGuard,
        },
        {
          provide: getRepositoryToken(Token),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Otp),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Facility),
          useValue: {},
        },
        {
          provide: getRepositoryToken(FacilityUserPermission),
          useValue: {},
        },
        {
          provide: getRepositoryToken(FacilityPermission),
          useValue: {},
        },
        {
          provide: getRepositoryToken(FacilityUser),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Provider),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Admin),
          useValue: {},
        },
        {
          provide: getRepositoryToken(RoleSectionPermission),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Section),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ReferFriend),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Invite),
          useValue: {
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
            update: jest.fn(),
            create: jest.fn(),
            getFacilityUserPermissions: jest.fn(),
          },
        },
        {
          provide: RoleSectionPermissionService,
          useValue: {
            getSectionPermissions: jest.fn(),
          },
        },
        {
          provide: ProviderService,
          useValue: {
            findOneWhere: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: AdminService,
          useValue: {
            findOneWhere: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            contactActivityLog: jest.fn(),
          },
        },
        {
          provide: FacilityService,
          useValue: {
            findOneWhere: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: ColumnsPreferenceService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: ShiftService,
          useValue: {
            isProviderAssociatedWithAnyShift: jest.fn(),
            saveProviderCancelledShifts: jest.fn(),
          },
        },
        {
          provide: AIService,
          useValue: {
            getAIRecommendations: jest.fn(),
          },
        },
        {
          provide: AutoSchedulingService,
          useValue: {
            filterByPreferenceOfProvider: jest.fn(),
            runAutoScheduling: jest.fn(),
          },
        },
        {
          provide: SmsService,
          useValue: {
            sendSms: jest.fn(),
          },
        },
        {
          provide: AutoSchedulingSettingService,
          useValue: { findOneWhere: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    facilityUserService = module.get<FacilityUserService>(FacilityUserService);
    facilityService = module.get<FacilityService>(FacilityService);
    encryptDecryptService = module.get<EncryptDecryptService>(
      EncryptDecryptService,
    );
    roleSectionPermissionService = module.get<RoleSectionPermissionService>(
      RoleSectionPermissionService,
    );
    columnsPreferenceService = module.get<ColumnsPreferenceService>(
      ColumnsPreferenceService,
    );
    providerService = module.get<ProviderService>(ProviderService);
    adminService = module.get<AdminService>(AdminService);
    mockTokenRepository = module.get(getRepositoryToken(Token));
    sendEmail = sendEmailHelper as jest.MockedFunction<typeof sendEmailHelper>;
    generateTokenHelper = generateToken as jest.MockedFunction<
      typeof generateToken
    >;
    authService.providerSignUp = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof authService.providerSignUp
    >;
    authService.isInvitationExist = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof authService.isInvitationExist
    >;
    authService.createUserToken = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof authService.createUserToken
    >;
    authService.createUserTokenV2 = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof authService.createUserTokenV2
    >;
    authService.findOtp = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof authService.findOtp
    >;
    authService.verifySignupOtp = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof authService.verifySignupOtp
    >;
    authService.verifyLoginOtp = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof authService.verifyLoginOtp
    >;
    authService.sendInvitation = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof authService.sendInvitation
    >;
    authService.providerMobileLogin = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof authService.providerMobileLogin
    >;
    authService.resendOTP = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof authService.resendOTP
    >;
    authService.login = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<typeof authService.login>;
    authService.createInvite = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof authService.createInvite
    >;
    authService.sendForgotPasswordOTP = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof authService.sendForgotPasswordOTP
    >;
    authService.doesUserExists = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof authService.doesUserExists
    >;
    authService.isInvitationExpired = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof authService.isInvitationExpired
    >;
    authService.sendOtpForChangeContactNumber = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof authService.sendOtpForChangeContactNumber
    >;
    authService.verifyChangeContactNumberOtp = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof authService.verifyChangeContactNumberOtp
    >;
    authService.isInvitationExistV2 = jest.fn();
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signupFacilityUser', () => {
    const existingUser: any = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'johndoe@gmail.com',
      password: dummyPassword,
      country_code: '+123',
      mobile_no: '4567890',
      created_at_ip: '127.0.0.1',
      updated_at_ip: '127.0.0.1',
    };
    const signupFacilityUserDto: SignupFacilityUserDto = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'johndoe@gmail.com',
      password: dummyPassword,
      country_code: '+123',
      mobile_no: '4567890',
      created_at_ip: '127.0.0.1',
      updated_at_ip: '127.0.0.1',
    };

    it('should return bad request if user already exists', async () => {
      authService.doesUserExists.mockResolvedValue(null);
      const result = await controller.signupFacilityUser(signupFacilityUserDto);

      expect(authService.doesUserExists).toHaveBeenCalled();
      expect(authService.doesUserExists).toHaveBeenCalledWith(
        {
          email: signupFacilityUserDto.email,
          country_code: signupFacilityUserDto.country_code,
          mobile_no: signupFacilityUserDto.mobile_no,
        },
        facilityUserService,
      );

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.WRONG_CREDENTIALS,
          data: {},
        }),
      );
    });

    it('should create a new facility user if user does not exist', async () => {
      const updatedUser: any = { affected: 0 };

      authService.doesUserExists.mockResolvedValue(existingUser);
      facilityUserService.update.mockResolvedValue(updatedUser);
      bcrypt.hash.mockResolvedValue(dummyPassword);

      const result = await controller.signupFacilityUser(signupFacilityUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(
        signupFacilityUserDto.password,
        10,
      );
      expect(result).toEqual(
        response.successResponse({
          message: updatedUser.affected
            ? CONSTANT.SUCCESS.SIGN_UP
            : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
          data: {},
        }),
      );
    });

    it('should create a new facility user if user does not exist', async () => {
      const updatedUser: any = { affected: 1 };

      authService.doesUserExists.mockResolvedValue(existingUser);
      facilityUserService.update.mockResolvedValue(updatedUser);
      bcrypt.hash.mockResolvedValue(dummyPassword);

      const result = await controller.signupFacilityUser(signupFacilityUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(
        signupFacilityUserDto.password,
        10,
      );
      expect(result).toEqual(
        response.successResponse({
          message: updatedUser.affected
            ? CONSTANT.SUCCESS.SIGN_UP
            : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
          data: {},
        }),
      );
    });

    it('should return failure response if an error occurs', async () => {
      const error = new Error('Test error');

      authService.doesUserExists.mockRejectedValue(error);

      const result = await controller.signupFacilityUser(signupFacilityUserDto);

      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('providerEmailSignUp', () => {
    const providerEmailSignupDto: ProviderEmailSignupDto = {
      email: 'existing@example.com',
      password: dummyPassword,
    };
    it('should return bad request if email already exists', async () => {
      authService.doesUserExists.mockResolvedValue({
        email: providerEmailSignupDto.email,
        is_email_verified: true,
        is_active: true,
      });

      const result = await controller.providerEmailSignUp(
        providerEmailSignupDto,
      );

      expect(authService.doesUserExists).toHaveBeenCalledWith(
        {
          email: providerEmailSignupDto.email,
        },
        providerService,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.EMAIL_ALREADY_EXIST,
          data: {},
        }),
      );
    });

    it('should return bad request if email already exists', async () => {
      authService.doesUserExists.mockResolvedValue({
        email: providerEmailSignupDto.email,
        is_email_verified: true,
        is_active: true,
      });

      const result = await controller.providerEmailSignUp(
        providerEmailSignupDto,
      );

      expect(authService.doesUserExists).toHaveBeenCalledWith(
        {
          email: providerEmailSignupDto.email,
        },
        providerService,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.EMAIL_ALREADY_EXIST,
          data: {},
        }),
      );
    });

    it('should complete signup if provider does not exist and if data is valid', async () => {
      providerEmailSignupDto.password = dummyPassword;
      providerService.findOneWhere.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue(dummyPassword);

      const result = await controller.providerEmailSignUp(
        providerEmailSignupDto,
      );

      await authService.providerSignUp(providerEmailSignupDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(
        providerEmailSignupDto.password,
        salt,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.COMPLETE_EMAIL_VERIFICATION,
          data: {},
        }),
      );
    });

    it('should handle error during sign-up', async () => {
      const providerEmailSignupDto: any = {
        email: 'newprovider@example.com',
        password: dummyPassword,
      };
      authService.doesUserExists.mockRejectedValue(new Error('Database error'));

      const result = await controller.providerEmailSignUp(
        providerEmailSignupDto,
      );

      expect(authService.doesUserExists).toHaveBeenCalledWith(
        { email: providerEmailSignupDto.email },
        providerService,
      );
      expect(result).toEqual(
        response.failureResponse(new Error('Database error')),
      );
    });
  });

  describe('signUpVerification', () => {
    const verifyEmailDto: VerifyEmailDto = {
      email: 'nonexistent@example.com',
      updated_at_ip: '127.0.0.1',
    };
    it('should handle record not found', async () => {
      const table: any = 'provider';
      authService.doesUserExists.mockResolvedValue(null);

      const result = await controller.signUpVerification(table, verifyEmailDto);

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
          data: {},
        }),
      );
    });

    it('should handle invalid table name', async () => {
      const table: any = 'invalidTable';

      const result = await controller.signUpVerification(table, verifyEmailDto);

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.SOMETHING_WENT_WRONG,
          data: {},
        }),
      );
    });

    it('should handle error during verification', async () => {
      const table: any = 'provider';
      authService.doesUserExists.mockRejectedValue(new Error('Database error'));

      const result = await controller.signUpVerification(table, verifyEmailDto);

      expect(result).toEqual(
        response.failureResponse(new Error('Database error')),
      );
    });

    it('should update dto if table is facility', async () => {
      const table = 'facility_user';
      authService.doesUserExists.mockResolvedValue({
        id: '1',
      });
      authService.isInvitationExist.mockResolvedValue(new Invite());
      encryptDecryptService.encrypt.mockResolvedValue('encrypted-id');
      facilityUserService.update.mockResolvedValue({ affected: 1 });

      const result = await controller.signUpVerification(table, verifyEmailDto);

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.EMAIL_VERIFIED,
          data: { id: 'encrypted-id' },
        }),
      );
    });
    it('should handle email not verified error', async () => {
      const table = 'provider';
      authService.doesUserExists.mockResolvedValue({ id: '1' });
      authService.isInvitationExist.mockResolvedValue(new Invite());
      providerService.update.mockResolvedValue({ affected: 0 });

      const result = await controller.signUpVerification(table, verifyEmailDto);

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.EMAIL_NOT_VERIFIED,
          data: {},
        }),
      );
    });
    it('should send bad request if invitation is expired', async () => {
      const table = 'provider';
      authService.doesUserExists.mockResolvedValue({ id: '1' });
      authService.isInvitationExist.mockResolvedValue(null);

      const result = await controller.signUpVerification(table, verifyEmailDto);

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.URL_EXPIRED,
          data: {},
        }),
      );
    });
  });

  describe('signupWithGoogle', () => {
    it('should sign up with Google successfully for a new provider', async () => {
      const socialSignupProvider: SocialSignupProvider = {
        firebase: 'firebase_token',
        device_id: 'device_id',
        device_name: 'device_name',
        device_type: 'device_type',
        created_at_ip: '127.0.0.1',
        updated_at_ip: '127.0.0.1',
      };
      const req: any = {
        social_user: {
          email: 'example@example.com',
          user_id: 'google_user_id',
          name: 'John Doe',
        },
      };

      // Mock providerService.findOneWhere to return null, indicating that the provider does not exist
      providerService.findOneWhere.mockResolvedValue(null);

      // Mock providerService.create to return the created provider
      providerService.create.mockResolvedValue({
        id: '1',
        email: 'example@example.com',
        first_name: 'John',
        last_name: 'Doe',
        is_active: true,
        is_email_verified: true,
        profile_image: null,
        bio: null,
        country_code: null,
        mobile_no: null,
        created_at: new Date(),
      });

      // Mock authService.createUserToken to return a dummy token
      generateTokenHelper.mockReturnValue(dummyToken);
      authService.createUserToken.mockResolvedValue(dummyToken);

      // Call the signupWithGoogle method
      const result = await controller.signupWithGoogle(
        req,
        socialSignupProvider,
      );

      // Expectations
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        relations: {
          certificate: true,
          address: true,
          speciality: true,
          status: true,
        },
        where: {
          email: 'example@example.com',
          profile_status: Not(USER_STATUS.deleted),
        },
        order: { created_at: 'DESC' },
      });

      expect(providerService.create).toHaveBeenCalledWith({
        email: 'example@example.com',
        google_id: 'google_user_id',
        first_name: 'John',
        last_name: 'Doe',
        is_email_verified: true,
        status: null,
      });

      expect(generateToken).toHaveBeenCalledWith(
        '1',
        'provider_id',
        'provider',
      );
      expect(authService.createUserToken).toHaveBeenCalledWith(
        {
          provider_id: '1',
          jwt: dummyToken,
          firebase: 'firebase_token',
          device_id: 'device_id',
          device_name: 'device_name',
          device_type: 'device_type',
          created_at_ip: '127.0.0.1',
          updated_at_ip: '127.0.0.1',
        },
        'provider_id',
        'provider',
      );

      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.SIGN_UP,
          data: {
            id: '1',
            is_active: true,
            is_email_verified: true,
            is_signup_completed: false,
            email: 'example@example.com',
            first_name: 'John',
            last_name: 'Doe',
            base_url: undefined,
            profile_image: null,
            signature_image: undefined,
            bio: null,
            country_code: null,
            mobile_no: null,
            created_at: expect.any(Date),
            jwt: dummyToken,
          },
        }),
      );
    });

    it('should sign up with Google successfully for a new provider', async () => {
      const socialSignupProvider: SocialSignupProvider = {
        firebase: 'firebase_token',
        device_id: 'device_id',
        device_name: 'device_name',
        device_type: 'device_type',
        created_at_ip: '127.0.0.1',
        updated_at_ip: '127.0.0.1',
      };
      const req: any = {
        social_user: {
          email: 'example@example.com',
          user_id: 'google_user_id',
          name: 'John Doe',
        },
      };

      // Mock providerService.findOneWhere to return null, indicating that the provider does not exist
      providerService.findOneWhere.mockResolvedValue(null);

      // Mock providerService.create to return the created provider
      providerService.create.mockResolvedValue({
        id: '1',
        email: 'example@example.com',
        first_name: 'John',
        last_name: 'Doe',
        is_active: true,
        is_email_verified: true,
        profile_image: null,
        bio: null,
        country_code: null,
        mobile_no: null,
        created_at: new Date(),
        certificate: new Certificate(),
        speciality: new Speciality(),
        address: [new ProviderAddress()],
      });

      // Mock authService.createUserToken to return a dummy token
      generateTokenHelper.mockReturnValue(dummyToken);
      authService.createUserToken.mockResolvedValue(dummyToken);

      // Call the signupWithGoogle method
      const result = await controller.signupWithGoogle(
        req,
        socialSignupProvider,
      );

      // Expectations
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        relations: {
          certificate: true,
          address: true,
          speciality: true,
          status: true,
        },
        where: {
          email: 'example@example.com',
          profile_status: Not(USER_STATUS.deleted),
        },
        order: { created_at: 'DESC' },
      });

      expect(providerService.create).toHaveBeenCalledWith({
        email: 'example@example.com',
        google_id: 'google_user_id',
        first_name: 'John',
        last_name: 'Doe',
        is_email_verified: true,
        status: null,
      });

      expect(generateToken).toHaveBeenCalledWith(
        '1',
        'provider_id',
        'provider',
      );
      expect(authService.createUserToken).toHaveBeenCalledWith(
        {
          provider_id: '1',
          jwt: dummyToken,
          firebase: 'firebase_token',
          device_id: 'device_id',
          device_name: 'device_name',
          device_type: 'device_type',
          created_at_ip: '127.0.0.1',
          updated_at_ip: '127.0.0.1',
        },
        'provider_id',
        'provider',
      );

      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.SIGN_UP,
          data: {
            id: '1',
            is_active: true,
            is_email_verified: true,
            is_signup_completed: true,
            email: 'example@example.com',
            first_name: 'John',
            last_name: 'Doe',
            base_url: undefined,
            profile_image: null,
            signature_image: undefined,
            bio: null,
            country_code: null,
            mobile_no: null,
            created_at: expect.any(Date),
            jwt: dummyToken,
          },
        }),
      );
    });

    it('should handle errors during signup process', async () => {
      const reqMock: any = {
        social_user: null,
      };
      const socialSignupProviderMock: any = {
        firebase: 'someFirebase',
        device_id: 'someDeviceId',
      };
      providerService.findOneWhere.mockRejectedValue(
        new Error('Failed to find user'),
      );

      const result = await controller.signupWithGoogle(
        reqMock,
        socialSignupProviderMock,
      );

      expect(result).toEqual(
        response.failureResponse(new Error('Failed to find user')),
      );
    });
  });

  describe('providerMobileSignUp', () => {
    const providerMobileSignupDto: any = {
      mobile_no: '4567890',
    };
    it('should return bad request if mobile already exists', async () => {
      authService.doesUserExists.mockResolvedValue({
        email: providerMobileSignupDto.mobile_no,
        is_active: true,
      });

      const result = await controller.providerMobileSignUp(
        providerMobileSignupDto,
      );

      expect(authService.doesUserExists).toHaveBeenCalledWith(
        { mobile_no: providerMobileSignupDto.mobile_no },
        providerService,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.MOBILE_ALREADY_EXIST,
          data: {},
        }),
      );
    });

    it('should return bad request if mobile already exists', async () => {
      authService.doesUserExists.mockResolvedValue({
        email: providerMobileSignupDto.mobile_no,
        is_active: true,
        profile_status: USER_STATUS.deleted,
      });

      const result = await controller.providerMobileSignUp(
        providerMobileSignupDto,
      );

      expect(authService.doesUserExists).toHaveBeenCalledWith(
        { mobile_no: providerMobileSignupDto.mobile_no },
        providerService,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.COMPLETE_VERIFICATION('Signup'),
          data: {},
        }),
      );
    });

    it('should complete signup if provider does not exist and if data is valid', async () => {
      authService.doesUserExists.mockResolvedValue(null);

      const result = await controller.providerMobileSignUp(
        providerMobileSignupDto,
      );

      await authService.providerSignUp(providerMobileSignupDto);

      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.COMPLETE_VERIFICATION('Signup'),
          data: {},
        }),
      );
    });

    it('should handle error during sign-up', async () => {
      authService.doesUserExists.mockRejectedValue(new Error('Database error'));

      const result = await controller.providerMobileSignUp(
        providerMobileSignupDto,
      );

      expect(authService.doesUserExists).toHaveBeenCalledWith(
        { mobile_no: providerMobileSignupDto.mobile_no },
        providerService,
      );
      expect(result).toEqual(
        response.failureResponse(new Error('Database error')),
      );
    });
  });

  describe('verifySignupOtp', () => {
    const verifyOtpDto: VerifyOtpDto = {
      country_code: '+123',
      mobile_no: '4567890',
      otp: 123456,
      device_id: 'device_id',
      device_type: 'device_type',
      firebase: 'firebase',
      created_at_ip: '127.0.0.1',
      updated_at_ip: '127.0.0.1',
    };
    it('should handle if otp does not exist', async () => {
      authService.findOtp.mockResolvedValue(null);
      const result = await controller.verifySignupOtp(verifyOtpDto);
      expect(authService.findOtp).toHaveBeenCalledWith({
        where: {
          is_verified: false,
          type: 'signup',
          country_code: verifyOtpDto.country_code,
          contact_number: verifyOtpDto.mobile_no,
          otp: verifyOtpDto.otp,
        },
        relations: {
          provider: true,
        },
      });

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.INVALID_OTP,
          data: {},
        }),
      );
    });

    it('should successfully verify otp if found', async () => {
      authService.findOtp.mockResolvedValue({ otp: 123456 });
      authService.verifySignupOtp.mockResolvedValue(
        response.successResponse({
          message: 'Login successful',
          data: {},
        }),
      );
      const result = await controller.verifySignupOtp(verifyOtpDto);
      expect(authService.findOtp).toHaveBeenCalledWith({
        where: {
          is_verified: false,
          type: 'signup',
          country_code: verifyOtpDto.country_code,
          contact_number: verifyOtpDto.mobile_no,
          otp: verifyOtpDto.otp,
        },
        relations: {
          provider: true,
        },
      });

      expect(authService.verifySignupOtp).toHaveBeenCalledWith(
        { otp: 123456 },
        verifyOtpDto,
      );

      expect(result).toEqual(
        response.successResponse({
          message: 'Login successful',
          data: {},
        }),
      );
    });

    it('should handle errors during OTP verification', async () => {
      const error = new Error('Database error');

      authService.findOtp.mockRejectedValue(error);

      const result = await controller.verifySignupOtp(verifyOtpDto);

      expect(authService.findOtp).toHaveBeenCalled();
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('facilitySignup', () => {
    const signupFacilityDto: SignupFacilityDto = {
      name: 'test',
      base_url: undefined,
      email: 'test@example.com',
      country_code: '+123',
      password: dummyPassword,
      mobile_no: '4567890',
      created_at_ip: '127.0.0.1',
      updated_at_ip: '127.0.0.1',
    };

    it('should return bad request if email or mobile already exists', async () => {
      authService.doesUserExists.mockResolvedValue({
        email: 'test@example.com',
        country_code: '+123',
        mobile_no: '4567890',
        is_email_verified: true,
      });

      const result = await controller.facilitySignup(signupFacilityDto);

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.EMAIL_OR_MOBILE_ALREADY_EXIST,
          data: {},
        }),
      );
    });

    it('should return bad request if email or mobile already exists', async () => {
      authService.doesUserExists.mockResolvedValue({
        email: 'test@example.com',
        country_code: '+123',
        mobile_no: '4567890',
        is_email_verified: false,
      });
      // Mock all dependencies to resolve for this scenario
      bcrypt.hash.mockResolvedValue(dummyPassword);
      facilityService.create.mockResolvedValue({
        ...signupFacilityDto,
      });
      authService.createInvite.mockResolvedValue(new Invite());
      sendEmail.mockResolvedValue(true);

      const result = await controller.facilitySignup(signupFacilityDto);

      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.SIGN_UP,
          data: signupFacilityDto,
        }),
      );
    });

    it('should send verification email if data is valid', async () => {
      signupFacilityDto.password = dummyPassword;
      authService.doesUserExists.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue(dummyPassword);
      sendEmail.mockResolvedValue(true);
      facilityService.create.mockResolvedValue({
        id: '1',
        ...signupFacilityDto,
        is_master: true,
      });
      authService.createInvite.mockResolvedValue(new Invite());

      const result = await controller.facilitySignup(signupFacilityDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(
        signupFacilityDto.password,
        salt,
      );
      expect(facilityService.create).toHaveBeenCalledWith({
        ...signupFacilityDto,
        is_master: true,
      });

      expect(authService.createInvite).toHaveBeenCalledWith(
        {
          id: '1',
          ...signupFacilityDto,
          is_master: true,
        },
        'facility',
      );

      expect(sendEmail).toHaveBeenCalledWith({
        email: signupFacilityDto.email,
        name: signupFacilityDto.name,
        redirectUrl: expect.any(String),
        email_type: EJS_FILES.verification,
        subject: CONSTANT.EMAIL.VERIFICATION_SUBJECT,
      });

      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.SIGN_UP,
          data: {
            id: '1',
            ...signupFacilityDto,
            is_master: true,
          },
        }),
      );
    });

    it('should handle errors during facility signup', async () => {
      const error = new Error('Database error');

      authService.doesUserExists.mockRejectedValue(error);

      const result = await controller.facilitySignup(signupFacilityDto);

      expect(authService.doesUserExists).toHaveBeenCalled();
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('providerMobileLogin', () => {
    const providerMobileLoginDto: ProviderMobileLoginDto = {
      country_code: '+123',
      mobile_no: '4567890',
      device_id: 'device_id',
      device_type: 'device_type',
      device_name: 'device_name',
      firebase: 'firebase',
      created_at_ip: '127.0.0.1',
      updated_at_ip: '127.0.0.1',
    };
    it('should send bad request if wrong credentials', async () => {
      providerService.findOneWhere.mockResolvedValue(null);

      const result = await controller.providerMobileLogin(
        providerMobileLoginDto,
      );

      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: {
          country_code: providerMobileLoginDto.country_code,
          mobile_no: providerMobileLoginDto.mobile_no,
          profile_status: Not(USER_STATUS.deleted),
        },
        order: { created_at: 'DESC' },
        relations: { status: true },
      });

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.MOBILE_NOT_REGISTERED,
          data: {},
        }),
      );
    });

    it('should login user if valid credentials', async () => {
      const provider = new Provider();
      const status = new StatusSetting();
      status.name = active;
      provider.status = status;
      provider.profile_progress = 100;
      providerService.findOneWhere.mockResolvedValue(provider);

      const result = await controller.providerMobileLogin(
        providerMobileLoginDto,
      );

      expect(authService.providerMobileLogin).toHaveBeenCalledWith(
        provider,
        providerMobileLoginDto,
      );

      expect(result).toEqual(result);
    });

    it('should return failure response if an error occurs', async () => {
      const error = new Error('Test error');

      providerService.findOneWhere.mockRejectedValue(error);

      const result = await controller.providerMobileLogin(
        providerMobileLoginDto,
      );

      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('verifyLoginOtp', () => {
    const verifyOtpDto: VerifyOtpDto = {
      country_code: '+123',
      mobile_no: '4567890',
      otp: 123456,
      device_id: 'device_id',
      device_type: 'device_type',
      firebase: 'firebase',
      created_at_ip: '127.0.0.1',
      updated_at_ip: '127.0.0.1',
    };
    const req = {
      user: {
        id: '1',
        first_name: 'first',
        last_name: 'last',
        role: 'admin',
        email: dummyEmail,
      },
      headers: {
        'user-agent': 'Mozilla/5.0',
      },
    } as IRequest;
    it('should handle if otp does not exist', async () => {
      authService.findOtp.mockResolvedValue(null);
      const result = await controller.verifyLoginOtp(verifyOtpDto, req);
      expect(authService.findOtp).toHaveBeenCalledWith({
        where: {
          is_verified: false,
          type: OTP_TYPE.login,
          country_code: verifyOtpDto.country_code,
          contact_number: verifyOtpDto.mobile_no,
          otp: verifyOtpDto.otp,
        },
        relations: {
          provider: true,
        },
      });

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.INVALID_OTP,
          data: {},
        }),
      );
    });

    it('should successfully verify OTP if found', async () => {
      authService.findOtp.mockResolvedValue(new Otp());
      authService.verifyLoginOtp.mockResolvedValue({
        message: 'Login successful',
        data: {},
        status: 200,
      });

      const result = await controller.verifyLoginOtp(verifyOtpDto, req);

      expect(authService.findOtp).toHaveBeenCalledWith({
        where: {
          is_verified: false,
          type: 'login',
          country_code: verifyOtpDto.country_code,
          contact_number: verifyOtpDto.mobile_no,
          otp: verifyOtpDto.otp,
        },
        relations: {
          provider: true,
        },
      });

      // Ensure we are adding the user-agent from headers to verifyOtpDto
      expect(authService.verifyLoginOtp).toHaveBeenCalledWith(new Otp(), {
        ...verifyOtpDto,
        device_name: 'Mozilla/5.0',
      });

      // Assuming the successResponse function is used correctly and mocked properly
      expect(result).toEqual({
        message: 'Login successful',
        data: {},
        status: 200,
      });
    });

    it('should handle errors during OTP verification', async () => {
      const error = new Error('Database error');

      authService.findOtp.mockRejectedValue(error);

      const result = await controller.verifyLoginOtp(verifyOtpDto, req);

      expect(authService.findOtp).toHaveBeenCalled();
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('resendOTP', () => {
    const resendOtpDto: ResendOtpDto = {
      country_code: '+123',
      mobile_no: '4567890',
      type: OTP_TYPE.login,
      email: 'test@example.com',
      updated_at_ip: '127.0.0.1',
    };

    it('should send bad request if wrong credentials', async () => {
      providerService.findOneWhere.mockResolvedValue(null);

      const result = await controller.resendOTP(resendOtpDto);

      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: {
          ...(resendOtpDto.email
            ? {
                email: resendOtpDto.email,
                profile_status: Not(USER_STATUS.deleted),
              }
            : {
                country_code: resendOtpDto.country_code,
                mobile_no: resendOtpDto.mobile_no,
                profile_status: Not(USER_STATUS.deleted),
              }),
        },
        order: { created_at: 'DESC' },
        relations: { status: true },
      });

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.WRONG_CREDENTIALS,
          data: {},
        }),
      );
    });

    it('should successfully resend OTP if found', async () => {
      const provider = new Provider();
      const status = new StatusSetting();
      status.name = active;
      provider.status = status;
      provider.profile_progress = 100;
      providerService.findOneWhere.mockResolvedValue(provider);
      authService.resendOTP.mockResolvedValue({
        message: 'Login successful',
        data: {},
        status: 200,
      });

      const result = await controller.resendOTP(resendOtpDto);

      expect(authService.resendOTP).toHaveBeenCalledWith(
        provider,
        resendOtpDto,
      );

      // Assuming the successResponse function is used correctly and mocked properly
      expect(result).toEqual({
        message: 'Login successful',
        data: {},
        status: 200,
      });
    });

    it('should handle errors during OTP verification', async () => {
      const error = new Error('Database error');

      providerService.findOneWhere.mockRejectedValue(error);

      const result = await controller.resendOTP(resendOtpDto);

      expect(providerService.findOneWhere).toHaveBeenCalled();
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('login', () => {
    const emailLoginDto: EmailLoginDto = {
      email: dummyEmail,
      password: dummyPassword,
      device_id: 'device_id',
      device_type: 'device_type',
      device_name: 'device_name',
      firebase: 'firebase',
      created_at_ip: '127.0.0.1',
      updated_at_ip: '127.0.0.1',
      remember_me: true,
    };

    const req = {
      user: {
        id: '1',
        first_name: 'first',
        last_name: 'last',
        role: 'admin',
        email: dummyEmail,
      },
      headers: {
        'user-agent': 'Mozilla/5.0',
      },
    } as IRequest;

    it('should handle if provider does not exist', async () => {
      providerService.findOneWhere.mockResolvedValue(null);
      const result = await controller.login(emailLoginDto, req);
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: {
          email: emailLoginDto.email,
          profile_status: Not(USER_STATUS.deleted),
        },
        order: { created_at: 'DESC' },
        relations: { status: true },
      });

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.PROVIDER_NOT_REGISTERED,
          data: {},
        }),
      );
    });

    it('should login if valid credentials', async () => {
      const provider = new Provider();
      const status = new StatusSetting();
      status.name = active;
      provider.status = status;
      provider.profile_progress = 100;
      providerService.findOneWhere.mockResolvedValue(provider);
      authService.login.mockResolvedValue({
        message: CONSTANT.SUCCESS.LOGIN,
        data: {},
        status: 200,
      });
      providerService.findOneWhere.mockResolvedValue(provider);
      authService.login.mockResolvedValue({
        message: CONSTANT.SUCCESS.LOGIN,
        data: {},
        status: 200,
      });

      const result = await controller.login(emailLoginDto, req);

      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: {
          email: emailLoginDto.email,
          profile_status: Not(USER_STATUS.deleted),
        },
        order: { created_at: 'DESC' },
        relations: { status: true },
      });

      expect(authService.login).toHaveBeenCalledWith(provider, emailLoginDto);

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.LOGIN,
          data: {},
        }),
      );
    });

    it('should handle errors during login process', async () => {
      const error = new Error('Database error');

      providerService.findOneWhere.mockRejectedValue(error);

      const result = await controller.login(emailLoginDto, req);

      expect(providerService.findOneWhere).toHaveBeenCalled();
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('loginWithGoogle', () => {
    it('should log in with Google successfully for a existing provider', async () => {
      const status = new StatusSetting();
      status.name = active;
      const socialSignupProvider: SocialSignupProvider = {
        firebase: 'firebase_token',
        device_id: 'device_id',
        device_name: 'device_name',
        device_type: 'device_type',
        created_at_ip: '127.0.0.1',
        updated_at_ip: '127.0.0.1',
      };
      const req: any = {
        social_user: {
          email: 'example@example.com',
          user_id: 'google_user_id',
          name: 'John Doe',
        },
        headers: {
          'user-agent': 'Mozilla/5.0',
        },
      };

      // Mock providerService.findOneWhere to return null, indicating that the provider does not exist
      providerService.findOneWhere.mockResolvedValue(null);

      // Mock providerService.create to return the created provider
      providerService.create.mockResolvedValue({
        id: '1',
        email: 'example@example.com',
        first_name: 'John',
        last_name: 'Doe',
        is_active: true,
        is_email_verified: true,
        profile_image: null,
        bio: null,
        country_code: null,
        mobile_no: null,
        created_at: new Date(),
        status: status,
      });

      // Mock authService.createUserToken to return a dummy token
      generateTokenHelper.mockReturnValue(dummyToken);
      authService.createUserToken.mockResolvedValue(dummyToken);

      // Call the signupWithGoogle method
      const result = await controller.loginWithGoogle(
        socialSignupProvider,
        req,
      );

      // Expectations
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        relations: {
          certificate: true,
          address: true,
          speciality: true,
          status: true,
        },
        where: {
          email: 'example@example.com',
          profile_status: Not(USER_STATUS.deleted),
        },
        order: { created_at: 'DESC' },
      });

      expect(providerService.create).toHaveBeenCalledWith({
        email: 'example@example.com',
        google_id: 'google_user_id',
        first_name: 'John',
        last_name: 'Doe',
        is_email_verified: true,
        status: null,
      });

      expect(generateToken).toHaveBeenCalledWith(
        '1',
        'provider_id',
        'provider',
      );
      expect(authService.createUserToken).toHaveBeenCalledWith(
        {
          provider_id: '1',
          jwt: dummyToken,
          firebase: 'firebase_token',
          device_id: 'device_id',
          device_name: expect.any(String),
          device_type: 'device_type',
          created_at_ip: '127.0.0.1',
          updated_at_ip: '127.0.0.1',
        },
        'provider_id',
        'provider',
      );

      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.LOGIN,
          data: {
            id: '1',
            is_active: true,
            is_email_verified: true,
            is_signup_completed: false,
            email: 'example@example.com',
            first_name: 'John',
            last_name: 'Doe',
            base_url: undefined,
            profile_image: null,
            signature_image: undefined,
            bio: null,
            country_code: null,
            mobile_no: null,
            created_at: expect.any(Date),
            jwt: dummyToken,
          },
        }),
      );
    });

    it('should log in with Google successfully for a existing provider', async () => {
      const status = new StatusSetting();
      status.name = active;
      const socialSignupProvider: SocialSignupProvider = {
        firebase: 'firebase_token',
        device_id: 'device_id',
        device_name: 'device_name',
        device_type: 'device_type',
        created_at_ip: '127.0.0.1',
        updated_at_ip: '127.0.0.1',
      };
      const req: any = {
        social_user: {
          email: 'example@example.com',
          user_id: 'google_user_id',
          name: 'John Doe',
        },
        headers: {
          'user-agent': 'Mozilla/5.0',
        },
      };

      // Mock providerService.findOneWhere to return null, indicating that the provider does not exist
      providerService.findOneWhere.mockResolvedValue(null);

      // Mock providerService.create to return the created provider
      providerService.create.mockResolvedValue({
        id: '1',
        email: 'example@example.com',
        first_name: 'John',
        last_name: 'Doe',
        is_active: true,
        is_email_verified: true,
        profile_image: null,
        bio: null,
        country_code: null,
        mobile_no: null,
        created_at: new Date(),
        certificate: new Certificate(),
        speciality: new Speciality(),
        address: [new ProviderAddress()],
        status: status,
      });

      // Mock authService.createUserToken to return a dummy token
      generateTokenHelper.mockReturnValue(dummyToken);
      authService.createUserToken.mockResolvedValue(dummyToken);

      // Call the signupWithGoogle method
      const result = await controller.loginWithGoogle(
        socialSignupProvider,
        req,
      );

      // Expectations
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        relations: {
          certificate: true,
          address: true,
          speciality: true,
          status: true,
        },
        where: {
          email: 'example@example.com',
          profile_status: Not(USER_STATUS.deleted),
        },
        order: { created_at: 'DESC' },
      });

      expect(providerService.create).toHaveBeenCalledWith({
        email: 'example@example.com',
        google_id: 'google_user_id',
        first_name: 'John',
        last_name: 'Doe',
        is_email_verified: true,
        status: null,
      });

      expect(generateToken).toHaveBeenCalledWith(
        '1',
        'provider_id',
        'provider',
      );
      expect(authService.createUserToken).toHaveBeenCalledWith(
        {
          provider_id: '1',
          jwt: dummyToken,
          firebase: 'firebase_token',
          device_id: 'device_id',
          device_name: expect.any(String),
          device_type: 'device_type',
          created_at_ip: '127.0.0.1',
          updated_at_ip: '127.0.0.1',
        },
        'provider_id',
        'provider',
      );

      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.LOGIN,
          data: {
            id: '1',
            is_active: true,
            is_email_verified: true,
            is_signup_completed: true,
            email: 'example@example.com',
            first_name: 'John',
            last_name: 'Doe',
            base_url: undefined,
            profile_image: null,
            signature_image: undefined,
            bio: null,
            country_code: null,
            mobile_no: null,
            created_at: expect.any(Date),
            jwt: dummyToken,
          },
        }),
      );
    });

    it('should handle errors during signup process', async () => {
      const reqMock: any = {
        social_user: { email: 'test@example.com', name: 'Test User' },
      };
      const socialSignupProviderMock: any = {
        firebase: 'someFirebase',
        device_id: 'someDeviceId',
      };
      providerService.findOneWhere.mockRejectedValue(
        new Error('Failed to find user'),
      );

      const result = await controller.loginWithGoogle(
        reqMock,
        socialSignupProviderMock,
      );

      expect(result).toEqual(
        response.failureResponse(new Error('Failed to find user')),
      );
    });
  });

  describe('facilityLogin', () => {
    const emailLoginDto: EmailLoginDto = {
      email: 'test@example.com',
      password: dummyPassword,
      device_id: 'device_id',
      device_type: 'device_type',
      device_name: 'Mozilla/5.0',
      firebase: 'firebase',
      created_at_ip: '127.0.0.1',
      updated_at_ip: '127.0.0.1',
      remember_me: true,
    };
    const req = {
      user: {
        id: '1',
        first_name: 'first',
        last_name: 'last',
        role: 'admin',
        email: dummyEmail,
      },
      headers: {
        'user-agent': 'Mozilla/5.0',
      },
    } as IRequest;

    it('should return bad request if user not found', async () => {
      facilityService.findOneWhere.mockResolvedValue(null);

      const result = await controller.facilityLogin(emailLoginDto, req);

      expect(facilityService.findOneWhere).toHaveBeenCalledWith({
        where: { email: emailLoginDto.email, is_email_verified: true },
      });

      expect(result).toEqual(
        response.recordNotFound({
          message: CONSTANT.ERROR.NOT_REGISTERED,
          data: {
            email_not_registered: true,
          },
        }),
      );
    });

    it('should return bad request if credentials are wrong', async () => {
      const facility = new Facility();
      facilityService.findOneWhere.mockResolvedValue(facility);
      bcrypt.compare.mockReturnValue(false);

      facility.password = dummyPassword;
      const result = await controller.facilityLogin(emailLoginDto, req);

      expect(facilityService.findOneWhere).toHaveBeenCalledWith({
        where: { email: emailLoginDto.email, is_email_verified: true },
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        emailLoginDto.password,
        facility.password,
      );

      expect(result).toEqual(
        response.recordNotFound({
          message: CONSTANT.ERROR.WRONG_CREDENTIALS,
          data: {
            wrong_credentials: true,
          },
        }),
      );
    });

    it('should return login if credentials are correct', async () => {
      const facility = new Facility();
      const emailLoginDto: EmailLoginDto = {
        email: 'test@example.com',
        password: dummyPassword,
        device_id: 'device_id',
        device_type: 'device_type',
        device_name: 'Mozilla/5.0',
        firebase: 'firebase',
        created_at_ip: '127.0.0.1',
        updated_at_ip: '127.0.0.1',
        remember_me: true,
      };
      facilityService.findOneWhere.mockResolvedValue(facility);
      bcrypt.compare.mockReturnValue(true);
      facility.password = undefined;
      facility.id = '1';
      generateTokenHelper.mockReturnValue(dummyToken);
      authService.createUserToken.mockResolvedValue(dummyToken);

      const result = await controller.facilityLogin(emailLoginDto, req);

      expect(facilityService.findOneWhere).toHaveBeenCalledWith({
        where: { email: emailLoginDto.email, is_email_verified: true },
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        emailLoginDto.password,
        facility.password,
      );

      expect(generateToken).toHaveBeenCalledWith(
        facility.id,
        'facility_id',
        'facility',
        undefined,
      );
      expect(authService.createUserTokenV2).toHaveBeenCalledWith(
        {
          remember_me: emailLoginDto.remember_me,
          facility_id: '1',
          jwt: dummyToken,
          refresh_jwt: dummyToken,
          firebase: 'firebase',
          device_id: 'device_id',
          device_name: 'Mozilla/5.0',
          device_type: 'device_type',
          created_at_ip: '127.0.0.1',
          updated_at_ip: '127.0.0.1',
        },
        'facility_id',
        'facility',
      );

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.LOGIN,
          data: {
            id: '1',
          },
        }),
      );
    });

    it('should handle errors during login process', async () => {
      const error = new Error('Database error');

      facilityService.findOneWhere.mockRejectedValue(error);

      const result = await controller.facilityLogin(emailLoginDto, req);

      expect(facilityService.findOneWhere).toHaveBeenCalled();
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('adminLogin', () => {
    const emailLoginDto: EmailLoginDto = {
      email: 'test@example.com',
      password: dummyPassword,
      device_id: 'device_id',
      device_type: 'device_type',
      device_name: 'Mozilla/5.0',
      firebase: 'firebase',
      created_at_ip: '127.0.0.1',
      updated_at_ip: '127.0.0.1',
      remember_me: true,
    };
    const req = {
      user: {
        id: '1',
        first_name: 'first',
        last_name: 'last',
        role: 'admin',
        email: dummyEmail,
      },
      headers: {
        'user-agent': 'Mozilla/5.0',
      },
    } as IRequest;

    it('should return bad request if user not found', async () => {
      adminService.findOneWhere.mockResolvedValue(null);

      const result = await controller.adminLogin(emailLoginDto, req);

      expect(adminService.findOneWhere).toHaveBeenCalledWith({
        relations: { role: true },
        where: {
          email: emailLoginDto.email,
        },
        select: {
          role: {
            id: true,
            name: true,
          },
        },
      });

      expect(result).toEqual(
        response.recordNotFound({
          message: CONSTANT.ERROR.NOT_REGISTERED,
          data: {
            email_not_registered: true,
          },
        }),
      );
    });

    it('should return bad request if credentials are wrong', async () => {
      const admin = new Admin();
      const role = new Role();
      role.id = '1';
      admin.role = role;
      admin.password = dummyPassword;
      adminService.findOneWhere.mockResolvedValue(admin);
      roleSectionPermissionService.getSectionPermissions.mockResolvedValue([
        new RoleSectionPermission(),
      ]);
      bcrypt.compare.mockReturnValue(false);

      const result = await controller.adminLogin(emailLoginDto, req);

      expect(adminService.findOneWhere).toHaveBeenCalledWith({
        relations: { role: true },
        where: {
          email: emailLoginDto.email,
        },
        select: {
          role: {
            id: true,
            name: true,
          },
        },
      });
      expect(
        roleSectionPermissionService.getSectionPermissions,
      ).toHaveBeenCalledWith(admin.role.id);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        emailLoginDto.password,
        admin.password,
      );

      expect(result).toEqual(
        response.recordNotFound({
          message: CONSTANT.ERROR.WRONG_CREDENTIALS,
          data: {
            wrong_credentials: true,
          },
        }),
      );
    });

    it('should return login if credentials are correct', async () => {
      const admin = new Admin();

      const emailLoginDto: EmailLoginDto = {
        email: 'test@example.com',
        password: dummyPassword,
        device_id: 'device_id',
        device_type: 'device_type',
        device_name: 'Mozilla/5.0',
        firebase: 'firebase',
        created_at_ip: '127.0.0.1',
        updated_at_ip: '127.0.0.1',
        remember_me: true,
      };
      adminService.findOneWhere.mockResolvedValue(admin);
      bcrypt.compare.mockReturnValue(true);
      admin.id = '1';
      admin.password = dummyPassword;
      generateTokenHelper.mockReturnValue(dummyToken);
      authService.createUserToken.mockResolvedValue(dummyToken);
      columnsPreferenceService.findOne.mockResolvedValue(null);

      const result = await controller.adminLogin(emailLoginDto, req);

      expect(adminService.findOneWhere).toHaveBeenCalledWith({
        relations: { role: true },
        where: {
          email: emailLoginDto.email,
        },
        select: {
          role: {
            id: true,
            name: true,
          },
        },
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        emailLoginDto.password,
        dummyPassword,
      );

      expect(generateToken).toHaveBeenCalledWith(
        admin.id,
        'admin_id',
        'admin',
        undefined, // Add the undefined parameter to match actual call
      );
      expect(authService.createUserTokenV2).toHaveBeenCalledWith(
        {
          remember_me: emailLoginDto.remember_me,
          admin_id: admin.id,
          jwt: dummyToken,
          refresh_jwt: dummyToken,
          firebase: 'firebase',
          device_id: 'device_id',
          device_name: 'Mozilla/5.0',
          device_type: 'device_type',
          created_at_ip: '127.0.0.1',
          updated_at_ip: '127.0.0.1',
        },
        'admin_id',
        'admin',
      );

      expect(columnsPreferenceService.findOne).toHaveBeenCalledWith({
        where: { user_id: admin.id, table_type: 'shift' },
      });

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.LOGIN,
          data: {
            id: '1',
            permissions: [],
            columns_preference: ShiftTableColumns,
          },
        }),
      );
    });

    it('should return bad request if credentials are wrong', async () => {
      const admin = new Admin();
      const role = new Role();
      role.id = '1';
      admin.role = role;
      admin.password = null;
      adminService.findOneWhere.mockResolvedValue(admin);
      roleSectionPermissionService.getSectionPermissions.mockResolvedValue([
        new RoleSectionPermission(),
      ]);

      const result = await controller.adminLogin(emailLoginDto, req);

      expect(adminService.findOneWhere).toHaveBeenCalledWith({
        relations: { role: true },
        where: {
          email: emailLoginDto.email,
        },
        select: {
          role: {
            id: true,
            name: true,
          },
        },
      });
      expect(
        roleSectionPermissionService.getSectionPermissions,
      ).toHaveBeenCalledWith(admin.role.id);
      expect(result).toEqual(
        response.recordNotFound({
          message: CONSTANT.ERROR.WRONG_CREDENTIALS,
          data: {
            wrong_credentials: true,
          },
        }),
      );
    });

    it('should handle errors during login process', async () => {
      const error = new Error('Database error');

      adminService.findOneWhere.mockRejectedValue(error);

      const result = await controller.adminLogin(emailLoginDto, req);

      expect(adminService.findOneWhere).toHaveBeenCalled();
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('forgotPassword', () => {
    const verifyEmailDto: VerifyEmailDto = {
      email: 'nonexistent@example.com',
      updated_at_ip: '127.0.0.1',
    };

    it('should handle invalid table name', async () => {
      const table: any = 'invalidTable';

      const result = await controller.forgotPassword(table, verifyEmailDto);

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.SOMETHING_WENT_WRONG,
          data: {},
        }),
      );
    });

    it('should return bad request if user is not exist', async () => {
      const table = 'facility_user';
      facilityUserService.findOneWhere.mockResolvedValue(null);

      const result = await controller.forgotPassword(table, verifyEmailDto);
      expect(facilityUserService.findOneWhere).toHaveBeenCalledWith({
        where: {
          email: verifyEmailDto.email,
        },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(
        response.recordNotFound({
          message: CONSTANT.ERROR.NOT_REGISTERED,
          data: {
            email_not_registered: true,
          },
        }),
      );
    });
    it('should return bad request if user exist', async () => {
      const table = 'facility_user';
      const user = new FacilityUser();
      user.email = 'test@mail.com';
      facilityUserService.findOneWhere.mockResolvedValue(user);
      authService.sendForgotPasswordOTP.mockResolvedValue(null);

      const result = await controller.forgotPassword(table, verifyEmailDto);
      expect(facilityUserService.findOneWhere).toHaveBeenCalledWith({
        where: {
          email: verifyEmailDto.email,
        },
        order: { created_at: 'DESC' },
      });

      expect(authService.sendForgotPasswordOTP).toHaveBeenCalledWith(
        user,
        table,
      );

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.EMAIL.SENT,
          data: {},
        }),
      );
    });

    it('should handle errors during login process', async () => {
      const error = new Error('Database error');
      const table = 'facility_user';
      facilityUserService.findOneWhere.mockRejectedValue(error);

      const result = await controller.forgotPassword(table, verifyEmailDto);

      expect(facilityUserService.findOneWhere).toHaveBeenCalledWith({
        where: {
          email: verifyEmailDto.email,
        },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('resetPassword', () => {
    const resetPasswordDto: ResetPasswordDto = {
      email: 'test@gmail.com',
      password: dummyPassword,
      updated_at_ip: '127.0.0.1',
    };
    it('should handle invalid table name', async () => {
      const table: any = 'invalidTable';

      const result = await controller.resetPassword(table, resetPasswordDto);

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.SOMETHING_WENT_WRONG,
          data: {},
        }),
      );
    });

    it('should return bad request if user is not exist', async () => {
      const table = 'facility_user';
      facilityUserService.findOneWhere.mockResolvedValue(null);

      const result = await controller.resetPassword(table, resetPasswordDto);
      expect(facilityUserService.findOneWhere).toHaveBeenCalledWith({
        where: {
          email: resetPasswordDto.email,
        },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
          data: {},
        }),
      );
    });

    it('should update user', async () => {
      const table = 'facility_user';
      const user = new FacilityUser();
      facilityUserService.findOneWhere.mockResolvedValue(user);
      user.id = '1';
      facilityUserService.update.mockResolvedValue(null);
      authService.isInvitationExist.mockResolvedValue(new Invite());
      bcrypt.hash.mockResolvedValue(dummyPassword);

      const result = await controller.resetPassword(table, resetPasswordDto);
      expect(bcrypt.hash).toHaveBeenCalledWith(resetPasswordDto.password, salt);
      expect(facilityUserService.findOneWhere).toHaveBeenCalledWith({
        where: {
          email: resetPasswordDto.email,
        },
        order: { created_at: 'DESC' },
      });
      expect(facilityUserService.update).toHaveBeenCalledWith(
        user.id,
        resetPasswordDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.PASSWORD_RESET,
          data: {},
        }),
      );
    });

    it('should handle errors during login process', async () => {
      const error = new Error('Database error');
      const table = 'facility_user';
      facilityUserService.findOneWhere.mockRejectedValue(error);

      const result = await controller.resetPassword(table, resetPasswordDto);

      expect(facilityUserService.findOneWhere).toHaveBeenCalled();
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('changePassword', () => {
    const changePasswordDto: ChangePasswordDto = {
      email: dummyEmail,
      old_password: dummyPassword,
      new_password: dummyPassword,
      updated_at_ip: '127.0.0.1',
    };
    const req = {
      user: {
        id: '1',
        first_name: 'first',
        last_name: 'last',
        role: 'admin',
        email: dummyEmail,
      },
      headers: {
        'user-agent': 'Mozilla/5.0',
      },
    } as IRequest;
    it('should handle invalid table name', async () => {
      const table: any = 'invalidTable';

      const result = await controller.changePassword(
        table,
        changePasswordDto,
        req,
      );

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.SOMETHING_WENT_WRONG,
          data: {},
        }),
      );
    });

    it('should return bad request if user is not exist', async () => {
      const table = 'facility_user';
      facilityUserService.findOneWhere.mockResolvedValue(null);

      const result = await controller.changePassword(
        table,
        changePasswordDto,
        req,
      );
      expect(facilityUserService.findOneWhere).toHaveBeenCalledWith({
        where: {
          email: changePasswordDto.email,
        },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.WRONG_CREDENTIALS,
          data: {},
        }),
      );
    });

    it('should return bad request if credentials are wrong', async () => {
      const table = 'facility';
      const facility = new Facility();
      facilityService.findOneWhere.mockResolvedValue(facility);
      bcrypt.compare.mockReturnValue(false);
      facilityService.update.mockResolvedValue(null);

      facility.password = dummyPassword;
      const result = await controller.changePassword(
        table,
        changePasswordDto,
        req,
      );

      expect(facilityService.findOneWhere).toHaveBeenCalledWith({
        where: { email: changePasswordDto.email },
        order: { created_at: 'DESC' },
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        changePasswordDto.old_password,
        facility.password,
      );

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.INVALID_PASSWORD,
          data: {},
        }),
      );
    });

    it('should update password if credentials are correct', async () => {
      const table = 'facility';
      const facility = new Facility();
      facilityService.findOneWhere.mockResolvedValue(facility);
      bcrypt.compare.mockReturnValue(true);
      bcrypt.hash.mockResolvedValue(dummyPassword);
      facility.id = '1';
      facility.password = dummyPassword;
      const result = await controller.changePassword(
        table,
        changePasswordDto,
        req,
      );

      expect(facilityService.findOneWhere).toHaveBeenCalledWith({
        where: { email: changePasswordDto.email },
        order: { created_at: 'DESC' },
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        changePasswordDto.old_password,
        facility.password,
      );

      expect(bcrypt.hash).toHaveBeenCalledWith(
        changePasswordDto.new_password,
        10,
      );

      expect(facilityService.update).toHaveBeenCalledWith(facility.id, {
        password: dummyPassword,
        updated_at_ip: changePasswordDto.updated_at_ip,
        email: changePasswordDto.email,
      });

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Password'),
          data: {},
        }),
      );
    });

    it('should handle errors during login process', async () => {
      const error = new Error('Database error');
      const table = 'facility';
      facilityService.findOneWhere.mockRejectedValue(error);

      const result = await controller.changePassword(
        table,
        changePasswordDto,
        req,
      );

      expect(facilityService.findOneWhere).toHaveBeenCalled();
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('facilityUserLogin', () => {
    const emailLoginDto: EmailLoginDto = {
      email: 'test@example.com',
      password: dummyPassword,
      device_id: 'device_id',
      device_type: 'device_type',
      device_name: 'Mozilla/5.0',
      firebase: 'firebase',
      created_at_ip: '127.0.0.1',
      updated_at_ip: '127.0.0.1',
      remember_me: true,
    };
    const req = {
      user: { id: '1', first_name: 'first', last_name: 'last', role: 'admin' },
      headers: {
        'user-agent': 'Mozilla/5.0',
      },
    } as IRequest;

    it('should return bad request if user not found', async () => {
      facilityUserService.findOneWhere.mockResolvedValue(null);
      facilityService.findOneWhere.mockResolvedValue(null);

      const result = await controller.facilityUserLogin(emailLoginDto, req);

      expect(facilityUserService.findOneWhere).toHaveBeenCalledWith({
        where: {
          email: emailLoginDto.email,
          is_email_verified: true,
        },
      });

      expect(result).toEqual(
        response.recordNotFound({
          message: CONSTANT.ERROR.NOT_REGISTERED,
          data: {
            email_not_registered: true,
          },
        }),
      );
    });

    it('should return bad request if credentials are wrong', async () => {
      const facilityUser = new FacilityUser();
      const facility = new Facility();
      facility.id = 'facility-1';
      const status = new StatusSetting();
      status.name = active;
      facility.status = status;
      facilityUser.facility_id = [facility.id];
      facilityUserService.findOneWhere.mockResolvedValue(facilityUser);
      facilityService.findOneWhere.mockResolvedValue(facility);
      bcrypt.compare.mockReturnValue(false);
      facilityUserService.getFacilityUserPermissions.mockResolvedValue([]);
      facilityUser.id = '1';
      facilityUser.password = dummyPassword;
      const result = await controller.facilityUserLogin(emailLoginDto, req);

      expect(facilityUserService.findOneWhere).toHaveBeenCalledWith({
        where: {
          email: emailLoginDto.email,
          is_email_verified: true,
        },
      });

      expect(
        facilityUserService.getFacilityUserPermissions,
      ).toHaveBeenCalledWith(facilityUser.id);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        emailLoginDto.password,
        facilityUser.password,
      );

      expect(result).toEqual(
        response.recordNotFound({
          message: CONSTANT.ERROR.WRONG_CREDENTIALS,
          data: {
            wrong_credentials: true,
          },
        }),
      );
    });

    it('should return login if credentials are correct', async () => {
      const facilityUser = new FacilityUser();
      const facilityUserPermission = new FacilityUserPermission();
      const facility = new Facility();
      facility.id = 'facility-1';
      const status = new StatusSetting();
      status.name = active;
      facility.status = status;

      const emailLoginDto: EmailLoginDto = {
        email: 'test@example.com',
        password: dummyPassword,
        device_id: 'device_id',
        device_type: 'device_type',
        device_name: 'Mozilla/5.0',
        firebase: 'firebase',
        created_at_ip: '127.0.0.1',
        updated_at_ip: '127.0.0.1',
        remember_me: true,
      };
      facilityUser.id = '1';
      facilityUser.password = undefined;
      facilityUser.facility_id = [facility.id];
      // facilityUser.email = emailLoginDto.email;
      // facilityUser.is_email_verified = true;
      facilityUserPermission.has_access = true;
      facilityUserPermission.facility_user =
        facilityUserService.findOneWhere.mockResolvedValue(facilityUser);

      // facilityUserService.findOneWhere.mockResolvedValue(facilityUser);
      facilityService.findOneWhere.mockResolvedValue(facility);
      bcrypt.compare.mockReturnValue(true);
      generateTokenHelper.mockReturnValue(dummyToken);
      authService.createUserToken.mockResolvedValue(dummyToken);

      const permission = {
        id: '123',
        name: 'Test Permission',
      };

      facilityUserService.getFacilityUserPermissions.mockResolvedValue([
        {
          id: 'perm-1',
          has_access: true,
          facility_permission: permission,
        },
      ]);
      const result = await controller.facilityUserLogin(emailLoginDto, req);

      expect(facilityUserService.findOneWhere).toHaveBeenCalledWith({
        where: {
          email: emailLoginDto.email,
          is_email_verified: true,
        },
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        emailLoginDto.password,
        facilityUser.password,
      );

      expect(generateToken).toHaveBeenCalledWith(
        facilityUser.id,
        'facility_user_id',
        'facility_user',
        undefined,
      );
      expect(authService.createUserTokenV2).toHaveBeenCalledWith(
        {
          remember_me: emailLoginDto.remember_me,
          facility_user_id: '1',
          jwt: dummyToken,
          refresh_jwt: dummyToken,
          firebase: 'firebase',
          device_id: 'device_id',
          device_name: 'Mozilla/5.0',
          device_type: 'device_type',
          created_at_ip: '127.0.0.1',
          updated_at_ip: '127.0.0.1',
        },
        'facility_user_id',
        'facility_user',
      );

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.LOGIN,
          data: {
            id: '1',
            facility_id: ['facility-1'],
            permissions: [
              {
                id: 'perm-1',
                has_access: true,
                facility_permission: {
                  id: '123',
                  name: 'Test Permission',
                },
              },
            ],
          },
        }),
      );
    });

    it('should handle errors during login process', async () => {
      const error = new Error('Database error');

      facilityUserService.findOneWhere.mockRejectedValue(error);

      const result = await controller.facilityUserLogin(emailLoginDto, req);

      expect(facilityUserService.findOneWhere).toHaveBeenCalled();
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('acceptInvitation', () => {
    const acceptInvitationDto = new AcceptInvitationDto();
    const id = '1';
    const type = LINK_TYPE.invitation;

    it('should handle invalid table name', async () => {
      const table: any = 'invalidTable';

      const result = await controller.acceptInvitation(
        table,
        '1',
        acceptInvitationDto,
      );

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.SOMETHING_WENT_WRONG,
          data: {},
        }),
      );
    });

    it('should return bad request if user does not exist', async () => {
      facilityUserService.findOneWhere = jest.fn().mockResolvedValue(null);

      const result = await controller.acceptInvitation(
        TABLE.facility_user,
        '1',
        acceptInvitationDto,
      );

      expect(facilityUserService.findOneWhere).toHaveBeenCalledWith({
        where: {
          email: acceptInvitationDto.email,
          id: undefined,
        },
      });

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
          data: {},
        }),
      );
    });

    it('should return bad request if invitation is already accepted', async () => {
      const mockUser = new FacilityUser();
      mockUser.status = ENTITY_STATUS.active;

      facilityUserService.findOneWhere = jest.fn().mockResolvedValue(mockUser);

      const result = await controller.acceptInvitation(
        TABLE.facility_user,
        '1',
        acceptInvitationDto,
      );

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.INVITATION_ALREADY_ACCEPTED,
          data: {},
        }),
      );
    });

    it('should return bad request if invitation is expired', async () => {
      const mockUser = new FacilityUser();
      mockUser.status = ENTITY_STATUS.invited;

      facilityUserService.findOneWhere = jest.fn().mockResolvedValue(mockUser);
      authService.isInvitationExpired = jest.fn().mockResolvedValue(true);

      const result = await controller.acceptInvitation(
        TABLE.facility_user,
        id,
        acceptInvitationDto,
      );

      expect(authService.isInvitationExpired).toHaveBeenCalledWith(
        mockUser,
        TABLE.facility_user,
        type,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.INVITATION_EXPIRED,
          data: {},
        }),
      );
    });

    it('should accept invitation successfully', async () => {
      const mockUser = new FacilityUser();
      mockUser.status = ENTITY_STATUS.invited;
      acceptInvitationDto.password = 'password';
      facilityUserService.findOneWhere.mockResolvedValue(mockUser);
      authService.isInvitationExist.mockResolvedValue(new Invite());
      authService.isInvitationExpired.mockResolvedValue(false);
      bcrypt.hash.mockResolvedValue(dummyPassword);
      encryptDecryptService.decrypt.mockResolvedValue('decrypt-id');
      facilityUserService.update.mockResolvedValue({ affected: 0 });
      const result = await controller.acceptInvitation(
        TABLE.facility_user,
        '1',
        acceptInvitationDto,
      );

      expect(facilityUserService.findOneWhere).toHaveBeenCalledWith({
        where: {
          email: acceptInvitationDto.email,
          id: 'decrypt-id',
        },
      });
      expect(authService.isInvitationExist).toHaveBeenCalledWith(
        mockUser,
        TABLE.facility_user,
        type,
      );
      expect(authService.isInvitationExpired).toHaveBeenCalledWith(
        mockUser,
        TABLE.facility_user,
        type,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('password', salt);
      expect(encryptDecryptService.decrypt).toHaveBeenCalledWith(id);
      expect(facilityUserService.update).toHaveBeenCalledWith('decrypt-id', {
        ...acceptInvitationDto,
        is_email_verified: true,
        status: ENTITY_STATUS.active,
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
          data: {},
        }),
      );
    });

    it('should accept invitation successfully', async () => {
      const mockUser = new FacilityUser();
      mockUser.status = ENTITY_STATUS.invited;
      acceptInvitationDto.password = 'password';
      facilityUserService.findOneWhere.mockResolvedValue(mockUser);
      authService.isInvitationExist.mockResolvedValue(new Invite());
      authService.isInvitationExpired.mockResolvedValue(false);
      bcrypt.hash.mockResolvedValue(dummyPassword);
      encryptDecryptService.decrypt.mockResolvedValue('decrypt-id');
      facilityUserService.update.mockResolvedValue({ affected: 1 });
      const result = await controller.acceptInvitation(
        TABLE.facility_user,
        '1',
        acceptInvitationDto,
      );

      expect(facilityUserService.findOneWhere).toHaveBeenCalledWith({
        where: {
          email: acceptInvitationDto.email,
          id: 'decrypt-id',
        },
      });
      expect(authService.isInvitationExist).toHaveBeenCalledWith(
        mockUser,
        TABLE.facility_user,
        type,
      );
      expect(authService.isInvitationExpired).toHaveBeenCalledWith(
        mockUser,
        TABLE.facility_user,
        type,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('password', salt);
      expect(encryptDecryptService.decrypt).toHaveBeenCalledWith(id);
      expect(facilityUserService.update).toHaveBeenCalledWith('decrypt-id', {
        ...acceptInvitationDto,
        is_email_verified: true,
        status: ENTITY_STATUS.active,
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SIGN_UP,
          data: {},
        }),
      );
    });

    it('should return failure response if an error occurs', async () => {
      const error = new Error('Test error');

      facilityUserService.findOneWhere = jest.fn().mockRejectedValue(error);

      const result = await controller.acceptInvitation(
        TABLE.facility_user,
        '1',
        acceptInvitationDto,
      );

      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('resetPassword', () => {
    const resetPasswordDto: ResetPasswordDto = {
      email: 'test@gmail.com',
      password: dummyPassword,
      updated_at_ip: '127.0.0.1',
    };

    it('should handle invalid table name', async () => {
      const table: any = 'invalidTable';

      const result = await controller.resetPassword(table, resetPasswordDto);

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.SOMETHING_WENT_WRONG,
          data: {},
        }),
      );
    });

    it('should return bad request if user does not exist', async () => {
      const table = 'facility_user';
      facilityUserService.findOneWhere.mockResolvedValue(null);
      const result = await controller.resetPassword(table, resetPasswordDto);

      expect(facilityUserService.findOneWhere).toHaveBeenCalledWith({
        where: {
          email: resetPasswordDto.email,
        },

        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
          data: {},
        }),
      );
    });

    it('should return bad request if invitation has expired', async () => {
      const table = 'facility_user';
      const user = new FacilityUser();
      user.id = '1';
      facilityUserService.findOneWhere.mockResolvedValue(user);
      authService.isInvitationExpired.mockResolvedValue(true);

      const result = await controller.resetPassword(table, resetPasswordDto);
      expect(authService.isInvitationExpired).toHaveBeenCalledWith(
        user,
        table,
        'forgot_password' as LINK_TYPE,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.URL_EXPIRED,
          data: {},
        }),
      );
    });

    it('should handle errors during the password reset process', async () => {
      const error = new Error('Database error');
      const table = 'facility_user';
      facilityUserService.findOneWhere = jest.fn().mockRejectedValue(error);

      const result = await controller.resetPassword(table, resetPasswordDto);

      expect(facilityUserService.findOneWhere).toHaveBeenCalled();
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getProfileData', () => {
    const id = '1';
    const invite_id = 'invite-123';
    const type = LINK_TYPE.invitation;
    it('should handle invalid table name', async () => {
      const table: any = 'invalidTable';

      const result = await controller.getProfileData(table, id, invite_id);

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.SOMETHING_WENT_WRONG,
          data: {},
        }),
      );
    });

    it('should return bad request if user does not exist', async () => {
      const table = 'facility_user';
      facilityUserService.findOneWhere.mockResolvedValue(null);
      encryptDecryptService.decrypt.mockResolvedValue('decrypt-id');
      const result = await controller.getProfileData(table, id, invite_id);

      expect(facilityUserService.findOneWhere).toHaveBeenCalledWith({
        where: { id: 'decrypt-id' },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
          data: {},
        }),
      );
    });

    it('should return bad request if invitation has expired', async () => {
      const table = 'facility_user';
      const user = new FacilityUser();
      facilityUserService.findOneWhere.mockResolvedValue(user);
      authService.isInvitationExistV2.mockResolvedValue(true); // invitation exists
      authService.isInvitationExpired.mockResolvedValue(true); // but it's expired

      const result = await controller.getProfileData(table, id, invite_id);

      expect(authService.isInvitationExistV2).toHaveBeenCalledWith(
        user,
        table,
        type,
        invite_id,
      );
      expect(authService.isInvitationExpired).toHaveBeenCalledWith(
        user,
        table,
        type,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.URL_EXPIRED,
          data: {},
        }),
      );
    });

    it('should return success response with data', async () => {
      const table = 'facility_user';
      const user = new FacilityUser();
      user.id = '1';
      facilityUserService.findOneWhere.mockResolvedValue(user);
      authService.isInvitationExistV2.mockResolvedValue(true); // invitation exists
      authService.isInvitationExpired.mockResolvedValue(false); // and it's not expired

      const result = await controller.getProfileData(table, id, invite_id);

      expect(authService.isInvitationExistV2).toHaveBeenCalledWith(
        user,
        table,
        type,
        invite_id,
      );
      expect(authService.isInvitationExpired).toHaveBeenCalledWith(
        user,
        table,
        type,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Record'),
          data: user,
        }),
      );
    });

    it('should handle errors during the password reset process', async () => {
      const error = new Error('Database error');
      const table = 'facility_user';
      facilityUserService.findOneWhere = jest.fn().mockRejectedValue(error);

      const result = await controller.getProfileData(table, id, invite_id);

      expect(facilityUserService.findOneWhere).toHaveBeenCalled();
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('checkLinkStatus', () => {
    const email = dummyEmail;
    it('should return bad request if invitation has expired', async () => {
      const table = TABLE.facility_user;
      const user = new FacilityUser();
      const type = LINK_TYPE.forgot_password;
      facilityUserService.findOneWhere.mockResolvedValue(user);
      authService.isInvitationExist.mockResolvedValue(null);
      authService.isInvitationExpired.mockResolvedValue(true);

      const result = await controller.checkLinkStatus(table, email);
      expect(authService.isInvitationExpired).toHaveBeenCalledWith(
        user,
        table,
        type,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.URL_EXPIRED,
          data: {},
        }),
      );
    });

    it('should return bad request if invitation has expired', async () => {
      const table = TABLE.facility_user;
      const user = new FacilityUser();
      const type = LINK_TYPE.forgot_password;
      facilityUserService.findOneWhere.mockResolvedValue(user);
      encryptDecryptService.decrypt.mockResolvedValue('decrypt-email');
      authService.isInvitationExist.mockResolvedValue(new Invite());
      authService.isInvitationExpired.mockResolvedValue(false);

      const result = await controller.checkLinkStatus(table, email);
      expect(authService.isInvitationExpired).toHaveBeenCalledWith(
        user,
        table,
        type,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.DEFAULT,
          data: {},
        }),
      );
    });

    it('should return failure response if an error occurs', async () => {
      const error = new Error('Test error');

      facilityUserService.findOneWhere.mockRejectedValue(error);

      const result = await controller.checkLinkStatus(
        TABLE.facility_user,
        email,
      );

      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('sendInvitation', () => {
    const verifyEmailDto: VerifyEmailDto = {
      email: 'john@example.com',
      updated_at_ip: '',
    };
    const req = {
      user: {
        id: '1',
        first_name: 'first',
        last_name: 'last',
        role: 'admin',
        email: dummyEmail,
      },
      headers: {
        'user-agent': 'Mozilla/5.0',
      },
    } as IRequest;
    it('should handle invalid table name', async () => {
      const table: any = 'invalidTable';

      const result = await controller.sendInvitation(
        table,
        verifyEmailDto,
        req,
        'facility-id',
      );

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.SOMETHING_WENT_WRONG,
          data: {},
        }),
      );
    });
    it('should return bad request if user is not exist', async () => {
      facilityUserService.findOneWhere.mockResolvedValue(null);

      const result = await controller.sendInvitation(
        'facility_user',
        verifyEmailDto,
        req,
        'facility-id',
      );
      expect(facilityUserService.findOneWhere).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
          data: {},
        }),
      );
    });
    it('should send invitation if user exist', async () => {
      const mockFacility = new Facility();
      mockFacility.name = 'Test Facility';

      facilityUserService.findOneWhere.mockResolvedValue(new FacilityUser());
      facilityService.findOneWhere.mockResolvedValue(mockFacility);
      adminService.contactActivityLog.mockResolvedValue(null);
      const result = await controller.sendInvitation(
        'facility_user',
        verifyEmailDto,
        req,
        'facility-id',
      );
      expect(facilityUserService.findOneWhere).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
      expect(facilityService.findOneWhere).toHaveBeenCalledWith({
        where: { id: 'facility-id' },
      });
      expect(authService.sendInvitation).toHaveBeenCalledWith(
        { ...new FacilityUser(), status: ENTITY_STATUS.invited },
        'facility_user',
        mockFacility.name,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.EMAIL.SENT,
          data: {},
        }),
      );
    });
    it('should return failure response if an error occurs', async () => {
      const error = new Error('Test error');

      facilityUserService.findOneWhere.mockRejectedValue(error);

      const result = await controller.sendInvitation(
        'facility_user',
        verifyEmailDto,
        req,
        'facility-id',
      );

      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('logout', () => {
    const req = {
      headers: { authorization: `Bearer ${dummyToken}` },
      user: { id: '1', role: 'admin' },
      body: { updated_at_ip: '127.0.0.1' },
    };
    // const token = req.headers.authorization.split(' ')[1];

    it('should throw bad request if token does not exist', async () => {
      mockTokenRepository.findOne.mockResolvedValue(null);
      const result = await controller.logout(req);
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.SOMETHING_WENT_WRONG,
          data: {},
        }),
      );
    });

    it('should return success if token exists', async () => {
      mockTokenRepository.findOne.mockResolvedValue(new Token());
      mockTokenRepository.update.mockResolvedValue({ affected: 1 });
      const result = await controller.logout(req);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.LOGOUT,
          data: {},
        }),
      );
    });

    it('should return success if token exists', async () => {
      mockTokenRepository.findOne.mockResolvedValue(new Token());
      mockTokenRepository.update.mockResolvedValue({ affected: 0 });
      const result = await controller.logout(req);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.SOMETHING_WENT_WRONG,
          data: {},
        }),
      );
    });

    it('should return failure response if an error occurs', async () => {
      const error = new Error('Test error');
      mockTokenRepository.findOne.mockRejectedValue(error);
      const result = await controller.logout(req);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('signupWithApple', () => {
    it('should sign up with Apple successfully for a new provider', async () => {
      const status = new StatusSetting();
      status.name = active;
      const appleSignupDto: AppleSignupDto = {
        firebase: 'firebase_token',
        device_id: 'device_id',
        device_name: 'device_name',
        device_type: 'device_type',
        created_at_ip: '127.0.0.1',
        updated_at_ip: '127.0.0.1',
        is_private_email: true,
        mobile_no: '1324687',
        display_name: 'Test',
        email: 'example@example.com',
        uid: 'google_user_id',
      };
      const req: any = {
        social_user: {
          email: 'example@example.com',
          user_id: 'google_user_id',
          name: 'John Doe',
        },
      };
      const provider = new Provider();
      provider.is_email_verified = true;
      // Mock providerService.findOneWhere to return null, indicating that the provider does not exist
      providerService.findOneWhere.mockResolvedValue(null);

      // Mock providerService.create to return the created provider
      providerService.create.mockResolvedValue({
        id: '1',
        email: 'example@example.com',
        first_name: 'John',
        last_name: 'Doe',
        is_active: true,
        is_email_verified: true,
        profile_image: null,
        bio: null,
        country_code: null,
        mobile_no: null,
        created_at: new Date(),
        status: status,
      });

      // Mock authService.createUserToken to return a dummy token
      generateTokenHelper.mockReturnValue(dummyToken);
      authService.createUserToken.mockResolvedValue(dummyToken);

      // Call the signupWithGoogle method
      const result = await controller.signupWithApple(req, appleSignupDto);

      // Expectations
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        relations: {
          certificate: true,
          address: true,
          speciality: true,
          status: true,
        },
        where: {
          apple_id: req.social_user.user_id,
          profile_status: Not(USER_STATUS.deleted),
        },
        order: { created_at: 'DESC' },
      });

      expect(providerService.create).toHaveBeenCalledWith({
        email: null,
        apple_id: 'google_user_id',
        is_email_verified: true,
        status: null,
      });

      expect(generateToken).toHaveBeenCalledWith(
        '1',
        'provider_id',
        'provider',
      );
      expect(authService.createUserToken).toHaveBeenCalledWith(
        {
          provider_id: '1',
          jwt: dummyToken,
          firebase: 'firebase_token',
          device_id: 'device_id',
          device_name: 'device_name',
          device_type: 'device_type',
          created_at_ip: '127.0.0.1',
          updated_at_ip: '127.0.0.1',
        },
        'provider_id',
        'provider',
      );

      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.SIGN_UP,
          data: {
            id: '1',
            is_active: true,
            is_email_verified: true,
            is_signup_completed: false,
            email: 'example@example.com',
            first_name: 'John',
            last_name: 'Doe',
            base_url: undefined,
            profile_image: null,
            signature_image: undefined,
            bio: null,
            country_code: null,
            mobile_no: null,
            created_at: expect.any(Date),
            jwt: dummyToken,
          },
        }),
      );
    });

    it('should sign up with Apple successfully for a new provider', async () => {
      const status = new StatusSetting();
      status.name = active;
      const appleSignupDto: AppleSignupDto = {
        firebase: 'firebase_token',
        device_id: 'device_id',
        device_name: 'device_name',
        device_type: 'device_type',
        created_at_ip: '127.0.0.1',
        updated_at_ip: '127.0.0.1',
        is_private_email: false,
        mobile_no: '1324687',
        display_name: 'Test',
        email: 'example@example.com',
        uid: 'google_user_id',
      };
      const req: any = {
        social_user: {
          email: 'example@example.com',
          user_id: 'google_user_id',
          name: 'John Doe',
        },
      };

      // Mock providerService.findOneWhere to return null, indicating that the provider does not exist
      providerService.findOneWhere.mockResolvedValue(null);

      // Mock providerService.create to return the created provider
      providerService.create.mockResolvedValue({
        id: '1',
        email: 'example@example.com',
        first_name: 'John',
        last_name: 'Doe',
        is_active: true,
        is_email_verified: true,
        profile_image: null,
        bio: null,
        country_code: null,
        mobile_no: null,
        created_at: new Date(),
        certificate: new Certificate(),
        speciality: new Speciality(),
        address: [new ProviderAddress()],
        status: status,
      });

      // Mock authService.createUserToken to return a dummy token
      generateTokenHelper.mockReturnValue(dummyToken);
      authService.createUserToken.mockResolvedValue(dummyToken);

      // Call the signupWithGoogle method
      const result = await controller.signupWithApple(req, appleSignupDto);

      // Expectations
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        relations: {
          certificate: true,
          address: true,
          speciality: true,
          status: true,
        },
        where: {
          apple_id: req.social_user.user_id,
          profile_status: Not(USER_STATUS.deleted),
        },
        order: { created_at: 'DESC' },
      });

      expect(providerService.create).toHaveBeenCalledWith({
        email: 'example@example.com',
        apple_id: 'google_user_id',
        is_email_verified: true,
        status: null,
      });

      expect(generateToken).toHaveBeenCalledWith(
        '1',
        'provider_id',
        'provider',
      );
      expect(authService.createUserToken).toHaveBeenCalledWith(
        {
          provider_id: '1',
          jwt: dummyToken,
          firebase: 'firebase_token',
          device_id: 'device_id',
          device_name: 'device_name',
          device_type: 'device_type',
          created_at_ip: '127.0.0.1',
          updated_at_ip: '127.0.0.1',
        },
        'provider_id',
        'provider',
      );

      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.SIGN_UP,
          data: {
            id: '1',
            is_active: true,
            is_email_verified: true,
            is_signup_completed: true,
            email: 'example@example.com',
            first_name: 'John',
            last_name: 'Doe',
            base_url: undefined,
            profile_image: null,
            signature_image: undefined,
            bio: null,
            country_code: null,
            mobile_no: null,
            created_at: expect.any(Date),
            jwt: dummyToken,
          },
        }),
      );
    });

    it('should handle errors during signup process', async () => {
      const reqMock: any = {
        social_user: { email: 'test@example.com', name: 'Test User' },
      };
      const socialSignupProviderMock: any = {
        firebase: 'someFirebase',
        device_id: 'someDeviceId',
      };
      providerService.findOneWhere.mockRejectedValue(
        new Error('Failed to find user'),
      );

      const result = await controller.signupWithApple(
        reqMock,
        socialSignupProviderMock,
      );

      expect(result).toEqual(
        response.failureResponse(new Error('Failed to find user')),
      );
    });
  });

  describe('sendOtpForChangeContact', () => {
    const req = {
      user: {
        id: '1',
        first_name: 'first',
        last_name: 'last',
        role: 'admin',
        email: dummyEmail,
      },
      headers: {
        'user-agent': 'Mozilla/5.0',
      },
    } as IRequest;
    const sendOtpDto: SendOtpDto = {
      country_code: '+1',
      mobile_no: '1234567890',
      created_at_ip: '127.0.0.1',
      updated_at_ip: '127.0.0.1',
    };

    it('return bad request if same number', async () => {
      providerService.findOneWhere.mockResolvedValue({
        id: '1',
      });

      const result = await controller.sendOtpForChangeContact(sendOtpDto, req);

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.SAME_NUMBER,
          data: {},
        }),
      );
    });

    it('return bad request if same number', async () => {
      providerService.findOneWhere.mockResolvedValue({
        id: '2',
      });

      const result = await controller.sendOtpForChangeContact(sendOtpDto, req);

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Contact number'),
          data: {},
        }),
      );
    });

    it('send otp if valid data', async () => {
      providerService.findOneWhere.mockResolvedValue(null);
      authService.sendOtpForChangeContactNumber.mockResolvedValue();

      const result = await controller.sendOtpForChangeContact(sendOtpDto, req);

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.COMPLETE_VERIFICATION(''),
          data: {},
        }),
      );
    });

    it('should handle errors during signup process', async () => {
      providerService.findOneWhere.mockRejectedValue(
        new Error('Failed to find user'),
      );

      const result = await controller.sendOtpForChangeContact(sendOtpDto, req);

      expect(result).toEqual(
        response.failureResponse(new Error('Failed to find user')),
      );
    });
  });

  describe('verifyContactChangeOtp', () => {
    const verifyOtpDto: VerifyOtpDto = {
      country_code: '+123',
      mobile_no: '4567890',
      otp: 123456,
      device_id: 'device_id',
      device_type: 'device_type',
      firebase: 'firebase',
      created_at_ip: '127.0.0.1',
      updated_at_ip: '127.0.0.1',
    };
    const req = {
      user: {
        id: '1',
        first_name: 'first',
        last_name: 'last',
        role: 'admin',
        email: dummyEmail,
      },
      headers: {
        'user-agent': 'Mozilla/5.0',
      },
    } as IRequest;

    it('should return bad request if invalid otp', async () => {
      authService.findOtp.mockResolvedValue(null);
      const result = await controller.verifyContactChangeOtp(verifyOtpDto, req);
      expect(authService.findOtp).toHaveBeenCalledWith({
        where: {
          is_verified: false,
          type: OTP_TYPE.change_number,
          country_code: verifyOtpDto.country_code,
          contact_number: verifyOtpDto.mobile_no,
          otp: verifyOtpDto.otp,
          provider: {
            id: req.user.id,
          },
        },
        relations: {
          provider: true,
        },
      });

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.INVALID_OTP,
          data: {},
        }),
      );
    });

    it('should return bad request if otp not verified', async () => {
      const otp = new Otp();
      authService.findOtp.mockResolvedValue(otp);
      authService.verifyChangeContactNumberOtp.mockResolvedValue({
        status: 0,
        data: {
          message: CONSTANT.ERROR.OTP_EXPIRED,
          data: {},
        },
      });

      const result = await controller.verifyContactChangeOtp(verifyOtpDto, req);

      expect(authService.findOtp).toHaveBeenCalledWith({
        where: {
          is_verified: false,
          type: OTP_TYPE.change_number,
          country_code: verifyOtpDto.country_code,
          contact_number: verifyOtpDto.mobile_no,
          otp: verifyOtpDto.otp,
          provider: {
            id: req.user.id,
          },
        },
        relations: {
          provider: true,
        },
      });

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.OTP_EXPIRED,
          data: {},
        }),
      );
    });

    it('should return success if otp verified', async () => {
      const otp = new Otp();
      authService.findOtp.mockResolvedValue(otp);
      authService.verifyChangeContactNumberOtp.mockResolvedValue({
        status: 1,
        data: {
          message: CONSTANT.SUCCESS.OTP_VERIFIED,
          data: {},
        },
      });

      const result = await controller.verifyContactChangeOtp(verifyOtpDto, req);

      expect(authService.findOtp).toHaveBeenCalledWith({
        where: {
          is_verified: false,
          type: OTP_TYPE.change_number,
          country_code: verifyOtpDto.country_code,
          contact_number: verifyOtpDto.mobile_no,
          otp: verifyOtpDto.otp,
          provider: {
            id: req.user.id,
          },
        },
        relations: {
          provider: true,
        },
      });

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.OTP_VERIFIED,
          data: {},
        }),
      );
    });

    it('should handle errors during signup process', async () => {
      authService.findOtp.mockRejectedValue(new Error('Failed to find user'));

      const result = await controller.verifyContactChangeOtp(verifyOtpDto, req);

      expect(result).toEqual(
        response.failureResponse(new Error('Failed to find user')),
      );
    });
  });
});
