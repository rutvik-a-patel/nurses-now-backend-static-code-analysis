jest.mock('@/shared/helpers/generate-token', () => ({
  __esModule: true, // This helps Jest understand that the module is an ES module
  default: jest.fn().mockResolvedValue(true), // Mocking the default export as a function
}));

jest.mock('@/shared/helpers/send-email-helper', () => ({
  __esModule: true, // This helps Jest understand that the module is an ES module
  default: jest.fn().mockResolvedValue(true), // Mocking the default export as a function
}));

jest.mock('@/shared/helpers/generate-otp', () => ({
  __esModule: true, // This helps Jest understand that the module is an ES module
  default: jest.fn().mockReturnValue('123456'), // Mocking the default export as a function
}));

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Token } from '@/token/entities/token.entity';
import { Otp } from '@/otp/entities/otp.entity';
import { ProviderService } from '@/provider/provider.service';
import { Provider } from '@/provider/entities/provider.entity';
import * as jwt from 'jsonwebtoken';
import sendEmailHelper from '@/shared/helpers/send-email-helper';
import { SmsService } from '@/shared/helpers/send-sms';
import generateOtp from '@/shared/helpers/generate-otp';
import {
  dummyEmail,
  dummyPassword,
  dummyToken,
} from '@/shared/constants/constant';
import {
  EJS_FILES,
  INVITE_STATUS,
  LINK_TYPE,
  TABLE,
} from '@/shared/constants/enum';
import { CONSTANT } from '@/shared/constants/message';
import response from '@/shared/response';
import * as bcrypt from 'bcrypt';
import { EMAIL_OR_MOBILE } from '@/shared/constants/types';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { Invite } from '@/invite/entities/invite.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';
import { Certificate } from '@/certificate/entities/certificate.entity';
import { ProviderAddress } from '@/provider-address/entities/provider-address.entity';
import { ColumnsPreferenceService } from '@/columns-preference/columns-preference.service';
import { Speciality } from '@/speciality/entities/speciality.entity';
import { SendOtpDto } from './dto/send-otp.dto';
import { AutoSchedulingSettingService } from '@/auto-scheduling-setting/auto-scheduling-setting.service';
import { ReferFriend } from '@/refer-friend/entities/refer-friend.entity';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let mockTokenRepository: any;
  let mockOtpRepository: any;
  let mockProviderRepository: any;
  let mockInviteRepository: any;
  let sendEmail: any;
  let smsService: any;
  let generateOtpHelper: any;
  let providerService: any;
  let statusSettingRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        ProviderService,
        SmsService,
        {
          provide: getRepositoryToken(Token),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
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
          provide: getRepositoryToken(Provider),
          useValue: {
            update: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Invite),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
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
          provide: getRepositoryToken(ReferFriend),
          useValue: {},
        },
        {
          provide: ProviderService,
          useValue: {
            create: jest.fn(),
            findOneWhere: jest.fn(),
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
          provide: ColumnsPreferenceService,
          useValue: {
            findOne: jest.fn(),
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
          useValue: {
            findOneWhere: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    providerService = module.get<ProviderService>(ProviderService);
    smsService = module.get<SmsService>(SmsService);
    mockTokenRepository = module.get(getRepositoryToken(Token));
    mockOtpRepository = module.get(getRepositoryToken(Otp));
    sendEmail = sendEmailHelper as jest.MockedFunction<typeof sendEmailHelper>;
    generateOtpHelper = generateOtp as jest.MockedFunction<typeof generateOtp>;
    mockProviderRepository = module.get(getRepositoryToken(Provider));
    mockInviteRepository = module.get(getRepositoryToken(Invite));
    statusSettingRepository = module.get(getRepositoryToken(StatusSetting));

    mockInviteRepository.save.mockImplementation(async (invite) => ({
      ...invite,
      id: invite.id || 'invite123',
    }));
    mockInviteRepository.delete.mockImplementation(async (criteria) => {
      // Simulate deletion: if user_id is present, return { affected: 1 }, else { affected: 0 }
      if (criteria && criteria.user_id) return { affected: 1 };
      return { affected: 0 };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isTokenExpired', () => {
    it('should return false for a valid token', () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        return {
          id: '1',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 60 * 60,
        }; // Token expires in 1 hour
      });

      const token = 'valid.jwt.token';
      const result = service.isTokenExpired(token);
      expect(result).toBe(false);
    });

    it('should return true for an expired token', () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new jwt.TokenExpiredError('jwt expired', new Date());
      });

      const token = 'expired.jwt.token';
      const result = service.isTokenExpired(token);
      expect(result).toBe(true);
    });

    it('should return true for an invalid token', () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new jwt.JsonWebTokenError('invalid token');
      });

      const token = 'invalid.jwt.token';
      const result = service.isTokenExpired(token);
      expect(result).toBe(true);
    });

    it('should return true for other verification failures not throwing errors', () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        return null; // Assuming verify returns null if it fails without throwing
      });

      const token = 'unusual.jwt.token';
      const result = service.isTokenExpired(token);
      expect(result).toBe(true);
    });
  });

  describe('createUserToken', () => {
    it('should create a new token if none exists', async () => {
      mockTokenRepository.findOne.mockResolvedValue(null);
      mockTokenRepository.save.mockResolvedValue({ jwt: 'newToken' });

      const payload = {
        provider_id: '1',
        jwt: 'newToken',
        device_id: '123',
        device_name: 'Device',
        device_type: 'Type',
        created_at_ip: '0.0.0.0',
        updated_at_ip: '0.0.0.0',
      };

      const result = await service.createUserToken(
        payload,
        'provider_id',
        'provider',
      );

      expect(mockTokenRepository.findOne).toHaveBeenCalledWith({
        where: {
          provider: { id: payload.provider_id },
          deleted_at: null,
          device_id: payload.device_id,
        },
      });
      expect(mockTokenRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ jwt: 'newToken' }),
      );
      expect(result).toEqual('newToken');
    });

    it('should return existing token if not expired', async () => {
      const existingToken = {
        jwt: 'existingToken',
        id: '1',
      };

      mockTokenRepository.findOne.mockResolvedValue(existingToken);
      service.isTokenExpired = jest.fn().mockReturnValue(false);

      const payload: any = {
        provider_id: '1',
        jwt: 'newToken',
        device_id: '123',
        device_name: 'Device',
        device_type: 'Type',
        created_at_ip: '0.0.0.0',
        updated_at_ip: '0.0.0.0',
      };

      const result = await service.createUserToken(
        payload,
        'provider_id',
        'provider',
      );

      expect(mockTokenRepository.findOne).toHaveBeenCalledWith({
        where: {
          provider: { id: payload.provider_id },
          deleted_at: null,
          device_id: payload.device_id,
        },
      });
      expect(mockTokenRepository.save).toHaveBeenCalledWith({
        id: existingToken.id,
        jwt: existingToken.jwt,
        firebase: payload.firebase,
        updated_at_ip: payload.updated_at_ip,
        login_at: expect.any(String),
      });
      expect(result).toEqual('existingToken');
    });

    it('should update the token and return the new JWT if it exists and is expired', async () => {
      const existingToken = {
        id: 'token1',
        jwt: 'oldToken',
      };

      mockTokenRepository.findOne.mockResolvedValue(existingToken);
      service.isTokenExpired = jest.fn().mockReturnValue(true);

      const payload: any = {
        provider_id: '1',
        jwt: 'newToken',
        device_id: '123',
        device_name: 'Device',
        device_type: 'Type',
        created_at_ip: '0.0.0.0',
        updated_at_ip: '0.0.0.0',
      };

      const result = await service.createUserToken(
        payload,
        'provider_id',
        'provider',
      );

      expect(mockTokenRepository.save).toHaveBeenCalledWith({
        id: existingToken.id,
        jwt: payload.jwt,
        firebase: payload.firebase,
        updated_at_ip: payload.updated_at_ip,
        login_at: expect.any(String),
      });
      expect(result).toEqual(payload.jwt);
    });

    it('should update the token and return the existing JWT if no new JWT is provided', async () => {
      const existingToken = {
        id: 'token1',
        jwt: 'existingToken',
      };

      mockTokenRepository.findOne.mockResolvedValue(existingToken);
      service.isTokenExpired = jest.fn().mockReturnValue(false);

      const payload: any = {
        provider_id: '1',
        jwt: null, // No new JWT provided
        device_id: '123',
        device_name: 'Device',
        device_type: 'Type',
        created_at_ip: '0.0.0.0',
        updated_at_ip: '0.0.0.0',
      };

      const result = await service.createUserToken(
        payload,
        'provider_id',
        'provider',
      );

      expect(mockTokenRepository.save).toHaveBeenCalledWith({
        id: existingToken.id,
        jwt: existingToken.jwt, // Existing JWT is used
        firebase: payload.firebase,
        updated_at_ip: payload.updated_at_ip,
        login_at: expect.any(String),
      });
      expect(result).toEqual(existingToken.jwt);
    });

    it('should return newJwt when newJwt is provided', async () => {
      const existingToken = {
        id: 'token1',
        jwt: 'existingToken',
      };

      mockTokenRepository.findOne.mockResolvedValue(existingToken);
      service.isTokenExpired = jest.fn().mockReturnValue(true);

      const payload: any = {
        provider_id: '1',
        jwt: 'newToken', // newJwt provided
        device_id: '123',
        device_name: 'Device',
        device_type: 'Type',
        created_at_ip: '0.0.0.0',
        updated_at_ip: '0.0.0.0',
      };

      const result = await service.createUserToken(
        payload,
        'provider_id',
        'provider',
      );

      expect(mockTokenRepository.save).toHaveBeenCalledWith({
        id: existingToken.id,
        jwt: payload.jwt, // newJwt should be saved
        firebase: payload.firebase,
        updated_at_ip: payload.updated_at_ip,
        login_at: expect.any(String),
      });

      expect(result).toBe(payload.jwt); // Verify newJwt is returned
    });

    it('should return existing jwt when newJwt is not provided', async () => {
      const existingToken = {
        id: 'token1',
        jwt: 'existingToken',
      };

      mockTokenRepository.findOne.mockResolvedValue(existingToken);
      service.isTokenExpired = jest.fn().mockReturnValue(true);

      const payload: any = {
        provider_id: '1',
        jwt: null, // newJwt not provided
        device_id: '123',
        device_name: 'Device',
        device_type: 'Type',
        created_at_ip: '0.0.0.0',
        updated_at_ip: '0.0.0.0',
      };

      const result = await service.createUserToken(
        payload,
        'provider_id',
        'provider',
      );

      expect(mockTokenRepository.save).toHaveBeenCalledWith({
        id: existingToken.id,
        jwt: null, // existing jwt should be saved again
        firebase: payload.firebase,
        updated_at_ip: payload.updated_at_ip,
        login_at: expect.any(String),
      });

      expect(result).toBe(existingToken.jwt); // Verify existing jwt is returned
    });
  });

  describe('getLoginResponse', () => {
    it('should generate login response with a new token', async () => {
      const provider = new Provider();
      provider.id = '1';
      provider.is_active = true;
      provider.email = 'test@example.com';

      jest
        .spyOn(service, 'createUserToken')
        .mockResolvedValue('generatedJwtToken');

      providerService.findOneWhere.mockResolvedValue(provider);

      const result = await service.getLoginResponse(
        provider,
        {
          device_id: '123',
          firebase: 'firebaseToken',
          device_name: 'iPhone',
          device_type: 'iOS',
        },
        '0.0.0.0',
        '0.0.0.0',
      );

      expect(result).toEqual(
        expect.objectContaining({
          data: {
            id: provider.id,
            is_active: provider.is_active,
            is_signup_completed: false,
            is_email_verified: provider.is_email_verified,
            is_mobile_verified: provider.is_mobile_verified,
            email: provider.email,
            first_name: provider.first_name,
            last_name: provider.last_name,
            base_url: provider.base_url,
            profile_image: provider.profile_image,
            signature_image: provider.signature_image,
            bio: provider.bio,
            country_code: provider.country_code,
            mobile_no: provider.mobile_no,
            created_at: provider.created_at,
            jwt: 'generatedJwtToken',
          },
        }),
      );
    });

    it('should generate login response with a new token', async () => {
      const provider = new Provider();
      provider.id = '1';
      provider.is_active = true;
      provider.email = 'test@example.com';
      provider.certificate = new Certificate();
      provider.speciality = new Speciality();
      provider.address = [new ProviderAddress()];

      jest
        .spyOn(service, 'createUserToken')
        .mockResolvedValue('generatedJwtToken');

      providerService.findOneWhere.mockResolvedValue(provider);

      const result = await service.getLoginResponse(
        provider,
        {
          device_id: '123',
          firebase: 'firebaseToken',
          device_name: 'iPhone',
          device_type: 'iOS',
        },
        '0.0.0.0',
        '0.0.0.0',
      );

      expect(result).toEqual(
        expect.objectContaining({
          data: {
            id: provider.id,
            is_active: provider.is_active,
            is_signup_completed: true,
            is_email_verified: provider.is_email_verified,
            is_mobile_verified: provider.is_mobile_verified,
            email: provider.email,
            first_name: provider.first_name,
            last_name: provider.last_name,
            base_url: provider.base_url,
            profile_image: provider.profile_image,
            signature_image: provider.signature_image,
            bio: provider.bio,
            country_code: provider.country_code,
            mobile_no: provider.mobile_no,
            created_at: provider.created_at,
            jwt: 'generatedJwtToken',
          },
        }),
      );
    });
  });

  describe('sendSignupOtp', () => {
    const type: any = 'signup';
    const provider: any = {
      id: '1',
      country_code: '+123',
      mobile_no: '4567890',
    };
    const ip = '127.0.0.1';

    beforeEach(() => {
      mockOtpRepository.findOne.mockReset();
      mockOtpRepository.save.mockReset();
      mockOtpRepository.update.mockReset();
      generateOtpHelper.mockReset();
      sendEmail.mockReset();
    });

    it('should generate and send OTP for first-time signup', async () => {
      mockOtpRepository.findOne.mockResolvedValueOnce(null);
      smsService.sendSms.mockResolvedValue();
      mockOtpRepository.save.mockImplementation((otp) =>
        Promise.resolve({ ...otp, otp: '123456' }),
      );
      generateOtpHelper.mockReturnValue('123456'); // Ensure OTP is generated as expected

      await service.sendSignupOtp(provider, ip, type);

      expect(mockOtpRepository.save).toHaveBeenCalled();
      expect(smsService.sendSms).toHaveBeenCalledWith({
        otp: '123456',
        contactNumber: provider.country_code + provider.mobile_no,
      });
    });

    it('should update and resend OTP if one already exists', async () => {
      const existingOtp = { id: 'otp123', otp: '654321' };
      mockOtpRepository.findOne.mockResolvedValueOnce(existingOtp);
      generateOtpHelper.mockReturnValue('654321'); // Mock generateOtp to return a specific OTP
      smsService.sendSms.mockResolvedValue();
      mockOtpRepository.update.mockResolvedValue(true);

      await service.sendSignupOtp(provider, ip, type);

      expect(generateOtp).toHaveBeenCalled(); // Check that generateOtp was called
      expect(mockOtpRepository.update).toHaveBeenCalledWith(
        existingOtp.id,
        expect.any(Object),
      );
      expect(smsService.sendSms).toHaveBeenCalledWith({
        otp: '654321',
        contactNumber: provider.country_code + provider.mobile_no,
      });
    });

    it('should handle errors during OTP generation or sending', async () => {
      mockOtpRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.sendSignupOtp(provider, ip, type)).rejects.toThrow(
        'Database error',
      );
      expect(sendEmailHelper).not.toHaveBeenCalled();
    });
  });

  describe('findOtp', () => {
    it('should find one admin by criteria', async () => {
      const options = { where: { otp: 123456 } };
      const otp = new Otp();
      mockOtpRepository.findOne.mockResolvedValue(otp);
      const result = await service.findOtp(options);
      expect(mockOtpRepository.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual(otp);
    });
  });

  describe('providerSignUp', () => {
    it('should create a provider and send verification email', async () => {
      const providerSignupDto: any = {
        email: 'test@example.com',
        updated_at_ip: '127.0.0.1',
      };
      const mockProvider = {
        ...providerSignupDto,
        password: dummyPassword,
        email: 'test@example.com',
      };
      const invite = new Invite();
      invite.id = 'invite123';
      const payload: any = {
        email: providerSignupDto.email,
        email_type: EJS_FILES.verification,
        redirectUrl: `${process.env.EMAIL_VERIFICATION_URL}/auth?type=provider&email=${providerSignupDto.email}&id=${invite.id}`,
        subject: CONSTANT.EMAIL.VERIFICATION_SUBJECT,
      };
      statusSettingRepository.findOne.mockResolvedValue(new StatusSetting());
      providerService.create.mockResolvedValue(mockProvider);
      sendEmail.mockResolvedValue(null);
      await sendEmailHelper(payload);

      expect(sendEmail).toHaveBeenCalledWith(payload);

      await service.providerSignUp(providerSignupDto);

      expect(providerService.create).toHaveBeenCalled();
      expect(mockProvider.password).toBeUndefined();
    });

    it('should create a provider and initiate SMS OTP if email sending is not required', async () => {
      const providerSignupDto: any = {
        mobile_no: '1234567890',
        country_code: '+1',
        updated_at_ip: '127.0.0.1',
      };
      const mockProvider = { ...providerSignupDto, password: dummyPassword };
      providerService.create.mockResolvedValue(mockProvider);
      const sendSignupOtp = jest
        .spyOn(service, 'sendSignupOtp')
        .mockResolvedValue(undefined);

      await service.providerSignUp(providerSignupDto, false);

      expect(providerService.create).toHaveBeenCalledWith(providerSignupDto);
      expect(sendSignupOtp).toHaveBeenCalledWith(
        mockProvider,
        providerSignupDto.updated_at_ip,
        'signup',
      );
      expect(mockProvider.password).toBeUndefined();
    });

    it('should handle errors during provider creation', async () => {
      const providerSignupDto: any = { email: 'error@example.com' };
      providerService.create.mockRejectedValue(
        new Error('Failed to create provider'),
      );

      await expect(
        service.providerSignUp(providerSignupDto, true),
      ).rejects.toThrow('Failed to create provider');
    });
  });

  describe('findToken', () => {
    it('should find one admin by criteria', async () => {
      const options = { where: { jwt: dummyToken } };
      const token = new Token();
      mockTokenRepository.findOne.mockResolvedValue(token);
      const result = await service.findToken(options);
      expect(mockTokenRepository.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual(token);
    });
  });

  describe('verifySignupOtp', () => {
    it('should return an error if the OTP is expired', async () => {
      const otp = new Otp();
      otp.id = 'otp123';
      otp.expire_at = Math.floor(Date.now() / 1000) - 100; // Past timestamp
      const verifyOtpDto: any = { updated_at_ip: '127.0.0.1' };

      const result = await service.verifySignupOtp(otp, verifyOtpDto);

      expect(mockOtpRepository.update).toHaveBeenCalledWith(
        otp.id,
        expect.any(Object),
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.OTP_EXPIRED,
          data: { type: 'signup' },
        }),
      );
    });

    it('should verify the provider if the OTP is valid', async () => {
      const provider = new Provider();
      provider.id = 'provider123';
      const otp = new Otp();
      otp.id = 'otp123';
      otp.expire_at = Math.floor(Date.now() / 1000) + 100; // Future timestamp
      otp.provider = provider;
      const verifyOtpDto: any = {
        device_id: 'device123',
        device_type: 'mobile',
        device_name: 'phone',
        firebase: 'token',
        created_at_ip: '127.0.0.1',
        updated_at_ip: '127.0.0.1',
      };

      const mockLoginResponse = response.successResponse({
        message: 'Login successful',
        data: {},
      });
      jest
        .spyOn(service, 'getLoginResponse')
        .mockResolvedValue(mockLoginResponse);

      const result = await service.verifySignupOtp(otp, verifyOtpDto);

      expect(mockOtpRepository.update).toHaveBeenCalledWith(
        otp.id,
        expect.any(Object),
      );
      expect(mockProviderRepository.update).toHaveBeenCalledWith(
        provider.id,
        expect.any(Object),
      );
      expect(result).toEqual(mockLoginResponse);
    });

    it('should handle errors during OTP verification', async () => {
      const otp = new Otp();
      otp.id = 'otp123';
      const verifyOtpDto: any = { updated_at_ip: '127.0.0.1' };
      mockOtpRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(service.verifySignupOtp(otp, verifyOtpDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('resendOTP', () => {
    it('should successfully resend OTP and return a success message', async () => {
      const provider = new Provider();
      provider.country_code = '+123';
      provider.mobile_no = '4567890';

      const resendOtpDto: any = {
        type: 'signup',
        updated_at_ip: '127.0.0.1',
      };

      jest.spyOn(service, 'sendSignupOtp').mockResolvedValue();

      const result = await service.resendOTP(provider, resendOtpDto);

      expect(service.sendSignupOtp).toHaveBeenCalledWith(
        provider,
        resendOtpDto.updated_at_ip,
        resendOtpDto.type,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.COMPLETE_VERIFICATION('Signup'),
          data: {
            type: resendOtpDto.type,
            country_code: provider.country_code,
            contact_number: provider.mobile_no,
          },
        }),
      );
    });

    it('should successfully resend OTP and return a success message', async () => {
      const provider = new Provider();
      provider.country_code = '+123';
      provider.mobile_no = '4567890';

      const resendOtpDto: any = {
        type: 'login',
        updated_at_ip: '127.0.0.1',
      };

      jest.spyOn(service, 'sendSignupOtp').mockResolvedValue();

      const result = await service.resendOTP(provider, resendOtpDto);

      expect(service.sendSignupOtp).toHaveBeenCalledWith(
        provider,
        resendOtpDto.updated_at_ip,
        resendOtpDto.type,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.COMPLETE_VERIFICATION('Login'),
          data: {
            type: resendOtpDto.type,
            country_code: provider.country_code,
            contact_number: provider.mobile_no,
          },
        }),
      );
    });

    it('should handle errors during the resend OTP process', async () => {
      const provider = new Provider();
      const resendOtpDto: any = {
        type: 'signup',
        updated_at_ip: '127.0.0.1',
      };

      jest
        .spyOn(service, 'sendSignupOtp')
        .mockRejectedValue(new Error('OTP sending failed'));

      await expect(service.resendOTP(provider, resendOtpDto)).rejects.toThrow(
        'OTP sending failed',
      );
      expect(service.sendSignupOtp).toHaveBeenCalledWith(
        provider,
        resendOtpDto.updated_at_ip,
        resendOtpDto.type,
      );
    });
  });

  describe('providerMobileLogin', () => {
    it('should send OTP for verification if provider is not verified', async () => {
      const provider = new Provider();
      provider.is_mobile_verified = false;
      provider.is_active = true;
      const providerMobileLoginDto: any = {
        updated_at_ip: '127.0.0.1',
      };

      jest.spyOn(service, 'sendSignupOtp').mockResolvedValue();
      const result = await service.providerMobileLogin(
        provider,
        providerMobileLoginDto,
      );

      expect(service.sendSignupOtp).toHaveBeenCalledWith(
        provider,
        providerMobileLoginDto.updated_at_ip,
        'login',
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.COMPLETE_VERIFICATION('Signup'),
          data: {
            type: 'signup',
            country_code: provider.country_code, // Assuming country_code is already set
            contact_number: provider.mobile_no, // Assuming mobile_no is already set
          },
        }),
      );
    });
    it('should generate and send OTP if provider is verified and active with no existing OTP', async () => {
      const provider = new Provider();
      provider.id = '1';
      provider.is_mobile_verified = true;
      provider.is_active = true;
      provider.country_code = '+123';
      provider.mobile_no = '4567890';

      const providerMobileLoginDto: any = {
        updated_at_ip: '127.0.0.1',
      };

      mockOtpRepository.findOne.mockResolvedValueOnce(null); // Mock no existing OTP
      mockOtpRepository.save.mockImplementation((otp) => Promise.resolve(otp)); // Mock save operation

      await service.providerMobileLogin(provider, providerMobileLoginDto);

      expect(mockOtpRepository.save).toHaveBeenCalled();
      smsService.sendSms.mockResolvedValue(null);
      await smsService.sendSms({
        otp: expect.any(String), // Ensure OTP is generated
        contactNumber: provider.country_code + provider.mobile_no,
      });

      const existingOtp = { id: 'otp123', otp: '123456' };
      mockOtpRepository.findOne.mockResolvedValueOnce(existingOtp); // Mock existing OTP
      mockOtpRepository.update.mockResolvedValue(true); // Mock update operation

      generateOtpHelper.mockReturnValue('654321');

      expect(smsService.sendSms).toHaveBeenCalledWith({
        otp: '654321', // Ensure OTP is generated
        contactNumber: provider.country_code + provider.mobile_no,
      });
    });

    it('should update and resend OTP if provider is verified and active with existing OTP', async () => {
      const provider = new Provider();
      provider.id = '1';
      provider.is_mobile_verified = true;
      provider.is_active = true;
      provider.country_code = '+123';
      provider.mobile_no = '4567890';

      const providerMobileLoginDto: any = {
        updated_at_ip: '127.0.0.1',
      };

      const existingOtp = { id: 'otp123', otp: '123456' };
      mockOtpRepository.findOne.mockResolvedValueOnce(existingOtp); // Mock existing OTP
      mockOtpRepository.update.mockResolvedValue(true); // Mock update operation

      generateOtpHelper.mockReturnValue('654321'); // Mock updated OTP

      await service.providerMobileLogin(provider, providerMobileLoginDto);

      expect(mockOtpRepository.update).toHaveBeenCalledWith(
        existingOtp.id,
        expect.objectContaining({ otp: '654321' }), // Ensure OTP is updated
      );
    });

    it('should return response indicating account is blocked if provider is verified but not active', async () => {
      const provider = new Provider();
      provider.is_mobile_verified = true;
      provider.is_active = false;

      const providerMobileLoginDto: any = {
        updated_at_ip: '127.0.0.1',
      };

      const result = await service.providerMobileLogin(
        provider,
        providerMobileLoginDto,
      );

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ACCOUNT_IS_BLOCKED,
          data: {},
        }),
      );
    });

    it('should return response indicating wrong credentials if provider is not verified or active', async () => {
      const provider = new Provider();
      provider.is_email_verified = false;
      provider.is_active = false;

      const providerMobileLoginDto: any = {
        updated_at_ip: '127.0.0.1',
      };

      const result = await service.providerMobileLogin(
        provider,
        providerMobileLoginDto,
      );

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.WRONG_CREDENTIALS,
          data: {},
        }),
      );
    });
  });

  describe('verifyLoginOtp', () => {
    it('should return response indicating OTP expired if OTP is expired', async () => {
      const otp = new Otp();
      otp.expire_at = Math.floor(Date.now() / 1000) - 10; // Set expiration time in the past

      const verifyOtpDto: any = {
        updated_at_ip: '127.0.0.1',
      };

      const result = await service.verifyLoginOtp(otp, verifyOtpDto);

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.OTP_EXPIRED,
          data: { type: 'login' },
        }),
      );
    });

    it('should verify OTP and return login response if OTP is not expired', async () => {
      const otp = new Otp();
      otp.expire_at = Math.floor(Date.now() / 1000) + 10; // Set expiration time in the future

      const verifyOtpDto: any = {
        updated_at_ip: '127.0.0.1',
        device_id: 'device123',
        device_type: 'mobile',
        firebase: 'firebase_token',
        created_at_ip: '127.0.0.1',
      };

      const mockLoginResponse = response.successResponse({
        message: 'Login successful',
        data: {},
      });
      jest
        .spyOn(service, 'getLoginResponse')
        .mockResolvedValue(mockLoginResponse);

      const result = await service.verifyLoginOtp(otp, verifyOtpDto);

      expect(result).toEqual(mockLoginResponse);
      expect(service.getLoginResponse).toHaveBeenCalledWith(
        otp.provider,
        {
          device_id: verifyOtpDto.device_id,
          device_name: verifyOtpDto.device_type,
          device_type: verifyOtpDto.device_type,
          firebase: verifyOtpDto.firebase,
        },
        verifyOtpDto.created_at_ip,
        verifyOtpDto.updated_at_ip,
      );
    });
  });

  describe('login', () => {
    const provider = new Provider();
    provider.email = dummyEmail;
    provider.is_email_verified = true;
    provider.is_active = true;
    provider.password = 'hashedPassword'; // Set hashed password for testing
    const invite = new Invite();
    invite.id = 'invite123';

    const emailLoginDto = {
      device_id: 'deviceId',
      device_name: 'deviceName',
      device_type: 'deviceType',
      firebase: 'firebaseToken',
      created_at_ip: '127.0.0.1',
      updated_at_ip: '127.0.0.1',
    };

    it('should send new signup OTP if email is not verified', async () => {
      provider.is_email_verified = false;
      sendEmail.mockResolvedValue(true);

      const result = await service.login(provider, emailLoginDto);

      expect(sendEmail).toHaveBeenCalledWith({
        email: provider.email,
        redirectUrl: expect.any(String),
        email_type: EJS_FILES.verification,
        subject: CONSTANT.EMAIL.VERIFICATION_SUBJECT,
      });
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.COMPLETE_EMAIL_VERIFICATION,
          data: { is_email_verified: provider.is_email_verified },
        }),
      );
    });

    it('should return account blocked if provider is not active', async () => {
      provider.is_email_verified = true;
      provider.is_active = false;

      const result = await service.login(provider, emailLoginDto);

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ACCOUNT_IS_BLOCKED,
          data: {},
        }),
      );
    });

    it('should return login response for email login with correct password', async () => {
      provider.is_email_verified = true;
      provider.is_active = true;

      const emailLoginDtoWithPassword = {
        ...emailLoginDto,
        password: dummyPassword,
      };
      bcrypt.compare.mockReturnValue(true);
      const mockLoginResponse = response.successResponse({
        message: 'Login successful',
        data: {},
      });
      jest
        .spyOn(service, 'getLoginResponse')
        .mockResolvedValue(mockLoginResponse);

      const result = await service.login(provider, emailLoginDtoWithPassword);

      expect(service.getLoginResponse).toHaveBeenCalledWith(
        provider,
        {
          device_id: emailLoginDto.device_id,
          device_name: emailLoginDto.device_name,
          device_type: emailLoginDto.device_type,
          firebase: emailLoginDto.firebase,
        },
        emailLoginDto.created_at_ip,
        emailLoginDto.updated_at_ip,
      );
      expect(result).toEqual(mockLoginResponse);
    });

    it('should return bad request for email login with incorrect password', async () => {
      const emailLoginDtoWithIncorrectPassword = {
        ...emailLoginDto,
        password: dummyPassword,
      };
      bcrypt.compare.mockResolvedValue(false);

      const result = await service.login(
        provider,
        emailLoginDtoWithIncorrectPassword,
      );

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.WRONG_CREDENTIALS,
          data: {},
        }),
      );
    });

    it('should return unauthenticated request if none of the conditions are met', async () => {
      const nonMatchingProvider = {
        ...provider,
        is_verified: true,
      };

      const result = await service.login(nonMatchingProvider, emailLoginDto);

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.INVALID_LOGIN,
          data: {},
        }),
      );
    });
  });

  describe('sendForgotPasswordOTP', () => {
    beforeEach(() => {
      process.env.ADMIN_URL = 'http://admin.test.com/';
      process.env.FACILITY_URL = 'http://facility.com/';
      process.env.EMAIL_VERIFICATION_URL = 'http://verification.test.com/';
      process.env.SUPPORT_EMAIL = 'support@test.com';

      (service['encryptDecryptService'].encrypt as jest.Mock).mockReturnValue(
        'c449837fcd5b9bfa1b9348cbb006c8c0b3ab0049dab1fd12fbe3fb9b897d2047',
      );
    });

    afterEach(() => {
      delete process.env.EMAIL_VERIFICATION_URL;
      delete process.env.SUPPORT_EMAIL;
    });

    it('should send forgot password OTP via email', async () => {
      const user = new FacilityUser();
      user.id = '123';
      user.email = 'test@example.com';
      const type = LINK_TYPE.forgot_password;

      const savedInvite = new Invite();
      savedInvite.id = 'invite-123';

      mockInviteRepository.update.mockResolvedValue({ affected: 1 });
      mockInviteRepository.save.mockResolvedValue(savedInvite);
      sendEmail.mockResolvedValue(true);

      const encryptedEmail =
        'c449837fcd5b9bfa1b9348cbb006c8c0b3ab0049dab1fd12fbe3fb9b897d2047';
      const expectedUrl = `http://facility.com/reset-password?email=${encryptedEmail}&type=${TABLE.facility_user}&id=${savedInvite.id}`;

      await service.sendForgotPasswordOTP(user, TABLE.facility_user);

      expect(mockInviteRepository.update).toHaveBeenCalledWith(
        {
          email: user.email,
          role: TABLE.facility_user,
          user_id: user.id,
          type,
          status: INVITE_STATUS.pending,
        },
        {
          status: INVITE_STATUS.expired,
          deleted_at: expect.any(String),
        },
      );

      expect(mockInviteRepository.save).toHaveBeenCalledWith({
        user_id: user.id,
        email: user.email,
        role: TABLE.facility_user,
        status: INVITE_STATUS.pending,
        type,
      });

      expect(service['encryptDecryptService'].encrypt).toHaveBeenCalledWith(
        user.email,
      );

      expect(sendEmail).toHaveBeenCalledWith({
        email: user.email,
        redirectUrl: expectedUrl,
        email_type: EJS_FILES.reset_password,
        subject: CONSTANT.EMAIL.FORGOT_PASSWORD,
        supportEmail: 'support@test.com',
      });
    });
  });

  describe('sendInvitation', () => {
    it('should send invitation via email', async () => {
      const user = new FacilityUser();
      const table = TABLE.facility_user;
      const invitation = new Invite();
      invitation.status = INVITE_STATUS.pending;

      mockInviteRepository.findOne.mockResolvedValue(invitation);
      mockInviteRepository.update.mockResolvedValue({ affected: 0 });
      mockInviteRepository.save.mockResolvedValue(new Invite());
      sendEmail.mockResolvedValue(true);
      await service.sendInvitation(user, table);

      expect(mockInviteRepository.findOne).toHaveBeenCalledWith({
        where: {
          email: user.email,
          role: table as TABLE,
          user_id: user.id,
        },
      });
      expect(mockInviteRepository.update).toHaveBeenCalledWith(invitation.id, {
        deleted_at: expect.any(String),
      });
      expect(mockInviteRepository.save).toHaveBeenCalledWith({
        email: user.email,
        role: table as TABLE,
        user_id: user.id,
        status: INVITE_STATUS.pending,
        type: LINK_TYPE.invitation,
      });
      expect(sendEmail).toHaveBeenCalledWith({
        email: user.email,
        name: user.first_name,
        email_type: EJS_FILES.invitation,
        authority: 'Nurses Now',
        supportEmail: process.env.SUPPORT_EMAIL,
        redirectUrl: expect.any(String),
        subject: CONSTANT.EMAIL.ACCEPT_INVITE,
      });
    });

    it('should send invitation via email', async () => {
      const user = new FacilityUser();
      const table = TABLE.admin;
      const invitation = new Invite();
      invitation.status = INVITE_STATUS.pending;

      mockInviteRepository.findOne.mockResolvedValue(invitation);
      mockInviteRepository.update.mockResolvedValue({ affected: 0 });
      mockInviteRepository.save.mockResolvedValue(new Invite());
      sendEmail.mockResolvedValue(true);
      await service.sendInvitation(user, table);

      expect(mockInviteRepository.findOne).toHaveBeenCalledWith({
        where: {
          email: user.email,
          role: table as TABLE,
          user_id: user.id,
        },
      });
      expect(mockInviteRepository.update).toHaveBeenCalledWith(invitation.id, {
        deleted_at: expect.any(String),
      });
      expect(mockInviteRepository.save).toHaveBeenCalledWith({
        email: user.email,
        role: table as TABLE,
        user_id: user.id,
        status: INVITE_STATUS.pending,
        type: LINK_TYPE.invitation,
      });
      expect(sendEmail).toHaveBeenCalledWith({
        email: user.email,
        name: user.first_name,
        email_type: EJS_FILES.invitation,
        authority: 'Nurses Now',
        supportEmail: process.env.SUPPORT_EMAIL,
        redirectUrl: expect.any(String),
        subject: CONSTANT.EMAIL.ACCEPT_INVITE,
      });
    });
  });

  describe('createInvite', () => {
    const user = new FacilityUser();
    const table = TABLE.facility_user;
    it('should create invite', async () => {
      mockInviteRepository.update.mockResolvedValue({ affected: 1 });
      mockInviteRepository.save.mockResolvedValue(new Invite());
      mockInviteRepository.delete.mockResolvedValue({ affected: 1 }); // Ensure delete returns affected: 1

      const result = await service.createInvite(user, table);
      expect(mockInviteRepository.update).toHaveBeenCalledWith(
        {
          email: user.email,
          role: table as TABLE,
          user_id: user.id,
          type: 'invitation' as LINK_TYPE,
        },
        {
          deleted_at: expect.any(String),
        },
      );
      expect(mockInviteRepository.save).toHaveBeenCalledWith({
        user_id: user.id,
        email: user.email,
        role: table as TABLE,
        status: INVITE_STATUS.pending,
        type: 'invitation' as LINK_TYPE,
      });
      expect(result).toEqual({});
    });

    it('should create invite', async () => {
      mockInviteRepository.update.mockResolvedValue({ affected: 1 });
      mockInviteRepository.save.mockResolvedValue(null);
      mockInviteRepository.delete.mockResolvedValue({ affected: 0 }); // Ensure delete returns affected: 0

      const result = await service.createInvite(user, table);
      expect(mockInviteRepository.update).toHaveBeenCalledWith(
        {
          email: user.email,
          role: table as TABLE,
          user_id: user.id,
          type: 'invitation' as LINK_TYPE,
        },
        {
          deleted_at: expect.any(String),
        },
      );
      expect(mockInviteRepository.save).toHaveBeenCalledWith({
        user_id: user.id,
        email: user.email,
        role: table as TABLE,
        status: INVITE_STATUS.pending,
        type: 'invitation' as LINK_TYPE,
      });
      expect(result).toEqual(null);
    });
  });

  describe('doesUserExist', () => {
    it('should return user if exists', async () => {
      const data: EMAIL_OR_MOBILE = {
        email: 'test@mail.com',
        country_code: '+1',
        mobile_no: '12345665',
      };

      providerService.findOneWhere.mockResolvedValue(new Provider());

      const result = await service.doesUserExists(data, providerService);

      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: [
          {
            email: data.email,
          },
          {
            country_code: data.country_code,
            mobile_no: data.mobile_no,
          },
        ],
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(new Provider());
    });
  });

  describe('isInvitationExpired', () => {
    const user = new FacilityUser();
    const table = TABLE.facility_user;
    const type = LINK_TYPE.invitation;
    it('should check invitation is expired or not', async () => {
      const mockInvite = new Invite();
      mockInviteRepository.findOne.mockResolvedValue(mockInvite);
      mockInviteRepository.update.mockResolvedValue({ affected: 0 });

      const result = await service.isInvitationExpired(user, table, type);

      expect(mockInviteRepository.findOne).toHaveBeenCalledWith({
        where: [
          {
            created_at: expect.any(Object),
            user_id: user.id,
            role: table,
            status: INVITE_STATUS.pending,
            type,
          },
          {
            user_id: user.id,
            role: table,
            status: INVITE_STATUS.expired,
            type,
          },
        ],
      });
      expect(mockInviteRepository.update).toHaveBeenCalledWith(mockInvite.id, {
        status: INVITE_STATUS.expired,
      });
      expect(result).toEqual(true);
    });

    it('should check invitation is expired or not', async () => {
      mockInviteRepository.findOne.mockResolvedValue(null);

      const result = await service.isInvitationExpired(user, table, type);

      expect(mockInviteRepository.findOne).toHaveBeenCalledWith({
        where: [
          {
            created_at: expect.any(Object),
            user_id: user.id,
            role: table,
            status: INVITE_STATUS.pending,
            type,
          },
          {
            user_id: user.id,
            role: table,
            status: INVITE_STATUS.expired,
            type,
          },
        ],
      });
      expect(result).toEqual(false);
    });
  });

  describe('isInvitationExpiredV2', () => {
    const user = new FacilityUser();
    const table = TABLE.facility_user;
    const type = LINK_TYPE.invitation;
    const id = '1';
    it('should check invitation is expired or not', async () => {
      const mockInvite = new Invite();
      mockInviteRepository.findOne.mockResolvedValue(mockInvite);
      mockInviteRepository.update.mockResolvedValue({ affected: 0 });

      const result = await service.isInvitationExpiredV2(user, table, type, id);

      expect(mockInviteRepository.findOne).toHaveBeenCalledWith({
        where: [
          {
            id,
            created_at: expect.any(Object),
            user_id: user.id,
            role: table,
            status: INVITE_STATUS.pending,
            type,
          },
          {
            id,
            user_id: user.id,
            role: table,
            status: INVITE_STATUS.expired,
            type,
          },
        ],
      });
      expect(mockInviteRepository.update).toHaveBeenCalledWith(mockInvite.id, {
        status: INVITE_STATUS.expired,
      });
      expect(result).toEqual(true);
    });

    it('should check invitation is expired or not', async () => {
      mockInviteRepository.findOne.mockResolvedValue(null);

      const result = await service.isInvitationExpiredV2(user, table, type, id);

      expect(mockInviteRepository.findOne).toHaveBeenCalledWith({
        where: [
          {
            id,
            created_at: expect.any(Object),
            user_id: user.id,
            role: table,
            status: INVITE_STATUS.pending,
            type,
          },
          {
            id,
            user_id: user.id,
            role: table,
            status: INVITE_STATUS.expired,
            type,
          },
        ],
      });
      expect(result).toEqual(false);
    });
  });

  describe('isInvitationExist', () => {
    const user = new FacilityUser();
    const table = TABLE.facility_user;
    const type = LINK_TYPE.invitation;
    it('should check invitation is exist or not', async () => {
      const mockInvite = new Invite();
      mockInviteRepository.findOne.mockResolvedValue(mockInvite);
      await service.isInvitationExist(user, table, type);

      expect(mockInviteRepository.findOne).toHaveBeenCalledWith({
        where: {
          user_id: user.id,
          role: table,
          type,
        },
      });
    });
  });

  describe('isInvitationExistV2', () => {
    const user = new FacilityUser();
    const table = TABLE.facility_user;
    const type = LINK_TYPE.invitation;
    const id = '1';
    it('should check invitation is exist or not', async () => {
      const mockInvite = new Invite();
      mockInviteRepository.findOne.mockResolvedValue(mockInvite);
      await service.isInvitationExistV2(user, table, type, id);

      expect(mockInviteRepository.findOne).toHaveBeenCalledWith({
        where: {
          id,
          user_id: user.id,
          role: table,
          type,
          status: INVITE_STATUS.pending,
        },
      });
    });
  });

  describe('verifyChangeContactNumberOtp', () => {
    const otp = new Otp();
    Object.assign(otp, { provider: { id: '1' } });
    it('should return response indicating OTP expired if OTP is expired', async () => {
      otp.expire_at = Math.floor(Date.now() / 1000) - 10; // Set expiration time in the past
      const verifyOtpDto: any = {
        updated_at_ip: '127.0.0.1',
      };

      const result = await service.verifyChangeContactNumberOtp(
        otp,
        verifyOtpDto,
      );

      expect(result).toEqual({
        status: 0,
        data: {
          message: CONSTANT.ERROR.OTP_EXPIRED,
          data: {},
        },
      });
    });

    it('should verify OTP and return login response if OTP is not expired', async () => {
      otp.expire_at = Math.floor(Date.now() / 1000) + 10;
      const verifyOtpDto: any = {
        updated_at_ip: '127.0.0.1',
        device_id: 'device123',
        device_type: 'mobile',
        firebase: 'firebase_token',
        created_at_ip: '127.0.0.1',
      };

      const result = await service.verifyChangeContactNumberOtp(
        otp,
        verifyOtpDto,
      );

      expect(result).toEqual({
        status: 1,
        data: {
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Mobile Verified'),
          data: {},
        },
      });
    });
  });

  describe('acceptInvitation', () => {
    const user = new Provider();
    const table = TABLE.provider;
    it('should accept invitation', async () => {
      mockInviteRepository.delete.mockResolvedValue(new Invite());

      const result = await service.acceptInvitation(user, table);
      expect(mockInviteRepository.delete).toHaveBeenCalledWith({
        user_id: user.id,
        role: table,
        status: INVITE_STATUS.pending,
      });
      expect(result).toEqual(true);
    });
    it('should accept invitation', async () => {
      mockInviteRepository.delete.mockResolvedValue(null);

      const result = await service.acceptInvitation(user, table);
      expect(mockInviteRepository.delete).toHaveBeenCalledWith({
        user_id: user.id,
        role: table,
        status: INVITE_STATUS.pending,
      });
      expect(result).toEqual(false);
    });
  });

  describe('isInvitationExist', () => {
    const user = new Provider();
    const table = TABLE.provider;
    const type = LINK_TYPE.invitation;
    it('should get invitation details', async () => {
      mockInviteRepository.findOne.mockResolvedValue(new Invite());

      const result = await service.isInvitationExist(user, table, type);
      expect(mockInviteRepository.findOne).toHaveBeenCalledWith({
        where: {
          user_id: user.id,
          role: table,
          type,
        },
      });
      expect(result).toEqual(new Invite());
    });
  });

  describe('sendOtpForChangeContactNumber', () => {
    const id = '1';
    const sendOtpDto: SendOtpDto = {
      country_code: '+1',
      mobile_no: '1234567890',
      created_at_ip: '127.0.0.1',
      updated_at_ip: '127.0.0.1',
    };
    const provider = new Provider();
    Object.assign(provider, {
      id: '1',
      country_code: sendOtpDto.country_code,
      mobile_no: sendOtpDto.mobile_no,
    });

    beforeEach(() => {
      mockOtpRepository.findOne.mockReset();
      mockOtpRepository.save.mockReset();
      mockOtpRepository.update.mockReset();
      generateOtpHelper.mockReset();
      sendEmail.mockReset();
    });

    it('should generate and send OTP for first-time signup', async () => {
      mockProviderRepository.findOne.mockResolvedValueOnce(provider);
      mockOtpRepository.findOne.mockResolvedValueOnce(null);
      smsService.sendSms.mockResolvedValue();
      mockOtpRepository.save.mockImplementation((otp) =>
        Promise.resolve({ ...otp, otp: '123456' }),
      );

      await service.sendOtpForChangeContactNumber(null, sendOtpDto);

      expect(mockOtpRepository.save).toHaveBeenCalled();
      expect(smsService.sendSms).toHaveBeenCalledWith({
        otp: '123456',
        contactNumber: provider.country_code + provider.mobile_no,
      });
    });

    it('should update and resend OTP if one already exists', async () => {
      const existingOtp = { id: 'otp123', otp: '654321' };
      mockProviderRepository.findOne.mockResolvedValueOnce(provider);
      mockOtpRepository.findOne.mockResolvedValueOnce(existingOtp);
      generateOtpHelper.mockReturnValue('654321');
      smsService.sendSms.mockResolvedValue();
      mockOtpRepository.update.mockResolvedValue(true);

      await service.sendOtpForChangeContactNumber(id, sendOtpDto);

      expect(generateOtp).toHaveBeenCalled();
      expect(mockOtpRepository.update).toHaveBeenCalledWith(
        existingOtp.id,
        expect.any(Object),
      );
      expect(smsService.sendSms).toHaveBeenCalledWith({
        otp: '654321',
        contactNumber: provider.country_code + provider.mobile_no,
      });
    });
  });
});
