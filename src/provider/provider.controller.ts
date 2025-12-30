import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProviderService } from './provider.service';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { IRequest } from '@/shared/constants/types';
import { EditProviderDto } from './dto/edit-provider.dto';
import { AddProviderDataDto } from './dto/add-provider-data.dto';
import { ProviderAddressService } from '@/provider-address/provider-address.service';
import { IsNull, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { Roles } from '@/shared/decorator/role.decorator';
import { RoleGuard } from '@/shared/guard/role.guard';
import { UpdatePreferenceSettingDto } from './dto/update-preference-setting.dto';
import { RejectFacilityDto } from '@/facility/dto/update-facility.dto';
import { ProviderSignatureDto } from './dto/provider-signature.dto';
import { ProviderCredentialsService } from '@/provider-credentials/provider-credentials.service';
import { CompetencyTestResponseService } from '@/competency-test-response/competency-test-response.service';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import s3DeleteFile from '@/shared/helpers/s3-delete-file';
import { ProviderWorkHistoryService } from '@/provider-work-history/provider-work-history.service';
import { ProviderEducationHistoryService } from '@/provider-education-history/provider-education-history.service';
import { ProviderProfessionalReferenceService } from '@/provider-professional-reference/provider-professional-reference.service';
import {
  ACTIVITY_TYPE,
  ADDRESS_TYPE,
  CREDENTIAL_STATUS,
  PERMISSIONS,
  ProfessionalReferenceStatus,
  PushNotificationType,
  SECTIONS,
  SUB_SECTION,
  TABLE,
  USER_STATUS,
  USER_TYPE,
  VERIFICATION_STATUS,
} from '@/shared/constants/enum';
import {
  FilterProviderListDto,
  FilterProviderListForAdminDto,
} from './dto/filter-provider-list.dto';
import { UpdateProviderNotificationSettingDto } from './dto/update-provider-notification-setting';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { active } from '@/shared/constants/constant';
import * as moment from 'moment';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { FacilityProviderService } from '@/facility-provider/facility-provider.service';
import { ProviderProfessionalReference } from '@/provider-professional-reference/entities/provider-professional-reference.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import { findUsZipCentroid } from '@/shared/helpers/zip-code-centroid';
import { LocationMapDto, EntityDetailsDto } from './dto/location-map.dto';
import { TokenService } from '@/token/token.service';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Controller('provider')
export class ProviderController {
  constructor(
    private readonly providerService: ProviderService,
    private readonly providerAddressService: ProviderAddressService,
    private readonly providerCredentialsService: ProviderCredentialsService,
    private readonly competencyTestResponseService: CompetencyTestResponseService,
    private readonly providerWorkHistoryService: ProviderWorkHistoryService,
    private readonly providerEducationHistoryService: ProviderEducationHistoryService,
    private readonly providerProfessionalReferenceService: ProviderProfessionalReferenceService,
    private readonly encryptDecryptService: EncryptDecryptService,
    private readonly facilityProviderService: FacilityProviderService,
    @InjectRepository(ProviderProfessionalReference)
    private readonly providerProfessionalReferenceRepository: Repository<ProviderProfessionalReference>,
    private readonly notificationService: NotificationService,
    private readonly firebaseNotificationService: FirebaseNotificationService,
    private readonly tokenService: TokenService,
  ) {}

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('profile')
  async getProfile(@Req() req: IRequest) {
    try {
      const result = await this.providerService.findProfileData(req.user.id);

      const data = {
        message: result
          ? CONSTANT.SUCCESS.RECORD_FOUND('Staff')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff'),
        data: result ? result : {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch('add-data/:id')
  async addProviderData(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() addProviderDataDto: AddProviderDataDto,
  ) {
    try {
      const provider = await this.providerService.findOneWhere({
        where: {
          id,
          profile_status: Not(USER_STATUS.deleted),
        },
      });

      if (!provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.WRONG_CREDENTIALS,
          data: {},
        });
      }

      if (addProviderDataDto.address) {
        const address = {
          ...addProviderDataDto.address,
          provider,
        };

        const isExist = await this.providerAddressService.findOneWhere({
          where: { provider: { id: provider.id }, type: ADDRESS_TYPE.default },
        });

        if (isExist) {
          Object.assign(address, { id: isExist.id });
        }

        addProviderDataDto.latitude = addProviderDataDto.address.latitude;
        addProviderDataDto.longitude = addProviderDataDto.address.longitude;
        const providerAddress =
          await this.providerAddressService.create(address);
        delete addProviderDataDto.address;
        Object.assign(addProviderDataDto, { address: [providerAddress] });
      }

      const result = await this.providerService.addProviderData(
        { id },
        addProviderDataDto,
      );

      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Staff')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff'),
        data: {},
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch('profile/:id')
  async updateProfile(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() editProviderDto: EditProviderDto,
  ) {
    try {
      const provider = await this.providerService.findOneWhere({
        where: {
          id,
          profile_status: Not(USER_STATUS.deleted),
        },
      });

      if (!provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.WRONG_CREDENTIALS,
          data: {},
        });
      }

      const where = [];
      if (editProviderDto.email) {
        where.push({
          email: editProviderDto.email,
          id: Not(id),
          profile_status: Not(USER_STATUS.deleted),
        });
      }
      if (editProviderDto.country_code && editProviderDto.mobile_no) {
        where.push({
          id: Not(id),
          country_code: editProviderDto.country_code,
          mobile_no: editProviderDto.mobile_no,
          profile_status: Not(USER_STATUS.deleted),
        });
      }

      const responseData = where.length
        ? await this.providerService.findOneWhere({
            where,
          })
        : null;

      if (responseData) {
        return response.badRequest({
          message: CONSTANT.ERROR.EMAIL_OR_MOBILE_ALREADY_EXIST,
          data: {},
        });
      }

      if (editProviderDto.address) {
        const addressResult = await this.providerAddressService.findOneWhere({
          where: { id: editProviderDto.address.id },
        });

        editProviderDto.latitude = editProviderDto.address?.latitude
          ? editProviderDto.address.latitude
          : editProviderDto.latitude;
        editProviderDto.longitude = editProviderDto.address?.longitude
          ? editProviderDto.address.longitude
          : editProviderDto.longitude;

        if (!addressResult) {
          return response.badRequest({
            message: CONSTANT.ERROR.RECORD_NOT_FOUND('Address'),
            data: {},
          });
        }

        await this.providerAddressService.updateWhere(
          { id: editProviderDto.address.id },
          editProviderDto.address,
        );
      }

      if (
        editProviderDto.profile_image &&
        provider.profile_image &&
        provider.profile_image !== editProviderDto.profile_image
      ) {
        await s3DeleteFile(provider.profile_image);
      }

      if (
        editProviderDto.signature_image &&
        provider.signature_image &&
        provider.signature_image !== editProviderDto.signature_image
      ) {
        await s3DeleteFile(provider.signature_image);
      }

      if (editProviderDto.profile_image || editProviderDto.signature_image) {
        Object.assign(editProviderDto, {
          base_url: process.env.AWS_ASSETS_PATH,
        });
      }

      const result = await this.providerService.updateWhere(
        { id: provider.id },
        editProviderDto,
      );

      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Staff')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff'),
        data: {},
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('preference-setting')
  async getPreferenceSetting(@Req() req: IRequest) {
    try {
      const provider = await this.providerService.findOneWhere({
        where: {
          id: req.user.id,
        },
        select: ['shift_time', 'radius'],
      });
      let availabilityStatus =
        await this.providerService.getProviderAvailability(req.user.id);
      if (availabilityStatus.length === 0) {
        availabilityStatus =
          await this.providerService.getProviderAvailability();
      }
      const timeLabel = await this.providerService.shiftTimeLabels();
      return response.successResponse({
        message: provider
          ? CONSTANT.SUCCESS.RECORD_FOUND('Preference Setting')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Preference Setting'),
        data: {
          ...provider,
          availability: availabilityStatus || [],
          time_label: timeLabel,
        },
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch('preference-setting')
  async updatePreferenceSetting(
    @Req() req: IRequest,
    @Body() updatePreferenceSettingDto: UpdatePreferenceSettingDto,
  ) {
    try {
      const { availability_status, ...rest } = updatePreferenceSettingDto;

      const result = await this.providerService.update(req.user.id, rest);

      // Update provider availability
      if (availability_status && availability_status.length) {
        await this.providerService.addUpdateProviderAvailability(
          availability_status,
          req,
        );
      }

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Preference Setting')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Preference Setting'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch('signature')
  async updateSignature(
    @Req() req: IRequest,
    @Body() providerSignatureDto: ProviderSignatureDto,
  ) {
    try {
      const provider = await this.providerService.findOneWhere({
        where: {
          id: req.user.id,
        },
      });

      if (!provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.WRONG_CREDENTIALS,
          data: {},
        });
      }

      if (
        provider.signature_image &&
        provider.signature_image !== providerSignatureDto.signature_image
      ) {
        await s3DeleteFile(provider.signature_image);
      }

      providerSignatureDto.base_url = process.env.AWS_ASSETS_PATH;
      const result = await this.providerService.updateWhere(
        { id: provider.id },
        providerSignatureDto,
      );

      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Signature')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
        data: {},
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch('notify')
  async notifyMe(
    @Req() req: IRequest,
    @Body() editProviderDto: EditProviderDto,
  ) {
    try {
      const provider = await this.providerService.findOneWhere({
        where: {
          id: req.user.id,
        },
      });

      if (!provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.WRONG_CREDENTIALS,
          data: {},
        });
      }

      const result = await this.providerService.updateWhere(
        { id: provider.id },
        editProviderDto,
      );

      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.NOTIFY
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
        data: {},
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('all/verification')
  async findAll(@Query() filterProviderListDto: FilterProviderListDto) {
    try {
      const [list, count] = await this.providerService.findAllV2(
        filterProviderListDto,
      );

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Staff')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff'),
        total: count,
        limit: +filterProviderListDto.limit,
        offset: +filterProviderListDto.offset,
        data: list,
      };

      return response.successResponseWithPagination(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('verification/:id')
  async findOne(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const result = await this.providerService.findOneV2(id);
      const data = {
        message: result
          ? CONSTANT.SUCCESS.RECORD_FOUND('Staff')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff'),
        data: result ? result : {},
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Section(SECTIONS.staff, SUB_SECTION.applicant)
  @Roles('admin')
  @Permission(PERMISSIONS.can_approve)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Patch('approve/:id')
  async approveApplicant(
    @Param('id', UUIDValidationPipe) id: string,
    @Req() req: IRequest,
  ) {
    try {
      // Get provider and credentials data in parallel
      // Find all distinct credentials (latest record per credential id) for the provider
      const [provider, status] = await Promise.all([
        this.providerService.findOneWhere({
          where: { id },
          relations: { status: true },
          select: {
            id: true,
            first_name: true,
            last_name: true,
            profile_progress: true,
            status: true,
          },
        }),
        this.providerService.findStatus({
          where: { name: active, status_for: USER_TYPE.provider },
        }),
      ]);

      // Update professional references and provider in parallel
      const updatePromises = [
        this.providerProfessionalReferenceRepository.update(
          {
            provider: { id },
            status: ProfessionalReferenceStatus.awaiting_approval,
          },
          { status: ProfessionalReferenceStatus.approved },
        ),
        this.providerCredentialsService.updateWhere(
          {
            provider: { id },
            deleted_at: IsNull(),
            expiry_date: MoreThanOrEqual(moment().toDate()),
          },
          { is_verified: CREDENTIAL_STATUS.verified },
        ),
        this.providerCredentialsService.updateWhere(
          {
            provider: { id },
            deleted_at: IsNull(),
            expiry_date: IsNull(),
          },
          { is_verified: CREDENTIAL_STATUS.verified },
        ),
      ];

      const updateData = {
        hire_date: new Date(),
        verification_status: VERIFICATION_STATUS.verified,
        ...(provider.profile_progress >= 100 && {
          status: { id: status.id },
        }),
      };

      await Promise.all([
        ...updatePromises,
        this.providerService.update(id, updateData),
      ]);

      if (provider.profile_progress >= 100) {
        await this.facilityProviderService.providerActivityLog(
          req,
          id,
          ACTIVITY_TYPE.STAFF_PROFILE_APPROVED,
          {
            [req.user.role]: `${req.user.first_name} ${req.user.last_name}`,
            from_status: provider.status.name,
            to_status: status.name,
            provider: `${provider.first_name} ${provider.last_name}`,
          },
        );
      }
      const notification =
        await this.notificationService.createUserSpecificNotification({
          title: CONSTANT.NOTIFICATION.PROFILE_APPROVED_TITLE,
          text: CONSTANT.NOTIFICATION.PROFILE_APPROVED_TEXT,
          push_type: PushNotificationType.notify,
        });

      // Send notification to provider
      await this.firebaseNotificationService.sendNotificationToOne(
        notification,
        TABLE.provider,
        provider.id,
        {
          expire_in: 0,
          is_timer: false,
          status: PushNotificationType.notify,

          // Use first shift from newShifts array for notification details
          start_date: moment().format('YYYY-MM-DD'),
          end_date: moment().format('YYYY-MM-DD'),
          start_time: moment().format('HH:mm:ss'),
          end_time: moment().format('HH:mm:ss'),
          to: 'notification_data',
          created_at: new Date().toISOString(),
          description: CONSTANT.NOTIFICATION.PROFILE_APPROVED_DESCRIPTION,
        },
      );

      return response.successResponse({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Staff Approved'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch('reject/:id')
  async update(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() updateProviderDto: RejectFacilityDto,
  ) {
    try {
      const result = await this.providerService.update(id, {
        reason: { id: updateProviderDto.reason },
        reason_description: updateProviderDto.reason_description || '',
        verification_status: VERIFICATION_STATUS.rejected,
      });
      if (result.affected > 0) {
        //  send notification to only the staff who get active profile status
        const notification =
          await this.notificationService.createUserSpecificNotification({
            title: CONSTANT.NOTIFICATION.PROFILE_REJECTED_TITLE,
            text: CONSTANT.NOTIFICATION.PROFILE_REJECTED_TEXT,
            push_type: PushNotificationType.notify,
          });

        // Send notification to provider
        await this.firebaseNotificationService.sendNotificationToOne(
          notification,
          TABLE.provider,
          id,
          {
            expire_in: 0,
            is_timer: false,
            status: PushNotificationType.notify,

            // Use first shift from newShifts array for notification details
            start_date: moment().format('YYYY-MM-DD'),
            end_date: moment().format('YYYY-MM-DD'),
            start_time: moment().format('HH:mm:ss'),
            end_time: moment().format('HH:mm:ss'),
            to: 'notification_data',
            created_at: new Date().toISOString(),
            description: CONSTANT.NOTIFICATION.PROFILE_REJECTED_DESCRIPTION,
          },
        );
      }
      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.SUCCESSFULLY('Staff Rejected')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Section(SECTIONS.staff, SUB_SECTION.staff)
  @Roles('admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('all')
  async getAllProviderList(
    @Query() filterProviderListDto: FilterProviderListDto,
  ) {
    try {
      const [list, count] = await this.providerService.findAllV2(
        filterProviderListDto,
      );
      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Staff')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff'),
        total: count,
        limit: +filterProviderListDto.limit,
        offset: +filterProviderListDto.offset,
        data: list,
      };
      return response.successResponseWithPagination(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Section(SECTIONS.staff, SUB_SECTION.staff)
  @Roles('admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('detail/:id')
  async getProviderDetails(
    @Param('id', UUIDValidationPipe) id: string,
    @Query() query: QueryParamsDto,
  ) {
    try {
      const provider = await this.providerService.getProviderDetails(id);
      if (!provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        });
      }
      const providerMetrics = await this.providerService.getProviderMetrics(
        id,
        query,
      );
      const providerPerformance =
        await this.providerService.getProviderPerformance(provider);
      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Staff Details'),
        data: {
          provider,
          metric: providerMetrics,
          performance: providerPerformance,
        },
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Section(SECTIONS.staff, SUB_SECTION.staff)
  @Roles('admin')
  @Permission(PERMISSIONS.edit)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Patch('detail/update/:id')
  async updateProviderDetails(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() updateProviderDto: UpdateProviderDto,
    @Req() req: IRequest,
  ) {
    try {
      const isExist = await this.providerService.findOneWhere({
        where: { id },
        relations: { status: true },
      });

      if (!isExist) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        });
      }

      if (updateProviderDto.ssn) {
        const checkSSN = await this.providerService.findOneWhere({
          where: { ssn: updateProviderDto.ssn, id: Not(id) },
        });
        if (checkSSN) {
          return response.badRequest({
            message: CONSTANT.ERROR.ALREADY_EXISTS('SSN'),
            data: {},
          });
        }
      }

      await this.providerService.updateWhere({ id }, updateProviderDto);

      const activeStatus = await this.providerService.findStatus({
        where: { name: active, status_for: USER_TYPE.provider },
      });
      if (
        updateProviderDto.status &&
        updateProviderDto.status === activeStatus.id
      ) {
        //  send notification to only the staff who get active profile status
        const notification =
          await this.notificationService.createUserSpecificNotification({
            title: CONSTANT.NOTIFICATION.PROFILE_APPROVED_TITLE,
            text: CONSTANT.NOTIFICATION.PROFILE_APPROVED_TEXT,
            push_type: PushNotificationType.notify,
          });

        // Send notification to provider
        await this.firebaseNotificationService.sendNotificationToOne(
          notification,
          TABLE.provider,
          isExist.id,
          {
            expire_in: 0,
            is_timer: false,
            status: PushNotificationType.notify,

            // Use first shift from newShifts array for notification details
            start_date: moment().format('YYYY-MM-DD'),
            end_date: moment().format('YYYY-MM-DD'),
            start_time: moment().format('HH:mm:ss'),
            end_time: moment().format('HH:mm:ss'),
            to: 'notification_data',
            created_at: new Date().toISOString(),
            description: CONSTANT.NOTIFICATION.PROFILE_APPROVED_DESCRIPTION,
          },
        );
      } else {
        // If status is changed to inactive or other than active then remove the token from the database and the user will get logged out from all devices
        await this.tokenService.deleteTokenWhere(
          { provider: { id: isExist.id } },
          req.ip,
        );
      }

      const updatedData = await this.providerService.findOneWhere({
        where: { id },
        relations: { status: true },
      });

      // Log status update separately
      if (updateProviderDto.status !== isExist.status.id) {
        await this.facilityProviderService.providerActivityLog(
          req,
          id,
          ACTIVITY_TYPE.STAFF_STATUS_CHANGED,
          {
            [req.user.role]: `${req.user.first_name} ${req.user.last_name}`,
            from_status: isExist.status.name,
            to_status: updatedData.status.name,
            provider: `${isExist.first_name} ${isExist.last_name}`,
          },
        );
      }

      delete updateProviderDto.status; // removing status from update log
      await this.facilityProviderService.providerActivityUpdateLog(
        req,
        id,
        ACTIVITY_TYPE.STAFF_PROFILE_UPDATED,
        isExist,
        updatedData,
        [...Object.keys(updateProviderDto)],
      );

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_UPDATED('Staff Details'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('experience')
  async getProviderExperienceCount(@Req() req: any) {
    try {
      const providerId = req.user.id;

      const provider = await this.providerService.findOneWhere({
        where: { id: providerId },
      });
      const workHistoryCount = await this.providerWorkHistoryService.count({
        where: { provider: { id: providerId } },
      });

      const educationHistoryCount =
        await this.providerEducationHistoryService.count({
          where: { provider: { id: providerId } },
        });

      const professionalReferenceCount =
        await this.providerProfessionalReferenceService.count({
          where: { provider: { id: providerId } },
        });

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Experience'),
        data: [
          {
            name: 'Education History',
            count: educationHistoryCount,
            status: provider.verification_status,
          },
          {
            name: 'Work History',
            count: workHistoryCount,
            status: provider.verification_status,
          },
          {
            name: 'Professional Reference',
            count: professionalReferenceCount,
            status: provider.verification_status,
          },
        ],
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('experience/:id')
  async getProviderExperience(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const provider = await this.providerService.findOneWhere({
        where: { id },
      });

      if (!provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        });
      }

      const [workHistory] = await this.providerWorkHistoryService.findAll({
        where: { provider: { id } },
      });

      const [educationHistory] =
        await this.providerEducationHistoryService.findAll({
          where: { provider: { id } },
        });

      const [professionalReference] =
        await this.providerProfessionalReferenceService.findAll({
          where: { provider: { id } },
        });

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Experience'),
        data: {
          work_history: workHistory,
          education_history: educationHistory,
          professional_reference: professionalReference,
        },
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('experience/professional-reference/:id')
  async getProviderProfessionalReference(
    @Param('id', UUIDValidationPipe) id: string,
    @Query() query: QueryParamsDto,
  ) {
    try {
      const provider = await this.providerService.findOneWhere({
        where: { id },
      });

      if (!provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        });
      }

      const [professionalReference, count] =
        await this.providerProfessionalReferenceService.findAll({
          where: { provider: { id } },
          relations: { provider: true, reason: true },
          select: {
            provider: {
              id: true,
              first_name: true,
              middle_name: true,
              last_name: true,
              base_url: true,
              profile_image: true,
            },
            reason: {
              id: true,
              reason: true,
            },
          },
          order: query.order,
          skip: +query.offset,
          take: +query.limit,
        });

      const data = {
        message: professionalReference.length
          ? CONSTANT.SUCCESS.RECORD_FOUND('Professional Reference')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Professional Reference'),
        data: professionalReference,
        total: count,
        limit: +query.limit,
        offset: +query.offset,
      };

      return response.successResponseWithPagination(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('credential/:id')
  async getAllCredentials(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const provider = await this.providerService.findOneWhere({
        where: { id },
        relations: { certificate: true, speciality: true },
      });

      if (!provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        });
      }

      const credentials =
        await this.providerCredentialsService.getAllCredentialsCategory(
          provider,
          true,
        );

      const competencyTest =
        await this.competencyTestResponseService.getAllTest(id);

      const skillChecklist =
        await this.providerService.getSkillChecklist(provider);

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Credentials'),
        data: {
          credentials,
          competency_test: competencyTest,
          skill_checklist: skillChecklist,
        },
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('test/:id')
  async getAllTests(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const provider = await this.providerService.findOneWhere({
        where: { id },
      });

      if (!provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        });
      }

      const competencyTest =
        await this.competencyTestResponseService.getAllTest(id);
      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Test'),
        data: competencyTest,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('performance')
  async getMyPerformance(@Req() req: IRequest) {
    try {
      const performance = await this.providerService.getMyPerformance(req.user);
      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Performance'),
        data: performance,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('provider-performance/:id')
  async getProviderPerformance(
    @Param('id', UUIDValidationPipe) id: string,
    @Query('facility') facility: string,
  ) {
    try {
      const provider = await this.providerService.findOneWhere({
        where: { id },
      });

      if (!provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        });
      }

      const performance = await this.providerService.getProviderPerformance(
        provider,
        facility,
      );
      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND(' Provider performance'),
        data: performance,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('notification-settings/:id')
  async getProviderNotificationSettings(
    @Param('id', UUIDValidationPipe) id: string,
  ) {
    try {
      const performance =
        await this.providerService.getProviderNotificationSettings(id);
      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Staff notification setting'),
        data: performance,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch('notification-settings/:id')
  async updateNotificationSetting(
    @Param('id', UUIDValidationPipe) id: string,
    @Body()
    updateProviderNotificationSetting: UpdateProviderNotificationSettingDto,
  ) {
    try {
      const performance =
        await this.providerService.updateProviderNotificationSettings(
          id,
          updateProviderNotificationSetting,
        );
      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_UPDATED('Staff notification setting'),
        data: performance,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Get('download-file')
  async downloadCredentials(@Query('filename') filename: string) {
    try {
      const url = await this.providerService.downloadUrl(filename);

      if (!url) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('File'),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.DOWNLOAD_FILE,
        data: { file: url },
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('list')
  async getProviderListForAdmin(
    @Query() filterProviderListDto: FilterProviderListForAdminDto,
  ) {
    try {
      const [providers, count] =
        await this.providerService.getProviderListForAdmin(
          filterProviderListDto,
        );

      return response.successResponseWithPagination({
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Staff')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
        total: count,
        limit: +filterProviderListDto.limit,
        offset: +filterProviderListDto.offset,
        data: providers,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('list/applicant/:id')
  async getProviderDetailForAdmin(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const provider = await this.providerService.getProviderDetailForAdmin(id);

      return response.successResponse({
        message: provider
          ? CONSTANT.SUCCESS.RECORD_FOUND('Staff')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
        data: provider,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  // generating the encrypted profile link
  @Roles('admin', 'facility', 'facility_user')
  @Get('profile/:id')
  async shareProfileLink(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const link = await this.encryptDecryptService.encrypt(id);
      return response.successResponse({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Profile fetched'),
        data: { link },
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  // accessing public profile using the encrypted link
  @Get('public-profile/:id')
  async getPublicProfile(@Param('id') id: string) {
    try {
      const decryptedId = this.encryptDecryptService.decrypt(id);
      //  provider details
      const provider =
        await this.providerService.getProviderDetailForAdmin(decryptedId);
      if (!provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        });
      }
      delete provider.status;

      // provider credentials
      const credentials = await this.facilityProviderService.getAllCredentials(
        provider,
        undefined,
      );

      // provider work history
      const [workHistory] = await this.providerWorkHistoryService.findAll({
        where: { provider: { id: decryptedId } },
      });

      // provider education history
      const [educationHistory] =
        await this.providerEducationHistoryService.findAll({
          where: { provider: { id: decryptedId } },
        });

      // provider professional reference
      const [professionalReference] =
        await this.providerProfessionalReferenceService.findAll({
          where: { provider: { id: decryptedId } },
        });

      // provider performance
      const performance =
        await this.providerService.getProviderPerformance(provider);

      const data = {
        message: CONSTANT.SUCCESS.RECORD_FOUND('Staff'),
        data: {
          provider,
          credentials,
          work_history: workHistory,
          education_history: educationHistory,
          professional_reference: professionalReference,
          performance,
        },
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('report/location-map')
  async getProvidersByZipCode(@Query() query: LocationMapDto) {
    try {
      const providers = await this.providerService.findNearbyAtCentroid(
        query.zip_code ? await findUsZipCentroid(query.zip_code) : null,
        query,
      );
      return response.successResponse({
        message: providers
          ? CONSTANT.SUCCESS.RECORD_FOUND('Staff')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
        data: providers,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('report/location-map/details')
  async getDetailsOnLocationMap(@Query() query: EntityDetailsDto) {
    try {
      const providers = await this.providerService.getProviderBasicInfo(query);
      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Staff'),
        data: providers,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
