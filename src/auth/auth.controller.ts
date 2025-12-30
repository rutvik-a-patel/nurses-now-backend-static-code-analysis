import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { ProviderEmailSignupDto } from './dto/provider-email-signup.dto';
import { ProviderMobileSignupDto } from './dto/provider-mobile-signup.dto';
import { CONSTANT } from '@/shared/constants/message';
import { SignupFacilityUserDto } from './dto/signup-facility-user.dto';
import { ProviderMobileLoginDto } from './dto/provider-mobile-login.dto';
import { EmailLoginDto } from './dto/email-login.dto';
import { SignupFacilityDto } from './dto/signup-facility.dto';
import { FacilityService } from '@/facility/facility.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import generateToken from '@/shared/helpers/generate-token';
import response from '@/shared/response';
import { SocialSignupProvider } from './dto/social-signup.dto';
import { FacilityUserService } from '@/facility-user/facility-user.service';
import { AdminService } from '@/admin/admin.service';
import { AUTH_TABLE, AuthPayload, IRequest } from '@/shared/constants/types';
import {
  ENTITY_STATUS,
  EJS_FILES,
  LINK_TYPE,
  OTP_TYPE,
  TABLE,
  USER_STATUS,
  SHIFT_STATUS,
  ACTIVITY_TYPE,
} from '@/shared/constants/enum';
import { ProviderService } from '@/provider/provider.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import sendEmailHelper from '@/shared/helpers/send-email-helper';
import { RoleSectionPermissionService } from '@/role-section-permission/role-section-permission.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { IsNull, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from '@/token/entities/token.entity';
import {
  dummyLogout,
  salt,
  allowedTables,
  maxLoginAttemptsAllowed,
  applicant,
  active,
} from '@/shared/constants/constant';
import { ShiftTableColumns } from '@/shared/constants/default-column-preference';
import { VerifyStaticTokeGuard } from '@/shared/guard/verify-static-token.guard';
import { VerifyFirebaseTokeGuard } from '@/shared/guard/verify-firebase-token.guard';
import { AppleSignupDto } from './dto/apple-signup.dto';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { SendOtpDto } from './dto/send-otp.dto';
import { Provider } from '@/provider/entities/provider.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { ColumnsPreferenceService } from '@/columns-preference/columns-preference.service';
import { ShiftService } from '@/shift/shift.service';
import { AIService } from '@/shared/helpers/ai-service';
import { AutoSchedulingService } from '@/shared/helpers/auto-scheduling';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';
import { AutoSchedulingSettingService } from '@/auto-scheduling-setting/auto-scheduling-setting.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly facilityService: FacilityService,
    private readonly facilityUserService: FacilityUserService,
    private readonly adminService: AdminService,
    private readonly providerService: ProviderService,
    private readonly roleSectionPermissionService: RoleSectionPermissionService,
    private readonly encryptDecryptService: EncryptDecryptService,
    private readonly columnsPreferenceService: ColumnsPreferenceService,
    private readonly shiftService: ShiftService,
    private readonly aiService: AIService,
    private readonly autoSchedulingService: AutoSchedulingService,
    private readonly autoSchedulingSettingService: AutoSchedulingSettingService,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    @InjectRepository(StatusSetting)
    private readonly statusSettingRepository: Repository<StatusSetting>,
  ) {}

  @UseGuards(VerifyStaticTokeGuard)
  @Post('facility-user/signup')
  async signupFacilityUser(
    @Body() signupFacilityUserDto: SignupFacilityUserDto,
  ) {
    try {
      const facilityUser = await this.authService.doesUserExists(
        {
          email: signupFacilityUserDto.email,
          country_code: signupFacilityUserDto.country_code,
          mobile_no: signupFacilityUserDto.mobile_no,
        },
        this.facilityUserService,
      );

      if (!facilityUser) {
        return response.badRequest({
          message: CONSTANT.ERROR.WRONG_CREDENTIALS,
          data: {},
        });
      }

      signupFacilityUserDto.password = await bcrypt.hash(
        signupFacilityUserDto.password,
        salt,
      );

      const result = await this.facilityUserService.update(facilityUser.id, {
        ...signupFacilityUserDto,
        is_email_verified: true,
      });

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.SIGN_UP
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @UseGuards(VerifyStaticTokeGuard)
  @Post('provider/signup')
  async providerEmailSignUp(
    @Body() providerEmailSignupDto: ProviderEmailSignupDto,
  ) {
    try {
      const provider: Provider = await this.authService.doesUserExists(
        {
          email: providerEmailSignupDto.email,
        },
        this.providerService,
      );

      if (provider) {
        if (provider.profile_status === USER_STATUS.deleted) {
          // Allow creating a new account if the provider is deleted
          providerEmailSignupDto.id = undefined;
        } else if (provider.is_email_verified && !provider.is_active) {
          // Account exists with email verified but is inactive
          return response.badRequest({
            message: CONSTANT.ERROR.ACCOUNT_INACTIVE,
            data: {},
          });
        } else {
          // Account exists but email not verified
          return response.badRequest({
            message: CONSTANT.ERROR.EMAIL_ALREADY_EXIST,
            data: {},
          });
        }
      }

      if (providerEmailSignupDto.referral_by) {
        const referred_by = this.encryptDecryptService.decrypt(
          providerEmailSignupDto.referral_by,
        );

        const referred =
          await this.authService.updateReferredFriendStatusByEmail(
            providerEmailSignupDto.email,
            referred_by,
          );
        Object.assign(providerEmailSignupDto, {
          country_code: referred?.country_code,
          mobile_no: referred?.mobile_no,
        });
      }

      providerEmailSignupDto.password = await bcrypt.hash(
        providerEmailSignupDto.password,
        salt,
      );

      await this.authService.providerSignUp(providerEmailSignupDto);

      return response.successCreate({
        message: CONSTANT.SUCCESS.COMPLETE_EMAIL_VERIFICATION,
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @UseGuards(VerifyStaticTokeGuard)
  @Patch('verify-signup/:table')
  async signUpVerification(
    @Param('table') table: AUTH_TABLE,
    @Body() verifyEmailDto: VerifyEmailDto,
  ) {
    try {
      if (!allowedTables.includes(table as string)) {
        return response.badRequest({
          message: CONSTANT.ERROR.SOMETHING_WENT_WRONG,
          data: {},
        });
      }

      const authServices = {
        provider: this.providerService,
        admin: this.adminService,
        facility_user: this.facilityUserService,
        facility: this.facilityService,
      };
      const authTableService = authServices[table];
      verifyEmailDto.email = await this.encryptDecryptService.decrypt(
        verifyEmailDto.email,
      );

      const data = await this.authService.doesUserExists(
        { email: verifyEmailDto.email },
        authTableService,
      );

      if (!data) {
        return response.badRequest({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
          data: {},
        });
      }

      if (
        table === TABLE.provider &&
        (data as Provider).profile_status === USER_STATUS.deleted
      ) {
        return response.badRequest({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
          data: {},
        });
      }
      const isInvitationExist = await this.authService.isInvitationExist(
        data,
        table as TABLE,
        LINK_TYPE.invitation,
      );

      const isInvitationExpired = await this.authService.isInvitationExpired(
        data,
        table as TABLE,
        LINK_TYPE.invitation,
      );

      if (!isInvitationExist || isInvitationExpired) {
        return response.badRequest({
          message: CONSTANT.ERROR.URL_EXPIRED,
          data: {},
        });
      }

      const updateDto = {
        updated_at_ip: verifyEmailDto.updated_at_ip,
        is_email_verified: true,
      };

      const result = await authTableService.update(data.id, updateDto);

      if (table != TABLE.facility) {
        await this.authService.acceptInvitation(data, table as TABLE);
      }

      const userId = await this.encryptDecryptService.encrypt(data.id);
      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.EMAIL_VERIFIED
          : CONSTANT.ERROR.EMAIL_NOT_VERIFIED,
        data: result.affected
          ? {
              id: userId,
            }
          : {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @UseGuards(VerifyFirebaseTokeGuard)
  @Post('signup/google')
  async signupWithGoogle(
    @Req() req: IRequest,
    @Body() socialSignupProvider: SocialSignupProvider,
  ) {
    try {
      const { social_user } = req;
      const [first_name, last_name = ''] = social_user?.name?.split(' ') ?? [];

      let provider = await this.providerService.findOneWhere({
        relations: {
          certificate: true,
          address: true,
          speciality: true,
          status: true,
        },
        where: {
          email: social_user.email,
          profile_status: Not(USER_STATUS.deleted),
        },
        order: { created_at: 'DESC' },
      });

      if (
        provider &&
        ((provider.status.name !== active &&
          provider.profile_progress === 100) ||
          provider.status.name !== applicant)
      ) {
        return response.badRequest({
          message: CONSTANT.VALIDATION.USER_RESTRICTED,
          data: {},
        });
      }
      if (!provider) {
        const statusSetting = await this.statusSettingRepository.findOne({
          where: { name: applicant },
        });

        // attaching the referral info if present
        if (socialSignupProvider.referral_by) {
          const referred_by = this.encryptDecryptService.decrypt(
            socialSignupProvider.referral_by,
          );

          const referred =
            await this.authService.updateReferredFriendStatusByEmail(
              social_user.email,
              referred_by,
            );
          Object.assign(socialSignupProvider, {
            country_code: referred?.country_code,
            mobile_no: referred?.mobile_no,
          });
        }

        // account create
        provider = await this.providerService.create({
          email: social_user.email,
          google_id: social_user.user_id,
          first_name,
          last_name,
          is_email_verified: true,
          status: statusSetting ? statusSetting.id : null,
          ...(socialSignupProvider.country_code &&
            socialSignupProvider.mobile_no && {
              country_code: socialSignupProvider.country_code,
              mobile_no: socialSignupProvider.mobile_no,
            }),
        });
      }

      const jwt = generateToken(provider.id, 'provider_id', 'provider');
      const token = await this.authService.createUserToken(
        {
          provider_id: provider.id,
          jwt,
          firebase: socialSignupProvider.firebase,
          device_id: socialSignupProvider.device_id,
          device_name: socialSignupProvider.device_name,
          device_type: socialSignupProvider.device_type,
          created_at_ip: socialSignupProvider.created_at_ip,
          updated_at_ip: socialSignupProvider.updated_at_ip,
        },
        'provider_id',
        'provider',
      );

      return response.successCreate({
        message: CONSTANT.SUCCESS.SIGN_UP,
        data: {
          id: provider.id,
          is_active: provider.is_active,
          is_email_verified: provider.is_email_verified,
          is_signup_completed:
            provider.address &&
            provider.address.length &&
            provider.certificate &&
            provider.speciality
              ? true
              : false,
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
          jwt: token,
        },
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Throttle({
    default: { limit: 3, ttl: 60000 },
  })
  @UseGuards(VerifyStaticTokeGuard, ThrottlerGuard)
  @Post('provider/mobile-signup')
  async providerMobileSignUp(
    @Body() providerMobileSignupDto: ProviderMobileSignupDto,
  ) {
    try {
      const provider: Provider = await this.authService.doesUserExists(
        {
          mobile_no: providerMobileSignupDto.mobile_no,
          country_code: providerMobileSignupDto.country_code,
        },
        this.providerService,
      );

      if (provider) {
        if (provider.profile_status === USER_STATUS.deleted) {
          // Allow creating a new account if the provider is deleted
          providerMobileSignupDto.id = undefined;
        } else if (provider.is_mobile_verified && !provider.is_active) {
          // Account exists with mobile verified but is inactive
          return response.badRequest({
            message: CONSTANT.ERROR.ACCOUNT_INACTIVE,
            data: {},
          });
        } else {
          // Account exists but mobile not verified
          return response.badRequest({
            message: CONSTANT.ERROR.MOBILE_ALREADY_EXIST,
            data: {},
          });
        }
      }

      if (providerMobileSignupDto.referral_by) {
        const referred_by = this.encryptDecryptService.decrypt(
          providerMobileSignupDto.referral_by,
        );
        const referred =
          await this.authService.updateReferredFriendStatusByMobile(
            providerMobileSignupDto.country_code,
            providerMobileSignupDto.mobile_no,
            referred_by,
          );
        Object.assign(providerMobileSignupDto, {
          email: referred?.email,
        });
      }

      await this.authService.providerSignUp(providerMobileSignupDto, false);

      return response.successCreate({
        message: CONSTANT.SUCCESS.COMPLETE_VERIFICATION('Signup'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @UseGuards(VerifyStaticTokeGuard)
  @Post('provider/verify-signup-otp')
  async verifySignupOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    try {
      const otp = await this.authService.findOtp({
        where: {
          is_verified: false,
          type: OTP_TYPE.signup,
          country_code: verifyOtpDto.country_code,
          contact_number: verifyOtpDto.mobile_no,
          otp: verifyOtpDto.otp,
        },
        relations: {
          provider: true,
        },
      });

      if (!otp) {
        return response.badRequest({
          message: CONSTANT.ERROR.INVALID_OTP,
          data: {},
        });
      }

      const result = await this.authService.verifySignupOtp(otp, verifyOtpDto);
      return result;
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @UseGuards(VerifyStaticTokeGuard)
  @Post('facility/signup')
  async facilitySignup(@Body() signupFacilityDto: SignupFacilityDto) {
    try {
      const emailOrMobileExists: Facility =
        await this.authService.doesUserExists(
          {
            email: signupFacilityDto.email,
            country_code: signupFacilityDto.country_code,
            mobile_no: signupFacilityDto.mobile_no,
          },
          this.facilityService,
        );

      if (emailOrMobileExists) {
        if (emailOrMobileExists.is_email_verified) {
          return response.badRequest({
            message: CONSTANT.ERROR.EMAIL_OR_MOBILE_ALREADY_EXIST,
            data: {},
          });
        } else {
          signupFacilityDto.id = emailOrMobileExists.id;
        }
      }

      signupFacilityDto.password = await bcrypt.hash(
        signupFacilityDto.password,
        salt,
      );

      const email = await this.encryptDecryptService.encrypt(
        signupFacilityDto.email,
      );

      signupFacilityDto.base_url = process.env.AWS_ASSETS_PATH;
      const data = await this.facilityService.create({
        ...signupFacilityDto,
        is_master: true,
      });

      const invite = await this.authService.createInvite(data, 'facility');
      await sendEmailHelper({
        email: signupFacilityDto.email,
        name: signupFacilityDto.name,
        redirectUrl: `${process.env.EMAIL_VERIFICATION_URL}verification?type=facility&email=${email}&id=${invite.id}`,
        email_type: EJS_FILES.verification,
        subject: CONSTANT.EMAIL.VERIFICATION_SUBJECT,
      });

      return response.successCreate({
        message: CONSTANT.SUCCESS.SIGN_UP,
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Throttle({
    default: { limit: 2, ttl: 60000 },
  })
  @UseGuards(VerifyStaticTokeGuard, ThrottlerGuard)
  @Post('provider/mobile-login')
  async providerMobileLogin(
    @Body() providerMobileLoginDto: ProviderMobileLoginDto,
  ) {
    try {
      // find provider
      const provider = await this.providerService.findOneWhere({
        where: {
          country_code: providerMobileLoginDto.country_code,
          mobile_no: providerMobileLoginDto.mobile_no,
          profile_status: Not(USER_STATUS.deleted),
        },
        relations: { status: true },
        order: { created_at: 'DESC' },
      });

      if (!provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.MOBILE_NOT_REGISTERED,
          data: {},
        });
      }

      if (![active, applicant].includes(provider.status.name)) {
        return response.badRequest({
          message: CONSTANT.VALIDATION.USER_RESTRICTED,
          data: {},
        });
      }

      const result = await this.authService.providerMobileLogin(
        provider,
        providerMobileLoginDto,
      );

      return result;
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @UseGuards(VerifyStaticTokeGuard)
  @Post('provider/verify-login-otp')
  async verifyLoginOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
    @Req() req: IRequest,
  ) {
    try {
      const otp = await this.authService.findOtp({
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
      if (!otp) {
        return response.badRequest({
          message: CONSTANT.ERROR.INVALID_OTP,
          data: {},
        });
      }
      Object.assign(verifyOtpDto, { device_name: req.headers['user-agent'] });
      const result = await this.authService.verifyLoginOtp(otp, verifyOtpDto);
      return result;
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Throttle({
    default: { limit: 2, ttl: 60000 },
  })
  @UseGuards(VerifyStaticTokeGuard, ThrottlerGuard)
  @Patch('provider/resend-otp')
  async resendOTP(@Body() resendOtpDto: ResendOtpDto) {
    try {
      const provider = await this.providerService.findOneWhere({
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
        relations: { status: true },
        order: { created_at: 'DESC' },
      });

      if (!provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.WRONG_CREDENTIALS,
          data: {},
        });
      }
      if (![active, applicant].includes(provider.status.name)) {
        return response.badRequest({
          message: CONSTANT.VALIDATION.USER_RESTRICTED,
          data: {},
        });
      }
      const result = await this.authService.resendOTP(provider, resendOtpDto);

      return result;
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @UseGuards(VerifyStaticTokeGuard)
  @Post('provider/login') // This is Login with email and password API
  async login(@Body() emailLoginDto: EmailLoginDto, @Req() req: IRequest) {
    try {
      // find provider
      const provider = await this.providerService.findOneWhere({
        where: {
          email: emailLoginDto.email,
          profile_status: Not(USER_STATUS.deleted),
        },
        order: { created_at: 'DESC' },
        relations: { status: true },
      });

      if (!provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.PROVIDER_NOT_REGISTERED,
          data: {},
        });
      }

      if (![active, applicant].includes(provider.status.name)) {
        return response.badRequest({
          message: CONSTANT.VALIDATION.USER_RESTRICTED,
          data: {},
        });
      }

      Object.assign(emailLoginDto, {
        device_name: req.headers['user-agent'],
      });

      const result = await this.authService.login(provider, emailLoginDto);

      return result;
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @UseGuards(VerifyFirebaseTokeGuard)
  @Post('login/google')
  async loginWithGoogle(
    @Body() emailLoginDto: SocialSignupProvider,
    @Req() req: IRequest,
  ) {
    try {
      // find Provider
      const { social_user } = req;
      let provider = await this.providerService.findOneWhere({
        relations: {
          certificate: true,
          address: true,
          speciality: true,
          status: true,
        },
        where: {
          email: social_user.email,
          profile_status: Not(USER_STATUS.deleted),
        },
        order: { created_at: 'DESC' },
      });

      const name = social_user.name ? social_user.name.split(' ') : [];
      if (!provider) {
        const statusSetting = await this.statusSettingRepository.findOne({
          where: { name: applicant },
        });
        provider = await this.providerService.create({
          email: social_user.email,
          google_id: social_user.user_id,
          first_name: name.length ? name[0] : '',
          last_name: name.length > 1 ? name[1] : '',
          is_email_verified: true,
          status: statusSetting ? statusSetting.id : null,
        });
      }

      if (![active, applicant].includes(provider.status.name)) {
        return response.badRequest({
          message: CONSTANT.VALIDATION.USER_RESTRICTED,
          data: {},
        });
      }

      Object.assign(emailLoginDto, { device_name: req.headers['user-agent'] });

      const jwt = generateToken(provider.id, 'provider_id', 'provider');
      const token = await this.authService.createUserToken(
        {
          provider_id: provider.id,
          jwt,
          firebase: emailLoginDto.firebase,
          device_id: emailLoginDto.device_id,
          device_name: emailLoginDto.device_name,
          device_type: emailLoginDto.device_type,
          created_at_ip: emailLoginDto.created_at_ip,
          updated_at_ip: emailLoginDto.updated_at_ip,
        },
        'provider_id',
        'provider',
      );
      return response.successCreate({
        message: CONSTANT.SUCCESS.LOGIN,
        data: {
          id: provider.id,
          is_active: provider.is_active,
          is_email_verified: provider.is_email_verified,
          is_signup_completed:
            provider.address &&
            provider.address.length &&
            provider.certificate &&
            provider.speciality
              ? true
              : false,
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
          jwt: token,
        },
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @UseGuards(VerifyStaticTokeGuard)
  @Post('facility/login')
  async facilityLogin(
    @Body() emailLoginDto: EmailLoginDto,
    @Req() req: IRequest,
  ) {
    try {
      const facility = await this.facilityService.findOneWhere({
        where: {
          email: emailLoginDto.email,
          is_email_verified: true,
        },
      });

      if (!facility) {
        return response.recordNotFound({
          message: CONSTANT.ERROR.NOT_REGISTERED,
          data: {
            email_not_registered: true,
          },
        });
      }

      if (facility.login_attempt === maxLoginAttemptsAllowed) {
        const lastAttemptTime = new Date(facility.login_attempt_at).getTime();
        const currentTime = new Date().getTime();
        const timeDifference = (currentTime - lastAttemptTime) / (1000 * 60); // difference in minutes

        if (timeDifference <= 15) {
          return response.badRequest({
            message: CONSTANT.ERROR.ACCOUNT_SUSPENDED,
            data: {
              account_locked: true,
            },
          });
        }
      }

      Object.assign(emailLoginDto, {
        device_name: req.headers['user-agent'],
      });

      // compare the password
      const isSame = await bcrypt.compare(
        emailLoginDto.password,
        facility.password,
      );

      if (!isSame) {
        await this.facilityService.update(facility.id, {
          login_attempt: facility.login_attempt + 1,
          login_attempt_at: new Date().toISOString(),
        });

        return response.recordNotFound({
          message: CONSTANT.ERROR.WRONG_CREDENTIALS,
          data: {
            wrong_credentials: true,
          },
        });
      }

      if (facility.login_attempt > 0) {
        await this.facilityService.update(facility.id, {
          login_attempt: 0,
          login_attempt_at: null,
        });
      }

      // generate jwt token
      const jwt = generateToken(
        facility.id,
        'facility_id',
        'facility',
        process.env.JWT_ACCESS_EXPIRES,
      );
      let refreshJwt;
      if (emailLoginDto.remember_me) {
        // generate refresh jwt token
        refreshJwt = generateToken(
          facility.id,
          'facility_id',
          'facility',
          process.env.JWT_REFRESH_EXPIRES,
          process.env.JWT_REFRESH_SECRET,
        );
      }
      const token = await this.authService.createUserTokenV2(
        {
          remember_me: emailLoginDto.remember_me,
          facility_id: facility.id,
          jwt,
          refresh_jwt: refreshJwt,
          firebase: emailLoginDto.firebase,
          device_id: emailLoginDto.device_id,
          device_name: emailLoginDto.device_name,
          device_type: emailLoginDto.device_type,
          created_at_ip: emailLoginDto.created_at_ip,
          updated_at_ip: emailLoginDto.updated_at_ip,
        },
        'facility_id',
        'facility',
      );

      delete facility.password;

      const result = {
        status: HttpStatus.OK,
        message: CONSTANT.SUCCESS.LOGIN,
        data: {
          ...facility,
          ...token,
        },
      };
      return response.successResponse(result);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @UseGuards(VerifyStaticTokeGuard)
  @Post('admin/login')
  async adminLogin(@Body() emailLoginDto: EmailLoginDto, @Req() req: IRequest) {
    try {
      const admin = await this.adminService.findOneWhere({
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

      if (admin?.status === ENTITY_STATUS.in_active) {
        return response.recordNotFound({
          message: CONSTANT.ERROR.ACCOUNT_INACTIVE,
          data: {
            account_inactive: true,
          },
        });
      }

      if (!admin) {
        return response.recordNotFound({
          message: CONSTANT.ERROR.NOT_REGISTERED,
          data: {
            email_not_registered: true,
          },
        });
      }

      if (admin.login_attempt === maxLoginAttemptsAllowed) {
        const lastAttemptTime = new Date(admin.login_attempt_at).getTime();
        const currentTime = new Date().getTime();
        const timeDifference = (currentTime - lastAttemptTime) / (1000 * 60); // difference in minutes

        if (timeDifference <= 15) {
          return response.badRequest({
            message: CONSTANT.ERROR.ACCOUNT_SUSPENDED,
            data: {
              account_locked: true,
            },
          });
        }
      }

      const permissions = admin?.role?.id
        ? await this.roleSectionPermissionService.getSectionPermissions(
            admin.role.id,
          )
        : [];

      Object.assign(emailLoginDto, {
        device_name: req.headers['user-agent'],
      });

      // compare the password
      const isSame =
        emailLoginDto.password && admin.password
          ? await bcrypt.compare(emailLoginDto.password, admin.password)
          : false;
      if (!isSame) {
        await this.adminService.update(admin.id, {
          login_attempt: admin.login_attempt + 1,
          login_attempt_at: new Date().toISOString(),
        });

        return response.recordNotFound({
          message: CONSTANT.ERROR.WRONG_CREDENTIALS,
          data: {
            wrong_credentials: true,
          },
        });
      }

      if (admin.login_attempt > 0) {
        await this.adminService.update(admin.id, {
          login_attempt: 0,
          login_attempt_at: null,
        });
      }

      // generate jwt token
      const jwt = generateToken(
        admin.id,
        'admin_id',
        'admin',
        process.env.JWT_ACCESS_EXPIRES,
      );
      let refreshJwt;
      if (emailLoginDto.remember_me) {
        // generate refresh jwt token
        refreshJwt = generateToken(
          admin.id,
          'admin_id',
          'admin',
          process.env.JWT_REFRESH_EXPIRES,
          process.env.JWT_REFRESH_SECRET,
        );
      }

      const token = await this.authService.createUserTokenV2(
        {
          remember_me: emailLoginDto.remember_me,
          admin_id: admin.id,
          jwt: jwt,
          refresh_jwt: refreshJwt,
          firebase: emailLoginDto.firebase,
          device_id: emailLoginDto.device_id,
          device_name: emailLoginDto.device_name,
          device_type: emailLoginDto.device_type,
          created_at_ip: emailLoginDto.created_at_ip,
          updated_at_ip: emailLoginDto.updated_at_ip,
        },
        'admin_id',
        'admin',
      );

      delete admin.password;

      const columnsPreference = await this.columnsPreferenceService.findOne({
        where: { user_id: admin.id, table_type: 'shift' },
      });

      const result = {
        status: HttpStatus.OK,
        message: CONSTANT.SUCCESS.LOGIN,
        data: {
          ...admin,
          permissions: permissions,
          ...token,
          columns_preference: columnsPreference
            ? columnsPreference.columns_config
            : ShiftTableColumns,
        },
      };
      return response.successResponse(result);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  async refresh(@Req() req: IRequest) {
    try {
      // ✅ Here, the validated user will be attached to the request by the Guard
      const validToken = req.user as AuthPayload;
      // for taking the token from the header to update in the database
      const headerToken = req.headers['authorization'].split(' ')[1];
      const column =
        validToken.role === TABLE.admin
          ? 'admin_id'
          : validToken.role === TABLE.facility
            ? 'facility_id'
            : 'facility_user_id';

      const accessToken = generateToken(
        validToken.id,
        column,
        validToken.role,
        process.env.JWT_ACCESS_EXPIRES,
      );

      const refreshToken = generateToken(
        validToken.id,
        column,
        validToken.role,
        process.env.JWT_REFRESH_EXPIRES,
        process.env.JWT_REFRESH_SECRET,
      );
      // updating the old token to new one
      await this.tokenRepository.update(
        { refresh_jwt: headerToken },
        { jwt: accessToken, refresh_jwt: refreshToken },
      );
      return response.successResponse({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Token Refreshed'),
        data: { jwt: accessToken, refresh_jwt: refreshToken },
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Throttle({
    default: { limit: 2, ttl: 60000 },
  })
  @UseGuards(VerifyStaticTokeGuard, ThrottlerGuard)
  @Patch('forgot-password/:table')
  async forgotPassword(
    @Param('table') table: AUTH_TABLE,
    @Body() emailDto: VerifyEmailDto,
  ) {
    try {
      if (!allowedTables.includes(table as string)) {
        return response.badRequest({
          message: CONSTANT.ERROR.SOMETHING_WENT_WRONG,
          data: {},
        });
      }

      const authServices = {
        provider: this.providerService,
        admin: this.adminService,
        facility_user: this.facilityUserService,
        facility: this.facilityService,
      };
      const authTableService = authServices[table];

      const data = await authTableService.findOneWhere({
        where: {
          email: emailDto.email,
          ...(table === TABLE.provider
            ? { is_active: true, profile_status: Not(USER_STATUS.deleted) }
            : {}),
        },
        order: { created_at: 'DESC' },
      });

      if (!data) {
        return response.recordNotFound({
          message: CONSTANT.ERROR.NOT_REGISTERED,
          data: {
            email_not_registered: true,
          },
        });
      }

      await this.authService.sendForgotPasswordOTP(data, table);

      return response.successResponse({
        message: CONSTANT.EMAIL.SENT,
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  // for resetting password of non-authorized user
  @Throttle({
    default: { limit: 5, ttl: 60000 },
  })
  @UseGuards(VerifyStaticTokeGuard, ThrottlerGuard)
  @Patch('reset-password/:table')
  async resetPassword(
    @Param('table') table: AUTH_TABLE,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    try {
      if (!allowedTables.includes(table as string)) {
        return response.badRequest({
          message: CONSTANT.ERROR.SOMETHING_WENT_WRONG,
          data: {},
        });
      }

      const authServices = {
        provider: this.providerService,
        admin: this.adminService,
        facility_user: this.facilityUserService,
        facility: this.facilityService,
      };
      const authTableService = authServices[table];
      resetPasswordDto.email = this.encryptDecryptService.decrypt(
        resetPasswordDto.email,
      );

      const data = await authTableService.findOneWhere({
        where: {
          email: resetPasswordDto.email,
          ...(table === TABLE.provider
            ? { is_active: true, profile_status: Not(USER_STATUS.deleted) }
            : {}),
        },
        order: { created_at: 'DESC' },
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
          data: {},
        });
      }

      const isInvitationExist = await this.authService.isInvitationExist(
        data,
        table as TABLE,
        LINK_TYPE.forgot_password,
      );

      const isInvitationExpired = await this.authService.isInvitationExpired(
        data,
        table as TABLE,
        LINK_TYPE.forgot_password,
      );

      if (!isInvitationExist || isInvitationExpired) {
        return response.badRequest({
          message: CONSTANT.ERROR.URL_EXPIRED,
          data: {},
        });
      }

      resetPasswordDto.password = await bcrypt.hash(
        resetPasswordDto.password,
        salt,
      );
      await authTableService.update(data.id, resetPasswordDto);
      await this.authService.acceptInvitation(data, table as TABLE);

      return response.successResponse({
        message: CONSTANT.SUCCESS.PASSWORD_RESET,
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  // for resetting if the user is authorized
  @Throttle({
    default: { limit: 5, ttl: 60000 },
  })
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch('reset-authorized-password/:table')
  async resetAuthorizedPassword(
    @Param('table') table: AUTH_TABLE,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    try {
      if (!allowedTables.includes(table as string)) {
        return response.badRequest({
          message: CONSTANT.ERROR.SOMETHING_WENT_WRONG,
          data: {},
        });
      }

      const authServices = {
        provider: this.providerService,
        admin: this.adminService,
        facility_user: this.facilityUserService,
        facility: this.facilityService,
      };
      const authTableService = authServices[table];
      resetPasswordDto.email = this.encryptDecryptService.decrypt(
        resetPasswordDto.email,
      );

      const data = await authTableService.findOneWhere({
        where: {
          email: resetPasswordDto.email,
          ...(table === TABLE.provider
            ? { is_active: true, profile_status: Not(USER_STATUS.deleted) }
            : {}),
        },
        order: { created_at: 'DESC' },
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
          data: {},
        });
      }

      const isInvitationExist = await this.authService.isInvitationExist(
        data,
        table as TABLE,
        LINK_TYPE.forgot_password,
      );

      const isInvitationExpired = await this.authService.isInvitationExpired(
        data,
        table as TABLE,
        LINK_TYPE.forgot_password,
      );

      if (!isInvitationExist || isInvitationExpired) {
        return response.badRequest({
          message: CONSTANT.ERROR.URL_EXPIRED,
          data: {},
        });
      }

      resetPasswordDto.password = await bcrypt.hash(
        resetPasswordDto.password,
        salt,
      );
      await authTableService.update(data.id, resetPasswordDto);
      await this.authService.acceptInvitation(data, table as TABLE);

      return response.successResponse({
        message: CONSTANT.SUCCESS.PASSWORD_RESET,
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Throttle({
    default: { limit: 10, ttl: 60000 },
  })
  @UseGuards(AuthGuard('jwt'), ThrottlerGuard)
  @Patch('change-password/:table')
  async changePassword(
    @Param('table') table: AUTH_TABLE,
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: IRequest,
  ) {
    try {
      if (!allowedTables.includes(table as string)) {
        return response.badRequest({
          message: CONSTANT.ERROR.SOMETHING_WENT_WRONG,
          data: {},
        });
      }
      if (changePasswordDto.email !== req.user.email) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Account'),
          data: {},
        });
      }

      const authServices = {
        provider: this.providerService,
        admin: this.adminService,
        facility_user: this.facilityUserService,
        facility: this.facilityService,
      };
      const authTableService = authServices[table];

      const data = await authTableService.findOneWhere({
        where: {
          email: changePasswordDto.email,
          ...(table === TABLE.provider
            ? { is_active: true, profile_status: Not(USER_STATUS.deleted) }
            : {}),
        },
        order: { created_at: 'DESC' },
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.ERROR.WRONG_CREDENTIALS,
          data: {},
        });
      }
      if (!data.password) {
        return response.badRequest({
          message: CONSTANT.ERROR.PASSWORD_NOT_SET,
          data: {},
        });
      }

      const isPasswordMatch = await bcrypt.compare(
        changePasswordDto.old_password,
        data.password,
      );

      if (!isPasswordMatch) {
        return response.badRequest({
          message: CONSTANT.ERROR.INVALID_PASSWORD,
          data: {},
        });
      }

      const password = await bcrypt.hash(changePasswordDto.new_password, salt);
      const updateDto = {
        password,
        updated_at_ip: changePasswordDto.updated_at_ip,
        email: changePasswordDto.email,
      };
      await authTableService.update(data.id, updateDto);
      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_UPDATED('Password'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @UseGuards(VerifyStaticTokeGuard)
  @Post('facility-user/login')
  async facilityUserLogin(
    @Body() emailLoginDto: EmailLoginDto,
    @Req() req: IRequest,
  ) {
    try {
      const facilityUser = await this.facilityUserService.findOneWhere({
        where: {
          email: emailLoginDto.email,
          is_email_verified: true,
        },
      });

      if (!facilityUser) {
        return response.recordNotFound({
          message: CONSTANT.ERROR.NOT_REGISTERED,
          data: {
            email_not_registered: true,
          },
        });
      }

      const facility = await this.facilityService.findOneWhere({
        where: { id: facilityUser?.facility_id[0] },
        relations: { status: true },
      });

      if (
        facilityUser?.status === ENTITY_STATUS.in_active ||
        facility?.status.name !== active
      ) {
        let message = CONSTANT.ERROR.ACCOUNT_INACTIVE;
        if (facility?.status.name !== active) {
          message = CONSTANT.ERROR.FACILITY_INACTIVE;
        }
        return response.recordNotFound({
          message,
          data: {
            account_inactive: true,
          },
        });
      }

      if (facilityUser.login_attempt === maxLoginAttemptsAllowed) {
        const lastAttemptTime = new Date(
          facilityUser.login_attempt_at,
        ).getTime();
        const currentTime = new Date().getTime();
        const timeDifference = (currentTime - lastAttemptTime) / (1000 * 60); // difference in minutes

        if (timeDifference <= 15) {
          return response.badRequest({
            message: CONSTANT.ERROR.ACCOUNT_SUSPENDED,
            data: {
              account_locked: true,
            },
          });
        }
      }

      Object.assign(emailLoginDto, {
        device_name: req.headers['user-agent'],
      });

      const permissions =
        await this.facilityUserService.getFacilityUserPermissions(
          facilityUser.id,
        );

      // compare the password
      const isSame = await bcrypt.compare(
        emailLoginDto.password,
        facilityUser.password,
      );
      if (!isSame) {
        await this.facilityUserService.update(facilityUser.id, {
          login_attempt: facilityUser.login_attempt + 1,
          login_attempt_at: new Date().toISOString(),
        });

        return response.recordNotFound({
          message: CONSTANT.ERROR.WRONG_CREDENTIALS,
          data: {
            wrong_credentials: true,
          },
        });
      }

      if (facilityUser.login_attempt > 0) {
        await this.facilityUserService.update(facilityUser.id, {
          login_attempt: 0,
          login_attempt_at: null,
        });
      }

      // generate jwt token
      const jwt = generateToken(
        facilityUser.id,
        'facility_user_id',
        'facility_user',
        process.env.JWT_ACCESS_EXPIRES,
      );

      let refreshJwt;
      if (emailLoginDto.remember_me) {
        // generate refresh jwt token
        refreshJwt = generateToken(
          facilityUser.id,
          'facility_user_id',
          'facility_user',
          process.env.JWT_REFRESH_EXPIRES,
          process.env.JWT_REFRESH_SECRET,
        );
      }

      const token = await this.authService.createUserTokenV2(
        {
          remember_me: emailLoginDto.remember_me,
          facility_user_id: facilityUser.id,
          jwt,
          refresh_jwt: refreshJwt,
          firebase: emailLoginDto.firebase,
          device_id: emailLoginDto.device_id,
          device_name: emailLoginDto.device_name,
          device_type: emailLoginDto.device_type,
          created_at_ip: emailLoginDto.created_at_ip,
          updated_at_ip: emailLoginDto.updated_at_ip,
        },
        'facility_user_id',
        'facility_user',
      );

      delete facilityUser.password;

      const result = {
        status: HttpStatus.OK,
        message: CONSTANT.SUCCESS.LOGIN,
        data: {
          ...facilityUser,
          permissions: permissions,
          ...token,
        },
      };
      return response.successResponse(result);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Throttle({
    default: { limit: 2, ttl: 60000 },
  })
  @UseGuards(VerifyStaticTokeGuard, ThrottlerGuard)
  @Patch('resend-link/:table')
  async resendLink(
    @Param('table') table: AUTH_TABLE,
    @Body() emailDto: VerifyEmailDto,
  ) {
    try {
      if (!allowedTables.includes(table as string)) {
        return response.badRequest({
          message: CONSTANT.ERROR.SOMETHING_WENT_WRONG,
          data: {},
        });
      }

      const authServices = {
        provider: this.providerService,
        admin: this.adminService,
        facility_user: this.facilityUserService,
        facility: this.facilityService,
      };
      const authTableService = authServices[table];
      const userEmail = await this.encryptDecryptService.decrypt(
        emailDto.email,
      );
      const data = await authTableService.findOneWhere({
        where: {
          email: userEmail,
          ...(table === TABLE.provider
            ? { is_active: true, profile_status: Not(USER_STATUS.deleted) }
            : {}),
        },
        order: { created_at: 'DESC' },
      });

      if (!data) {
        return response.recordNotFound({
          message: CONSTANT.ERROR.NOT_REGISTERED,
          data: {
            email_not_registered: true,
          },
        });
      }

      await this.authService.sendForgotPasswordOTP(data, table);

      return response.successResponse({
        message: CONSTANT.EMAIL.SENT,
        data: {
          email: userEmail,
        },
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Throttle({
    default: { limit: 2, ttl: 60000 },
  })
  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard, ThrottlerGuard)
  @Patch('send-invitation/:table')
  async sendInvitation(
    @Param('table') table: 'admin' | 'facility_user',
    @Body() emailDto: VerifyEmailDto,
    @Req() req: IRequest,
    @Body('master_facility_id') master_facility_id?: string,
  ) {
    try {
      if (
        ![TABLE.admin as string, TABLE.facility_user as string].includes(
          table as string,
        )
      ) {
        return response.badRequest({
          message: CONSTANT.ERROR.SOMETHING_WENT_WRONG,
          data: {},
        });
      }

      const authServices = {
        admin: this.adminService,
        facility_user: this.facilityUserService,
      };
      const authTableService = authServices[table];
      const data = await authTableService.findOneWhere({
        where: { email: emailDto.email },
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
          data: {},
        });
      }
      let facility: Facility = null;
      if (master_facility_id) {
        facility = await this.facilityService.findOneWhere({
          where: { id: master_facility_id },
        });
      }

      await this.authService.sendInvitation(
        { ...data, status: ENTITY_STATUS.invited },
        table,
        facility?.name,
      );

      await authTableService.update(data.id, {
        status: ENTITY_STATUS.invited,
        updated_at_ip: emailDto.updated_at_ip,
      });

      // Log the activity
      await this.adminService.contactActivityLog(
        req,
        data.id,
        ACTIVITY_TYPE.CONTACT_RESEND_INVITATION,
        {
          contact_user: `${data.first_name} ${data.last_name}`,
          contact_user_email: data.email,
        },
      );

      return response.successResponse({
        message: CONSTANT.EMAIL.SENT,
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @UseGuards(VerifyStaticTokeGuard)
  @Get('get-profile/:table')
  async getProfileData(
    @Param('table') table: 'admin' | 'facility_user' | 'facility',
    @Query('id') id: string,
    @Query('invite_id') invite_id: string,
  ) {
    try {
      if (
        ![
          TABLE.admin as string,
          TABLE.facility_user as string,
          TABLE.facility as string,
        ].includes(table as string)
      ) {
        return response.badRequest({
          message: CONSTANT.ERROR.SOMETHING_WENT_WRONG,
          data: {},
        });
      }

      const authServices = {
        admin: this.adminService,
        facility_user: this.facilityUserService,
        facility: this.facilityService,
      };
      const authTableService = authServices[table];
      const userId = await this.encryptDecryptService.decrypt(id);
      const data = await authTableService.findOneWhere({
        where: { id: userId },
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
          data: {},
        });
      }

      const isInvitationExist = await this.authService.isInvitationExistV2(
        data,
        table as TABLE,
        LINK_TYPE.invitation,
        invite_id,
      );

      const isInvitationExpired = await this.authService.isInvitationExpired(
        data,
        table as TABLE,
        LINK_TYPE.invitation,
      );

      if (!isInvitationExist || isInvitationExpired) {
        return response.badRequest({
          message: CONSTANT.ERROR.URL_EXPIRED,
          data: {},
        });
      }

      delete data.password;
      data.id = id;

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Record'),
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @UseGuards(VerifyStaticTokeGuard)
  @Patch('accept-invitation')
  async acceptInvitation(
    @Query('table') table: TABLE.admin | TABLE.facility_user,
    @Query('id') id: string,
    @Body() acceptInvitationDto: AcceptInvitationDto,
  ) {
    try {
      if (
        ![TABLE.admin as string, TABLE.facility_user as string].includes(
          table as string,
        )
      ) {
        return response.badRequest({
          message: CONSTANT.ERROR.SOMETHING_WENT_WRONG,
          data: {},
        });
      }

      const authServices = {
        admin: this.adminService,
        facility_user: this.facilityUserService,
      };
      const authTableService = authServices[table];
      const userId = await this.encryptDecryptService.decrypt(id);

      const data = await authTableService.findOneWhere({
        where: {
          email: acceptInvitationDto.email,
          id: userId,
        },
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
          data: {},
        });
      }

      if (data.status == ENTITY_STATUS.active) {
        return response.badRequest({
          message: CONSTANT.ERROR.INVITATION_ALREADY_ACCEPTED,
          data: {},
        });
      }

      const isInvitationExist = await this.authService.isInvitationExist(
        data,
        table as TABLE,
        LINK_TYPE.invitation,
      );

      const isInvitationExpired = await this.authService.isInvitationExpired(
        data,
        table,
        LINK_TYPE.invitation,
      );

      if (!isInvitationExist || isInvitationExpired) {
        return response.badRequest({
          message: CONSTANT.ERROR.INVITATION_EXPIRED,
          data: {},
        });
      }

      acceptInvitationDto.password = await bcrypt.hash(
        acceptInvitationDto.password,
        salt,
      );

      const result = await authTableService.update(userId, {
        ...acceptInvitationDto,
        is_email_verified: true,
        status: ENTITY_STATUS.active,
      });

      await this.authService.acceptInvitation(data, table as TABLE);

      // Log the activity
      await this.adminService.contactActivityLog(
        { user: { id: data.id, role: table } } as IRequest,
        data.id,
        ACTIVITY_TYPE.CONTACT_ACTIVATED,
        {
          contact_user: `${data.first_name} ${data.last_name}`,
        },
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.SIGN_UP
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @UseGuards(VerifyFirebaseTokeGuard)
  @Post(['signup/apple', 'login/apple'])
  async signupWithApple(
    @Req() req: IRequest,
    @Body() appleSignupDto: AppleSignupDto,
  ) {
    try {
      const { social_user } = req;
      let message = CONSTANT.SUCCESS.LOGIN;
      let provider = await this.providerService.findOneWhere({
        relations: {
          certificate: true,
          address: true,
          speciality: true,
          status: true,
        },
        where: {
          apple_id: social_user.user_id,
          profile_status: Not(USER_STATUS.deleted),
        },
        order: { created_at: 'DESC' },
      });

      if (!provider) {
        const statusSetting = await this.statusSettingRepository.findOne({
          where: { name: applicant },
        });

        // attaching the referral info if present
        if (appleSignupDto.referral_by) {
          const referred_by = this.encryptDecryptService.decrypt(
            appleSignupDto.referral_by,
          );

          const referred =
            await this.authService.updateReferredFriendStatusByEmail(
              social_user.email,
              referred_by,
            );
          Object.assign(appleSignupDto, {
            country_code: referred?.country_code,
            mobile_no: referred?.mobile_no,
          });
        }

        message = CONSTANT.SUCCESS.SIGN_UP;
        provider = await this.providerService.create({
          email: appleSignupDto.is_private_email ? null : social_user.email,
          apple_id: social_user.user_id,
          is_email_verified: true,
          status: statusSetting ? statusSetting.id : null,
          ...(appleSignupDto.country_code &&
            appleSignupDto.mobile_no && {
              country_code: appleSignupDto.country_code,
              mobile_no: appleSignupDto.mobile_no,
            }),
        });
      }

      if (![active, applicant].includes(provider.status.name)) {
        return response.badRequest({
          message: CONSTANT.VALIDATION.USER_RESTRICTED,
          data: {},
        });
      }

      const jwt = generateToken(provider.id, 'provider_id', 'provider');
      const token = await this.authService.createUserToken(
        {
          provider_id: provider.id,
          jwt,
          firebase: appleSignupDto.firebase,
          device_id: appleSignupDto.device_id,
          device_name: appleSignupDto.device_name,
          device_type: appleSignupDto.device_type,
          created_at_ip: appleSignupDto.created_at_ip,
          updated_at_ip: appleSignupDto.updated_at_ip,
        },
        'provider_id',
        'provider',
      );

      return response.successCreate({
        message: message,
        data: {
          id: provider.id,
          is_active: provider.is_active,
          is_email_verified: provider.is_email_verified,
          is_signup_completed:
            provider.address &&
            provider.address.length &&
            provider.certificate &&
            provider.speciality
              ? true
              : false,
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
          jwt: token,
        },
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Req() req: any) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader.split(' ')[1];
      const time = new Date().toISOString();

      const isExist = await this.tokenRepository.findOne({
        where: {
          [req.user.role]: { id: req.user.id },
          jwt: token,
          deleted_at: IsNull(),
        },
      });

      if (!isExist) {
        const data = {
          message: CONSTANT.ERROR.SOMETHING_WENT_WRONG,
          data: {},
        };
        return response.badRequest(data);
      }

      const result = await this.tokenRepository.update(
        { id: isExist.id, deleted_at: IsNull() },
        {
          jwt: dummyLogout,
          deleted_at_ip: req.body.updated_at_ip,
          deleted_at: time,
        },
      );
      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.LOGOUT
          : CONSTANT.ERROR.SOMETHING_WENT_WRONG,
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @UseGuards(VerifyStaticTokeGuard)
  @Get('link-status/:table')
  async checkLinkStatus(
    @Param('table') table: TABLE,
    @Query('email') email: string,
  ) {
    try {
      const authServices = {
        admin: this.adminService,
        facility_user: this.facilityUserService,
        facility: this.facilityService,
        provider: this.providerService,
      };
      const authTableService = authServices[table];
      const userEmail = await this.encryptDecryptService.decrypt(email);
      const data = await authTableService.findOneWhere({
        where: { email: userEmail },
      });

      const isInvitationExist = await this.authService.isInvitationExist(
        data,
        table as TABLE,
        LINK_TYPE.forgot_password,
      );

      const isInvitationExpired = await this.authService.isInvitationExpired(
        data,
        table as TABLE,
        LINK_TYPE.forgot_password,
      );

      if (!isInvitationExist || isInvitationExpired) {
        return response.badRequest({
          message: CONSTANT.ERROR.URL_EXPIRED,
          data: {},
        });
      }
      return response.successResponse({
        message: CONSTANT.SUCCESS.DEFAULT,
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  // for checking the status of the non-authorized user
  @UseGuards(VerifyStaticTokeGuard)
  @Get('link-status/v2/:table')
  async checkLinkStatusV2(
    @Param('table') table: TABLE,
    @Query('email') email: string,
    @Query('id') id: string,
  ) {
    try {
      const authServices = {
        admin: this.adminService,
        facility_user: this.facilityUserService,
        facility: this.facilityService,
        provider: this.providerService,
      };
      const authTableService = authServices[table];
      const userEmail = await this.encryptDecryptService.decrypt(email);
      const data = await authTableService.findOneWhere({
        where: {
          email: userEmail,
          ...(table === TABLE.provider
            ? { profile_status: Not(USER_STATUS.deleted) }
            : {}),
        },
        order: { created_at: 'DESC' },
      });

      let isInvitationExist = await this.authService.isInvitationExistV2(
        data,
        table as TABLE,
        LINK_TYPE.forgot_password,
        id,
      );

      if (!isInvitationExist) {
        isInvitationExist = await this.authService.isInvitationExistV2(
          data,
          table as TABLE,
          LINK_TYPE.invitation,
          id,
        );
      }
      let isInvitationExpired = await this.authService.isInvitationExpiredV2(
        data,
        table as TABLE,
        LINK_TYPE.forgot_password,
        id,
      );
      if (!isInvitationExpired) {
        isInvitationExpired = await this.authService.isInvitationExpiredV2(
          data,
          table as TABLE,
          LINK_TYPE.invitation,
          id,
        );
      }
      if (!isInvitationExist || isInvitationExpired) {
        return response.badRequest({
          message: CONSTANT.ERROR.URL_EXPIRED,
          data: {},
        });
      }
      return response.successResponse({
        message: CONSTANT.SUCCESS.DEFAULT,
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  // for checking the status of the authorized user
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('auth-link-status/v2/:table')
  async checkAuthorizedLinkStatus(
    @Param('table') table: TABLE,
    @Query('email') email: string,
    @Query('id') id: string,
  ) {
    try {
      const authServices = {
        admin: this.adminService,
        facility_user: this.facilityUserService,
        facility: this.facilityService,
        provider: this.providerService,
      };
      const authTableService = authServices[table];
      const userEmail = await this.encryptDecryptService.decrypt(email);
      const data = await authTableService.findOneWhere({
        where: {
          email: userEmail,
          ...(table === TABLE.provider
            ? { profile_status: Not(USER_STATUS.deleted) }
            : {}),
        },
        order: { created_at: 'DESC' },
      });

      let isInvitationExist = await this.authService.isInvitationExistV2(
        data,
        table as TABLE,
        LINK_TYPE.forgot_password,
        id,
      );

      if (!isInvitationExist) {
        isInvitationExist = await this.authService.isInvitationExistV2(
          data,
          table as TABLE,
          LINK_TYPE.invitation,
          id,
        );
      }
      let isInvitationExpired = await this.authService.isInvitationExpiredV2(
        data,
        table as TABLE,
        LINK_TYPE.forgot_password,
        id,
      );
      if (!isInvitationExpired) {
        isInvitationExpired = await this.authService.isInvitationExpiredV2(
          data,
          table as TABLE,
          LINK_TYPE.invitation,
          id,
        );
      }
      if (!isInvitationExist || isInvitationExpired) {
        return response.badRequest({
          message: CONSTANT.ERROR.URL_EXPIRED,
          data: {},
        });
      }
      return response.successResponse({
        message: CONSTANT.SUCCESS.DEFAULT,
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('update-contact')
  async sendOtpForChangeContact(
    @Body() sendOtpDto: SendOtpDto,
    @Req() req: IRequest,
  ) {
    try {
      const isExists = await this.providerService.findOneWhere({
        where: {
          country_code: sendOtpDto.country_code,
          mobile_no: sendOtpDto.mobile_no,
          profile_status: Not(USER_STATUS.deleted),
        },
        order: { created_at: 'DESC' },
      });

      if (isExists) {
        if (isExists.id === req.user.id) {
          return response.badRequest({
            message: CONSTANT.ERROR.SAME_NUMBER,
            data: {},
          });
        }
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Contact number'),
          data: {},
        });
      }

      await this.authService.sendOtpForChangeContactNumber(
        req.user.id,
        sendOtpDto,
      );

      return response.successResponse({
        message: CONSTANT.SUCCESS.COMPLETE_VERIFICATION(''),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('verify-otp-for-change-contact')
  async verifyContactChangeOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
    @Req() req: IRequest,
  ) {
    try {
      const otp = await this.authService.findOtp({
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

      if (!otp) {
        return response.badRequest({
          message: CONSTANT.ERROR.INVALID_OTP,
          data: {},
        });
      }

      Object.assign(verifyOtpDto, { device_name: req.headers['user-agent'] });
      const result = await this.authService.verifyChangeContactNumberOtp(
        otp,
        verifyOtpDto,
      );

      if (!result.status) {
        return response.badRequest(result.data);
      }

      return response.successResponse(result.data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('send-email-verification-otp')
  async sendEmailVerificationOtp(
    @Body() sendEmailDto: any,
    @Req() req: IRequest,
  ) {
    try {
      let provider = await this.providerService.findOneWhere({
        where: {
          email: sendEmailDto.email,
          is_email_verified: true,
          id: Not(req.user.id),
          profile_status: Not(USER_STATUS.deleted),
        },
        order: { created_at: 'DESC' },
      });

      if (provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.EMAIL_ALREADY_EXIST,
          data: {},
        });
      }

      provider = await this.providerService.findOneWhere({
        where: {
          id: req.user.id,
          profile_status: Not(USER_STATUS.deleted),
        },
        order: { created_at: 'DESC' },
      });

      await this.providerService.update(provider.id, {
        unverified_email: sendEmailDto.email,
      });

      await this.authService.sendEmailVerificationOtp(
        provider.id,
        sendEmailDto.email,
      );

      return response.successResponse({
        message: CONSTANT.EMAIL.SENT,
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('verify-email/provider')
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
    @Req() req: IRequest,
  ) {
    try {
      const otp = await this.authService.findOtp({
        where: {
          is_verified: false,
          type: OTP_TYPE.change_number,
          email: verifyEmailDto.email,
          otp: verifyEmailDto.otp,
          provider: {
            id: req.user.id,
          },
        },
        relations: {
          provider: true,
        },
      });

      if (!otp) {
        return response.badRequest({
          message: CONSTANT.ERROR.INVALID_OTP,
          data: {},
        });
      }

      const result = await this.authService.verifyChangeEmailOtp(
        otp,
        verifyEmailDto,
      );

      if (!result.status) {
        return response.badRequest(result.data);
      }

      return response.successResponse(result.data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('account-check')
  async checkPasswordToDeleteAccount(@Req() req: IRequest) {
    try {
      const provider = await this.providerService.findOneWhere({
        where: {
          id: req.user.id,
          is_active: true,
          profile_status: Not(USER_STATUS.deleted),
        },
        order: { created_at: 'DESC' },
      });
      if (!provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Account'),
          data: {},
        });
      }

      if (!provider.password) {
        if (provider.email && provider.is_email_verified) {
          await this.authService.sendAccountDeleteOTP(
            provider.id,
            provider.email,
          );
          return response.successResponse({
            message: CONSTANT.SUCCESS.OTP_SENT(provider.email),
            data: { otp: { email: true, email_address: provider.email } },
          });
        } else if (provider.mobile_no && provider.is_mobile_verified) {
          await this.authService.sendSignupOtp(
            provider,
            req.ip,
            OTP_TYPE.account_delete,
          );
          return response.successResponse({
            message: CONSTANT.SUCCESS.OTP_SENT(provider.mobile_no),
            data: { otp: { mobile: true, mobile_no: provider.mobile_no } },
          });
        }
      }

      return response.successResponse({
        message: CONSTANT.VALIDATION.ENTER_PASSWORD,
        data: { otp: { password: true } },
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Delete('delete-account')
  async deleteAccount(
    @Req() req: IRequest,
    @Query() query: { password?: string; otp?: number },
  ) {
    try {
      const { otp, password } = query;
      const provider = await this.providerService.findOneWhere({
        where: {
          id: req.user.id,
          is_active: true,
          profile_status: Not(USER_STATUS.deleted),
        },
        order: { created_at: 'DESC' },
      });
      if (!provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Account'),
          data: {},
        });
      }

      if (password) {
        // compare the password
        const isSame = await bcrypt.compare(password, provider.password);
        if (!isSame) {
          return response.badRequest({
            message: CONSTANT.ERROR.INVALID_PASSWORD,
            data: {},
          });
        }
      } else {
        const otpExist = await this.authService.findOtp({
          where: {
            is_verified: false,
            type: OTP_TYPE.account_delete,
            country_code: req.user.country_code,
            contact_number: req.user.mobile_no,
            email: req.user.email,
            otp: otp,
            provider: {
              id: req.user.id,
            },
          },
          relations: {
            provider: true,
          },
        });

        if (!otpExist) {
          return response.badRequest({
            message: CONSTANT.ERROR.INVALID_OTP,
            data: {},
          });
        }

        const isOtpValid = await this.authService.verifyAccountDeleteOtp(
          otpExist,
          req.ip,
        );
        if (!isOtpValid) {
          return response.badRequest({
            message: CONSTANT.ERROR.INVALID_OTP,
            data: {},
          });
        }
      }

      // if provider is set to any shift as scheduled, move the shift to open
      await this.tokenRepository.update(
        { provider: { id: req.user.id } },
        { jwt: 'deleted', refresh_jwt: 'deleted', firebase: 'deleted' },
      );
      await this.providerService.deleteAccount(req.user.id);

      const shifts = await this.shiftService.isProviderAssociatedWithAnyShift(
        req.user.id,
      );

      const setting = await this.autoSchedulingSettingService.findOneWhere({
        where: {},
      });

      if (shifts && shifts.length) {
        for (const shift of shifts) {
          let providers = await this.aiService.getAIRecommendations(
            shift.facility.id,
            shift.speciality.id,
            shift.certificate.id,
          );
          // Need to update the shift_time by days,evenings,nights to D,E,N,A,P
          providers = providers.filter((p) => p !== req.user.id);
          const filteredProvider =
            await this.autoSchedulingService.filterByPreferenceOfProvider(
              providers,
              shift,
            );
          await this.autoSchedulingService.runAutoScheduling(
            filteredProvider,
            shift,
            setting,
            0,
            SHIFT_STATUS.cancelled,
            req,
          );
          await this.shiftService.saveProviderCancelledShifts(shift);
        }
      }
      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_DELETED('Account'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
