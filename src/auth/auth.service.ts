import { Provider } from '@/provider/entities/provider.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { FindOneOptions, IsNull, LessThan, Repository } from 'typeorm';
import { ProviderEmailSignupDto } from './dto/provider-email-signup.dto';
import { ProviderMobileSignupDto } from './dto/provider-mobile-signup.dto';
import { CONSTANT } from '@/shared/constants/message';
import { EmailLoginDto } from './dto/email-login.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import generateToken from '@/shared/helpers/generate-token';
import {
  AUTH_COLUMN,
  AUTH_TABLE,
  CREATE_USER_TOKEN,
  EMAIL_OR_MOBILE,
} from '@/shared/constants/types';
import { Token } from '@/token/entities/token.entity';
import { Admin } from '@/admin/entities/admin.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { SocialSignupProvider } from './dto/social-signup.dto';
import { ProviderService } from '@/provider/provider.service';
import { ProviderMobileLoginDto } from './dto/provider-mobile-login.dto';
import response from '@/shared/response';
import { Otp } from '@/otp/entities/otp.entity';
import {
  DEFAULT_STATUS,
  EJS_FILES,
  INVITE_STATUS,
  LINK_TYPE,
  OTP_TYPE,
  REFER_FRIEND_STATUS,
  TABLE,
  USER_TYPE,
} from '@/shared/constants/enum';
import generateOtp from '@/shared/helpers/generate-otp';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { SmsService } from '@/shared/helpers/send-sms';
import sendEmailHelper from '@/shared/helpers/send-email-helper';
import { FacilityService } from '@/facility/facility.service';
import { FacilityUserService } from '@/facility-user/facility-user.service';
import { AdminService } from '@/admin/admin.service';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { Invite } from '@/invite/entities/invite.entity';
import { SendOtpDto } from './dto/send-otp.dto';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';
import { applicant } from '@/shared/constants/constant';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ReferFriend } from '@/refer-friend/entities/refer-friend.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    private readonly providerService: ProviderService,
    private readonly encryptDecryptService: EncryptDecryptService,
    @InjectRepository(Invite)
    private readonly inviteRepository: Repository<Invite>,
    @InjectRepository(StatusSetting)
    private readonly statusSettingRepository: Repository<StatusSetting>,
    @InjectRepository(ReferFriend)
    private readonly referFriendRepository: Repository<ReferFriend>,
    private readonly smsService: SmsService,
  ) {}

  isTokenExpired = (token: string) => {
    try {
      const valid = jwt.verify(token, process.env.JWT_SECRET);
      if (valid) {
        return false;
      } else {
        return true;
      }
    } catch (_err) {
      return true;
    }
  };

  async sendSignupOtp(provider: Provider, ip: string, type: OTP_TYPE) {
    // There is always one entry of signup OTP. We are sending it at signup time
    let otp = await this.otpRepository.findOne({
      where: {
        provider: {
          id: provider.id,
        },
        type,
      },
    });

    // In case of first signup OTP is not created
    if (!otp) {
      // Store OTP to database
      const createOtp = {
        provider: provider,
        type,
        country_code: provider.country_code,
        contact_number: provider.mobile_no,
        email: provider.email,
        otp: generateOtp(),
        created_at_ip: ip,
        expire_at: Math.floor((Date.now() + 600000) / 1000), // Add 10 minutes (600,000 milliseconds) to the current timestamp & Convert future timestamp to seconds
      };
      otp = await this.otpRepository.save(createOtp);
      // Send OTP to user's mobile
      await this.smsService.sendSms({
        contactNumber: provider.country_code + provider.mobile_no,
        otp: otp.otp,
      });
    } else {
      // Update Old OTP
      const updateOtp = {
        type,
        otp: generateOtp(),
        updated_at_ip: ip,
        expire_at: Math.floor((Date.now() + 600000) / 1000), // Add 10 minutes (600,000 milliseconds) to the current timestamp & Convert future timestamp to seconds
      };
      await this.otpRepository.update(otp.id, updateOtp);
      // Send OTP to user's mobile
      await this.smsService.sendSms({
        contactNumber: provider.country_code + provider.mobile_no,
        otp: updateOtp.otp,
      });
    }
  }

  async createUserToken(
    payload: CREATE_USER_TOKEN,
    table_id: AUTH_COLUMN,
    table: AUTH_TABLE,
  ): Promise<string> {
    const {
      jwt,
      firebase,
      device_id,
      device_name,
      device_type,
      updated_at_ip,
    } = payload;

    const isExist = await this.tokenRepository.findOne({
      where: {
        [table]: { id: payload[table_id] },
        deleted_at: null,
        device_id,
      },
    });

    const updateToken = async (id: string, newJwt: string) => {
      await this.tokenRepository.save({
        id,
        jwt: newJwt,
        firebase,
        updated_at_ip,
        login_at: new Date().toISOString(),
      });
      return newJwt || isExist.jwt;
    };

    if (isExist) {
      const isExpired = this.isTokenExpired(isExist.jwt);
      return isExpired
        ? updateToken(isExist.id, jwt)
        : updateToken(isExist.id, isExist.jwt);
    } else {
      const token: Token = new Token();
      token[table] = { id: payload[table_id] } as Admin &
        Provider &
        Facility &
        FacilityUser;
      token.jwt = jwt;
      token.firebase = firebase;
      token.device_id = device_id;
      token.device_name = device_name;
      token.device_type = device_type;
      token.created_at_ip = updated_at_ip;
      token.login_at = new Date().toISOString();

      const result = await this.tokenRepository.save(token);
      return result.jwt;
    }
  }

  async createUserTokenV2(
    payload: CREATE_USER_TOKEN,
    table_id: AUTH_COLUMN,
    table: AUTH_TABLE,
  ): Promise<{ jwt: string; refresh_jwt?: string }> {
    const {
      jwt,
      refresh_jwt,
      remember_me,
      firebase,
      device_id,
      device_name,
      device_type,
      updated_at_ip,
    } = payload;

    const existingToken = await this.tokenRepository.findOne({
      where: {
        [table]: { id: payload[table_id] },
        deleted_at: null,
        device_id,
      },
    });

    const updateToken = async (
      id: string,
      newJwt: string,
      newRefreshJwt?: string | null,
    ) => {
      const updated = await this.tokenRepository.save({
        id,
        jwt: newJwt,
        refresh_jwt: remember_me && newRefreshJwt ? newRefreshJwt : null,
        firebase,
        updated_at_ip,
        login_at: new Date().toISOString(),
      });

      return {
        jwt: updated.jwt,
        refresh_jwt:
          remember_me && updated.refresh_jwt ? updated.refresh_jwt : undefined,
      };
    };

    if (existingToken) {
      const isAccessTokenExpired = this.isTokenExpired(existingToken.jwt);

      const hasRefresh =
        existingToken.refresh_jwt !== null &&
        existingToken.refresh_jwt !== undefined;

      const isRefreshTokenExpired = hasRefresh
        ? this.isTokenExpired(existingToken.refresh_jwt)
        : true;

      // ✅ CASE 1: Access Token Expired
      if (isAccessTokenExpired) {
        if (remember_me) {
          return updateToken(
            existingToken.id,
            jwt,
            refresh_jwt ?? existingToken.refresh_jwt ?? null,
          );
        }

        return updateToken(existingToken.id, jwt, null);
      }

      // ✅ CASE 2: Access Token Not Expired, but refresh is needed
      if (remember_me && (isRefreshTokenExpired || !hasRefresh)) {
        return updateToken(existingToken.id, existingToken.jwt, refresh_jwt);
      }

      // ✅ CASE 3: Everything valid — just return existing
      return {
        jwt: existingToken.jwt,
        refresh_jwt:
          remember_me && existingToken.refresh_jwt
            ? existingToken.refresh_jwt
            : undefined,
      };
    }

    // ✅ CASE 4: No existing token — create new one
    const newToken = new Token();
    newToken[table] = { id: payload[table_id] } as Admin &
      Provider &
      Facility &
      FacilityUser;
    newToken.jwt = jwt;
    newToken.refresh_jwt = remember_me && refresh_jwt ? refresh_jwt : null;
    newToken.firebase = firebase;
    newToken.device_id = device_id;
    newToken.device_name = device_name;
    newToken.device_type = device_type;
    newToken.created_at_ip = updated_at_ip;
    newToken.login_at = new Date().toISOString();

    const result = await this.tokenRepository.save(newToken);

    return {
      jwt: result.jwt,
      refresh_jwt: remember_me ? (result.refresh_jwt ?? undefined) : undefined,
    };
  }

  async getLoginResponse(
    provider: Provider,
    loginDto: {
      device_id: string;
      firebase: string;
      device_name: string;
      device_type: string;
    },
    created_at_ip: string,
    updated_at_ip: string,
  ) {
    // generate jwt token
    const jwt = generateToken(provider.id, 'provider_id', 'provider');
    // store token and other details of user
    const token = await this.createUserToken(
      {
        provider_id: provider.id,
        jwt,
        device_id: loginDto.device_id,
        firebase: loginDto.firebase,
        device_name: loginDto.device_name,
        device_type: loginDto.device_type,
        created_at_ip: created_at_ip,
        updated_at_ip: updated_at_ip,
      },
      'provider_id',
      'provider',
    );

    const user = await this.providerService.findOneWhere({
      relations: {
        certificate: true,
        address: true,
        speciality: true,
      },
      where: {
        id: provider.id,
      },
    });

    return response.successResponse({
      message: CONSTANT.SUCCESS.LOGIN,
      data: {
        id: user.id,
        is_active: user.is_active,
        is_signup_completed:
          user.address &&
          user.address.length &&
          user.certificate &&
          user.speciality
            ? true
            : false,
        is_email_verified: user.is_email_verified,
        is_mobile_verified: user.is_mobile_verified,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        base_url: user.base_url,
        profile_image: user.profile_image,
        signature_image: user.signature_image,
        bio: user.bio,
        country_code: user.country_code,
        mobile_no: user.mobile_no,
        created_at: user.created_at,
        jwt: token,
      },
    });
  }

  async findOtp(options: FindOneOptions<Otp>) {
    const result = await this.otpRepository.findOne(options);
    return plainToInstance(Otp, result);
  }

  async providerSignUp(
    providerSignupDto: ProviderEmailSignupDto | ProviderMobileSignupDto,
    isSendEmail: boolean = true,
  ) {
    const setting = await this.statusSettingRepository.findOne({
      where: {
        name: applicant,
        status: DEFAULT_STATUS.active,
        status_for: USER_TYPE.provider,
      },
    });

    if (setting) {
      Object.assign(providerSignupDto, { status: setting.id });
    }

    const provider = await this.providerService.create(providerSignupDto);

    if (isSendEmail) {
      const email = this.encryptDecryptService.encrypt(provider.email);
      const invite = await this.createInvite(provider, 'provider');
      await sendEmailHelper({
        email: provider.email,
        name: provider.first_name,
        redirectUrl: `${process.env.EMAIL_VERIFICATION_URL}loginWithEmail?type=provider&email=${email}&id=${invite.id}`,
        email_type: EJS_FILES.verification,
        subject: CONSTANT.EMAIL.VERIFICATION_SUBJECT,
      });
    } else {
      await this.sendSignupOtp(
        provider,
        providerSignupDto.updated_at_ip,
        OTP_TYPE.signup,
      );
    }
    delete provider.password;
    return plainToInstance(Provider, provider);
  }

  async verifySignupOtp(otp: Otp, verifyOtpDto: VerifyOtpDto) {
    const is_expired = otp.expire_at - Math.floor(Date.now() / 1000) <= 0;
    const updateOtp = {
      updated_at_ip: verifyOtpDto.updated_at_ip,
      deleted_at: new Date().toISOString(),
    };

    if (is_expired) {
      await this.otpRepository.update(otp.id, updateOtp);

      return response.badRequest({
        message: CONSTANT.ERROR.OTP_EXPIRED,
        data: { type: OTP_TYPE.signup },
      });
    } else {
      await this.otpRepository.update(otp.id, {
        is_verified: true,
        ...updateOtp,
      });

      await this.providerRepository.update(otp.provider.id, {
        updated_at_ip: verifyOtpDto.updated_at_ip,
        is_mobile_verified: true,
      });

      const response = await this.getLoginResponse(
        otp.provider,
        {
          device_id: verifyOtpDto.device_id,
          device_type: verifyOtpDto.device_type,
          device_name: verifyOtpDto.device_type,
          firebase: verifyOtpDto.firebase,
        },
        verifyOtpDto.created_at_ip,
        verifyOtpDto.updated_at_ip,
      );

      return response;
    }
  }

  async resendOTP(provider: Provider, resendOtpDto: ResendOtpDto) {
    await this.sendSignupOtp(
      provider,
      resendOtpDto.updated_at_ip,
      resendOtpDto.type,
    );

    return response.successResponse({
      message: CONSTANT.SUCCESS.COMPLETE_VERIFICATION(
        `${resendOtpDto.type === 'signup' ? 'Signup' : resendOtpDto.type === 'account_delete' ? 'Account Delete' : 'Login'}`,
      ),
      data: {
        type: resendOtpDto.type,
        ...(resendOtpDto.email
          ? { email: resendOtpDto.email }
          : {
              country_code: provider.country_code,
              contact_number: provider.mobile_no,
            }),
      },
    });
  }

  async providerMobileLogin(
    provider: Provider,
    providerMobileLoginDto: ProviderMobileLoginDto,
  ) {
    const { is_mobile_verified, is_active, country_code, mobile_no, id } =
      provider;
    const { updated_at_ip } = providerMobileLoginDto;

    // Helper function to generate OTP data
    const generateOtpData = (type: OTP_TYPE, ip: string) => ({
      provider,
      type,
      country_code,
      contact_number: mobile_no,
      otp: generateOtp(),
      created_at_ip: ip,
      expire_at: Math.floor((Date.now() + 600000) / 1000), // 10 minutes
    });

    if (!is_mobile_verified && is_active) {
      await this.sendSignupOtp(provider, updated_at_ip, OTP_TYPE.login);
      return response.successResponse({
        message: CONSTANT.SUCCESS.COMPLETE_VERIFICATION('Signup'),
        data: {
          type: OTP_TYPE.signup,
          country_code,
          contact_number: mobile_no,
        },
      });
    }

    if (is_mobile_verified && is_active) {
      let otp = await this.otpRepository.findOne({
        where: { provider: { id }, type: OTP_TYPE.login },
      });

      const otpData = generateOtpData(OTP_TYPE.login, updated_at_ip);

      if (!otp) {
        otp = await this.otpRepository.save(otpData);
      } else {
        await this.otpRepository.update(otp.id, otpData);
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.COMPLETE_VERIFICATION('Login'),
        data: { type: OTP_TYPE.login },
      });
    }

    if (is_mobile_verified && !is_active) {
      return response.badRequest({
        message: CONSTANT.ERROR.ACCOUNT_IS_BLOCKED,
        data: {},
      });
    }

    return response.badRequest({
      message: CONSTANT.ERROR.WRONG_CREDENTIALS,
      data: {},
    });
  }

  async verifyLoginOtp(otp: Otp, verifyOtpDto: VerifyOtpDto) {
    const is_expired = otp.expire_at - Math.floor(Date.now() / 1000) <= 0;
    const updateOtp = {
      updated_at_ip: verifyOtpDto.updated_at_ip,
      deleted_at: new Date().toISOString(),
    };

    if (is_expired) {
      await this.otpRepository.update(otp.id, updateOtp);

      return response.badRequest({
        message: CONSTANT.ERROR.OTP_EXPIRED,
        data: { type: OTP_TYPE.login },
      });
    }

    await this.otpRepository.update(otp.id, {
      is_verified: true,
      ...updateOtp,
    });

    const loginResponse = await this.getLoginResponse(
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
    return loginResponse;
  }

  async login(
    provider: Provider,
    emailLoginDto: EmailLoginDto | SocialSignupProvider,
  ) {
    const { is_email_verified, is_active, email, first_name } = provider;

    const {
      device_id,
      device_name,
      device_type,
      firebase,
      created_at_ip,
      updated_at_ip,
    } = emailLoginDto;

    const sendVerificationEmail = async () => {
      const encryptedEmail = this.encryptDecryptService.encrypt(email);

      const invite = await this.createInvite(provider, 'provider');
      await sendEmailHelper({
        email,
        name: first_name,
        redirectUrl: `${process.env.EMAIL_VERIFICATION_URL}loginWithEmail?type=provider&email=${encryptedEmail}&id=${invite.id}`,
        email_type: EJS_FILES.verification,
        subject: CONSTANT.EMAIL.VERIFICATION_SUBJECT,
      });

      return response.successCreate({
        message: CONSTANT.SUCCESS.COMPLETE_EMAIL_VERIFICATION,
        data: { is_email_verified },
      });
    };

    const generateLoginResponse = async () => {
      return this.getLoginResponse(
        provider,
        { device_id, device_name, device_type, firebase },
        created_at_ip,
        updated_at_ip,
      );
    };

    if (!is_email_verified) {
      return sendVerificationEmail();
    }

    if (is_email_verified && !is_active) {
      return response.badRequest({
        message: CONSTANT.ERROR.ACCOUNT_IS_BLOCKED,
        data: {},
      });
    }

    // If user is verified.
    if (emailLoginDto?.password && provider.password) {
      // compare the password
      const isSame = await bcrypt.compare(
        emailLoginDto.password,
        provider.password,
      );
      if (!isSame) {
        await this.providerService.update(provider.id, {
          login_attempt: provider.login_attempt + 1,
          login_attempt_at: new Date().toISOString(),
        });

        return response.badRequest({
          message: CONSTANT.ERROR.WRONG_CREDENTIALS,
          data: {},
        });
      }

      if (provider.login_attempt > 0) {
        await this.providerService.update(provider.id, {
          login_attempt: 0,
          login_attempt_at: null,
        });
      }

      return generateLoginResponse();
    } else {
      return response.badRequest({
        message: CONSTANT.ERROR.INVALID_LOGIN,
        data: {},
      });
    }
  }

  async createInvite(user, table: AUTH_TABLE) {
    await this.inviteRepository.update(
      {
        email: user.email,
        role: table as TABLE,
        user_id: user.id,
        type: LINK_TYPE.invitation,
      },
      {
        deleted_at: new Date().toISOString(),
      },
    );

    const result = await this.inviteRepository.save({
      user_id: user.id,
      email: user.email,
      role: table as TABLE,
      status: INVITE_STATUS.pending,
      type: LINK_TYPE.invitation,
    });
    return result;
  }

  async sendForgotPasswordOTP(user, table: AUTH_TABLE) {
    const email = this.encryptDecryptService.encrypt(user.email);

    await this.inviteRepository.update(
      {
        email: user.email,
        role: table as TABLE,
        user_id: user.id,
        type: LINK_TYPE.forgot_password,
        status: INVITE_STATUS.pending,
      },
      {
        status: INVITE_STATUS.expired,
        deleted_at: new Date().toISOString(),
      },
    );

    const latestInvite = await this.inviteRepository.save({
      user_id: user.id,
      email: user.email,
      role: table as TABLE,
      status: INVITE_STATUS.pending,
      type: LINK_TYPE.forgot_password,
    });

    const urlMap = {
      [TABLE.admin]: process.env.ADMIN_URL,
      [TABLE.facility]: process.env.FACILITY_URL,
      [TABLE.facility_user]: process.env.FACILITY_URL,
    };
    const baseURL = urlMap[table] || process.env.EMAIL_VERIFICATION_URL;

    return await sendEmailHelper({
      email: user.email,
      email_type: EJS_FILES.reset_password,
      redirectUrl:
        baseURL +
        `reset-password?email=${email}&type=${table}&id=${latestInvite.id}`,
      subject: CONSTANT.EMAIL.FORGOT_PASSWORD,
      supportEmail: process.env.SUPPORT_EMAIL,
    });
  }

  async sendInvitation(
    user: Admin | FacilityUser,
    table: 'admin' | 'facility_user',
    authority?: string,
  ) {
    const invitation = await this.inviteRepository.findOne({
      where: {
        email: user.email,
        role: table as TABLE,
        user_id: user.id,
      },
    });

    if (invitation) {
      await this.inviteRepository.update(invitation.id, {
        deleted_at: new Date().toISOString(),
      });
    }

    const invite = await this.inviteRepository.save({
      email: user.email,
      role: table as TABLE,
      user_id: user.id,
      status: INVITE_STATUS.pending,
      type: LINK_TYPE.invitation,
    });

    // Send invitation to user's email
    return await sendEmailHelper({
      email: user.email,
      name: user.first_name,
      email_type: EJS_FILES.invitation,
      authority: authority || 'Nurses Now',
      supportEmail: process.env.SUPPORT_EMAIL,
      redirectUrl:
        process.env[
          `${table === 'admin' ? 'ADMIN_INVITATION_URL' : 'FACILITY_INVITATION_URL'}`
        ] +
        `?id=${this.encryptDecryptService.encrypt(user.id)}&invite_id=${invite.id}`,
      subject: CONSTANT.EMAIL.ACCEPT_INVITE,
    });
  }

  async findToken(options: FindOneOptions<Token>) {
    const result = await this.tokenRepository.findOne(options);
    return plainToInstance(Token, result);
  }

  async doesUserExists<T extends Provider | FacilityUser | Facility | Admin>(
    emailOrMobile: EMAIL_OR_MOBILE,
    service:
      | ProviderService
      | FacilityService
      | FacilityUserService
      | AdminService,
  ): Promise<T> {
    const where = [];

    if (emailOrMobile.email) {
      where.push({
        email: emailOrMobile.email,
      });
    }

    if (emailOrMobile.country_code && emailOrMobile.mobile_no) {
      where.push({
        country_code: emailOrMobile.country_code,
        mobile_no: emailOrMobile.mobile_no,
      });
    }

    const user = await service.findOneWhere({
      where: where,
      order: { created_at: 'DESC' },
    });

    return user as T;
  }

  async isInvitationExpired(
    user: Admin | FacilityUser | Provider | Facility,
    table: TABLE,
    type: LINK_TYPE,
  ) {
    const data = await this.inviteRepository.findOne({
      where: [
        {
          created_at: LessThan(new Date(Date.now() - 60 * 60 * 1000)),
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

    if (data) {
      await this.inviteRepository.update(data.id, {
        status: INVITE_STATUS.expired,
      });
    }

    return data ? true : false;
  }

  async isInvitationExpiredV2(
    user: Admin | FacilityUser | Provider | Facility,
    table: TABLE,
    type: LINK_TYPE,
    id: string,
  ) {
    const data = await this.inviteRepository.findOne({
      where: [
        {
          id,
          created_at: LessThan(new Date(Date.now() - 60 * 60 * 1000)),
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

    if (data) {
      await this.inviteRepository.update(data.id, {
        status: INVITE_STATUS.expired,
      });
    }

    return data ? true : false;
  }

  async acceptInvitation(
    user: Admin | FacilityUser | Provider | Facility,
    table: TABLE,
  ) {
    const data = await this.inviteRepository.delete({
      user_id: user.id,
      role: table,
      status: INVITE_STATUS.pending,
    });

    return data ? true : false;
  }

  async isInvitationExist(
    user: Admin | FacilityUser | Provider | Facility,
    table: TABLE,
    type: LINK_TYPE,
  ) {
    const data = await this.inviteRepository.findOne({
      where: {
        user_id: user.id,
        role: table,
        type: type,
      },
    });

    return data;
  }
  async isInvitationExistV2(
    user: Admin | FacilityUser | Provider | Facility,
    table: TABLE,
    type: LINK_TYPE,
    id: string,
  ) {
    const data = await this.inviteRepository.findOne({
      where: {
        id,
        user_id: user.id,
        role: table,
        type: type,
        status: INVITE_STATUS.pending,
      },
    });

    return data;
  }

  async sendOtpForChangeContactNumber(id: string, sendOtpDto: SendOtpDto) {
    const provider = await this.providerRepository.findOne({
      where: { id: id || IsNull() },
    });

    let otp = await this.otpRepository.findOne({
      where: {
        provider: {
          id: provider.id,
        },
        type: OTP_TYPE.change_number,
        country_code: sendOtpDto.country_code,
        contact_number: sendOtpDto.mobile_no,
      },
    });

    if (!otp) {
      const createOtp = {
        admin: provider,
        type: OTP_TYPE.change_number,
        country_code: sendOtpDto.country_code,
        contact_number: sendOtpDto.mobile_no,
        otp: generateOtp(),
        created_at_ip: sendOtpDto.created_at_ip,
        expire_at: Math.floor((Date.now() + 600000) / 1000),
        provider: { id: provider.id },
      };
      otp = await this.otpRepository.save(createOtp);
      await this.smsService.sendSms({
        contactNumber: provider.country_code + provider.mobile_no,
        otp: otp.otp,
      });
    } else {
      const updateOtp = {
        otp: generateOtp(),
        updated_at_ip: sendOtpDto.created_at_ip,
        expire_at: Math.floor((Date.now() + 600000) / 1000),
      };
      await this.otpRepository.update(otp.id, updateOtp);
      await this.smsService.sendSms({
        contactNumber: provider.country_code + provider.mobile_no,
        otp: updateOtp.otp,
      });
    }
  }

  async verifyChangeContactNumberOtp(otp: Otp, verifyOtpDto: VerifyOtpDto) {
    const is_expired = otp.expire_at - Math.floor(Date.now() / 1000) <= 0;
    if (is_expired) {
      await this.otpRepository.update(otp.id, {
        updated_at_ip: verifyOtpDto.updated_at_ip,
        deleted_at: new Date().toISOString(),
      });

      return {
        status: 0,
        data: {
          message: CONSTANT.ERROR.OTP_EXPIRED,
          data: {},
        },
      };
    } else {
      await this.otpRepository.update(otp.id, {
        is_verified: true,
        updated_at_ip: verifyOtpDto.updated_at_ip,
        deleted_at: new Date().toISOString(),
      });

      await this.providerRepository.update(otp.provider.id, {
        country_code: verifyOtpDto.country_code,
        mobile_no: verifyOtpDto.mobile_no,
        updated_at_ip: verifyOtpDto.updated_at_ip,
      });

      return {
        status: 1,
        data: {
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Mobile Verified'),
          data: {},
        },
      };
    }
  }

  /**
   * Sends or resends an OTP to the given email for verification.
   * If an OTP already exists and is not expired, it resends the same OTP.
   * If expired or not found, generates a new OTP and sends it.
   */
  async sendEmailVerificationOtp(id: string, email: string) {
    const provider = await this.providerRepository.findOne({
      where: { id: id || IsNull() },
    });

    let otp = await this.otpRepository.findOne({
      where: {
        provider: { id: provider.id },
        type: OTP_TYPE.change_number,
        email,
      },
    });

    const now = Math.floor(Date.now() / 1000);

    if (!otp || otp.expire_at - now <= 0) {
      // No OTP or expired OTP: create new
      const newOtpValue = generateOtp();
      const createOtp = {
        id: otp ? otp.id : undefined, // Use existing OTP ID if it exists
        provider: { id: provider.id },
        type: OTP_TYPE.change_number,
        email,
        otp: newOtpValue,
        expire_at: Math.floor((Date.now() + 600000) / 1000),
      };
      otp = await this.otpRepository.save(createOtp);
      await sendEmailHelper({
        email,
        email_type: EJS_FILES.email_otp_verification,
        otp: newOtpValue,
        subject: CONSTANT.EMAIL.VERIFICATION_SUBJECT,
      });
    } else {
      // OTP exists and is not expired: resend same OTP
      await sendEmailHelper({
        email,
        email_type: EJS_FILES.email_otp_verification,
        otp: otp.otp,
        subject: CONSTANT.EMAIL.VERIFICATION_SUBJECT,
      });
    }
  }
  async sendAccountDeleteOTP(id: string, email: string) {
    const provider = await this.providerRepository.findOne({
      where: { id: id || IsNull() },
    });

    let otp = await this.otpRepository.findOne({
      where: {
        provider: { id: provider.id },
        type: OTP_TYPE.account_delete,
        email,
      },
    });

    const now = Math.floor(Date.now() / 1000);

    if (!otp || otp.expire_at - now <= 0) {
      // No OTP or expired OTP: create new
      const newOtpValue = generateOtp();
      const createOtp = {
        id: otp ? otp.id : undefined, // Use existing OTP ID if it exists
        provider: { id: provider.id },
        country_code: provider.country_code,
        contact_number: provider.mobile_no,
        type: OTP_TYPE.account_delete,
        email,
        otp: newOtpValue,
        expire_at: Math.floor((Date.now() + 600000) / 1000),
      };
      otp = await this.otpRepository.save(createOtp);
      await sendEmailHelper({
        email,
        email_type: EJS_FILES.delete_account,
        otp: newOtpValue,
        subject: CONSTANT.EMAIL.ACCOUNT_DELETION,
      });
    } else {
      // OTP exists and is not expired: resend same OTP
      await sendEmailHelper({
        email,
        email_type: EJS_FILES.delete_account,
        otp: otp.otp,
        subject: CONSTANT.EMAIL.ACCOUNT_DELETION,
      });
    }
  }

  async verifyAccountDeleteOtp(otp: Otp, updated_at_ip: string) {
    const is_expired = otp.expire_at - Math.floor(Date.now() / 1000) <= 0;
    const updateOtp = {
      updated_at_ip: updated_at_ip,
      deleted_at: new Date().toISOString(),
    };

    if (is_expired) {
      await this.otpRepository.update(otp.id, updateOtp);

      return response.badRequest({
        message: CONSTANT.ERROR.OTP_EXPIRED,
        data: { type: OTP_TYPE.account_delete },
      });
    }

    await this.otpRepository.update(otp.id, {
      is_verified: true,
      ...updateOtp,
    });
    return true;
  }

  async verifyChangeEmailOtp(otp: Otp, verifyEmailDto: VerifyEmailDto) {
    const is_expired = otp.expire_at - Math.floor(Date.now() / 1000) <= 0;
    if (is_expired) {
      await this.otpRepository.update(otp.id, {
        updated_at_ip: verifyEmailDto.updated_at_ip,
        deleted_at: new Date().toISOString(),
      });

      return {
        status: 0,
        data: {
          message: CONSTANT.ERROR.OTP_EXPIRED,
          data: {},
        },
      };
    } else {
      await this.otpRepository.update(otp.id, {
        is_verified: true,
        updated_at_ip: verifyEmailDto.updated_at_ip,
        deleted_at: new Date().toISOString(),
      });

      await this.providerRepository.update(otp.provider.id, {
        email: verifyEmailDto.email,
        updated_at_ip: verifyEmailDto.updated_at_ip,
        unverified_email: null,
        is_email_verified: true,
      });

      return {
        status: 1,
        data: {
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Email Verified'),
          data: {},
        },
      };
    }
  }
  private async updateReferredFriendStatus(
    criteria: Partial<ReferFriend>,
    referred_by: string,
  ) {
    const referred = await this.referFriendRepository.findOne({
      where: {
        ...criteria,
        referred_by: { id: referred_by },
      },
    });

    if (referred) {
      await this.referFriendRepository.update(referred.id, {
        status: REFER_FRIEND_STATUS.onboarding,
      });
    }
    return referred;
  }

  async updateReferredFriendStatusByMobile(
    country_code: string,
    mobile_no: string,
    referred_by: string,
  ) {
    return this.updateReferredFriendStatus(
      { country_code, mobile_no },
      referred_by,
    );
  }

  async updateReferredFriendStatusByEmail(email: string, referred_by: string) {
    return this.updateReferredFriendStatus({ email }, referred_by);
  }
}
