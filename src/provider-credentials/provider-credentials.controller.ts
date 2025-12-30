import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProviderCredentialsService } from './provider-credentials.service';
import { CreateProviderCredentialDto } from './dto/create-provider-credential.dto';
import {
  ApproveOrRejectProviderCredentialDto,
  UpdateProviderCredentialDto,
} from './dto/update-provider-credential.dto';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { IRequest } from '@/shared/constants/types';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import {
  ACTIVITY_TYPE,
  CREDENTIAL_STATUS,
  PERMISSIONS,
  ProfessionalReferenceStatus,
  PushNotificationType,
  SECTIONS,
  SUB_SECTION,
  TABLE,
  USER_TYPE,
  VERIFICATION_STATUS,
} from '@/shared/constants/enum';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import { InjectRepository } from '@nestjs/typeorm';
import { Provider } from '@/provider/entities/provider.entity';
import { Repository } from 'typeorm';
import { FilterProviderCredentialForAdminDto } from './dto/filter-provider-credential.dto';
import { active } from '@/shared/constants/constant';
import { ProviderProfessionalReference } from '@/provider-professional-reference/entities/provider-professional-reference.entity';
import { SendCredentialDto } from './dto/mail-credential.dto';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import * as moment from 'moment';
import { FacilityProviderService } from '@/facility-provider/facility-provider.service';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Controller('provider-credentials')
export class ProviderCredentialsController {
  constructor(
    private readonly providerCredentialsService: ProviderCredentialsService,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(ProviderProfessionalReference)
    private readonly providerProfessionalReferenceRepository: Repository<ProviderProfessionalReference>,
    private readonly notificationService: NotificationService,
    private readonly firebaseNotificationService: FirebaseNotificationService,
    private readonly facilityProviderService: FacilityProviderService,
  ) {}

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post('add')
  async addCredentials(
    @Body() createProviderCredentialDto: CreateProviderCredentialDto,
    @Req() req: IRequest,
  ) {
    try {
      createProviderCredentialDto.base_url = process.env.AWS_ASSETS_PATH;
      const result = await this.providerCredentialsService.create({
        ...createProviderCredentialDto,
        provider: req.user.id,
      });

      const credentialsProgress =
        await this.providerCredentialsService.getCredentialsProgress(req.user);

      await this.providerRepository.update(req.user.id, {
        credentials_completion_ratio: credentialsProgress,
      });

      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_ADDED('Credential'),
        data: result,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('category/all')
  async getAllCredentialsCategory(@Req() req: IRequest) {
    try {
      const result =
        await this.providerCredentialsService.getAllCredentialsCategory(
          req.user,
        );

      return response.successResponse({
        message: result
          ? CONSTANT.SUCCESS.RECORD_FOUND('Credential Categories')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Credential Categories'),
        data: result ? result : [],
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('all')
  async getAllCredentials(@Req() req: IRequest) {
    try {
      const data =
        await this.providerCredentialsService.getOtherCredentialsData(
          req.user.id,
        );

      return response.successResponse({
        message: data.length
          ? CONSTANT.SUCCESS.RECORD_FOUND('Credentials')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Credentials'),
        data: data.length ? data : [],
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('other/all')
  async getOtherCredentials(
    @Req() req: IRequest,
    @Query('search') search: string,
  ) {
    try {
      const result =
        await this.providerCredentialsService.getOtherCredentialsCategory(
          req.user,
          search,
        );
      return response.successResponse({
        message: result.length
          ? CONSTANT.SUCCESS.RECORD_FOUND('Other Credential')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Other Credential'),
        data: result.length ? result : [],
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('details/:id')
  async getCredentialDetails(
    @Param('id', UUIDValidationPipe) id: string,
    @Req() req: IRequest,
  ) {
    try {
      const result = await this.providerCredentialsService.findOneWhere({
        relations: {
          credential: true,
        },
        where: {
          id: id,
          provider: {
            id: req.user.id,
          },
        },
        select: {
          id: true,
          filename: true,
          original_filename: true,
          document_id: true,
          credential: true,
          license: true,
          issue_date: true,
          expiry_date: true,
          is_verified: true,
        },
      });

      if (!result) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Credential'),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Credential'),
        data: result,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch(':id')
  async updateCredential(
    @Param('id', UUIDValidationPipe) id: string,
    @Req() req: IRequest,
    @Body() updateProviderCredentialDto: UpdateProviderCredentialDto,
  ) {
    try {
      if (updateProviderCredentialDto.name) {
        updateProviderCredentialDto.is_verified = CREDENTIAL_STATUS.pending;
      }
      updateProviderCredentialDto.base_url = process.env.AWS_ASSETS_PATH;
      const credential = await this.providerCredentialsService.findOneWhere({
        where: {
          id: id,
          provider: {
            id: req.user.id,
          },
        },
        relations: ['provider', 'credential'],
      });
      if (!credential) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Credential'),
          data: {},
        });
      }

      // Prepare new credential payload
      const newCredential = {
        ...updateProviderCredentialDto,
        previous_document: credential.id,
        provider: credential.provider.id,
        credential: credential.credential.id,
      } as CreateProviderCredentialDto;

      // Create new record using service method
      const result =
        await this.providerCredentialsService.create(newCredential);
      const data = {
        message: result
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Credential')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Credential'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('e-doc')
  async getEDocForProvider(@Req() req: IRequest) {
    try {
      const eDocs = await this.providerCredentialsService.getEDocForProvider(
        req.user,
      );

      return response.successResponse({
        message:
          eDocs && eDocs.length
            ? CONSTANT.SUCCESS.RECORD_FOUND('E Docs')
            : CONSTANT.ERROR.RECORD_NOT_FOUND('E Docs'),
        data: eDocs,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Section(SECTIONS.credentials, SUB_SECTION.credentials)
  @Roles('admin', 'facility', 'facility_user')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('admin/all')
  async getAllProviderCredentialForAdmin(
    @Query() filterCredentialsDto: FilterProviderCredentialForAdminDto,
  ) {
    try {
      const { list, count } =
        await this.providerCredentialsService.getAllProviderCredentialForAdmin(
          filterCredentialsDto,
        );

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Credentials')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Credentials'),
        total: count,
        limit: +filterCredentialsDto.limit,
        offset: +filterCredentialsDto.offset,
        data: list,
      };
      return response.successResponse({
        message: data.data.length
          ? CONSTANT.SUCCESS.RECORD_FOUND('Credentials')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Credentials'),
        data: data.data.length ? data : [],
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Section(SECTIONS.credentials, SUB_SECTION.credentials)
  @Roles('admin', 'facility', 'facility_user')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('admin/credential-history')
  async getAllCredentialHistoryOfProvider(
    @Query() query: FilterProviderCredentialForAdminDto,
  ) {
    try {
      const [list, count] =
        await this.providerCredentialsService.getAllCredentialHistoryOfProvider(
          query,
        );

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Credentials')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Credentials'),
        total: count,
        limit: +query.limit,
        offset: +query.offset,
        data: list,
      };
      return response.successResponse({
        message: data.data.length
          ? CONSTANT.SUCCESS.RECORD_FOUND('Credentials')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Credentials'),
        data: data.data.length ? data : [],
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Get('admin/details/:id')
  async getDetailProviderCredentialForAdmin(
    @Param('id', UUIDValidationPipe) id: string,
  ) {
    try {
      const data = await this.providerCredentialsService.findOneWhere({
        where: { id },
        relations: { provider: true, credential: true, reason: true },
        select: {
          id: true,
          base_url: true,
          filename: true,
          original_filename: true,
          document_id: true,
          license: true,
          issue_date: true,
          expiry_date: true,
          is_verified: true,
          reason: true,
          credential_approved_at: true,
          credential_rejected_at: true,
          created_at: true,
          updated_at: true,
          provider: {
            id: true,
            first_name: true,
            last_name: true,
            base_url: true,
            profile_image: true,
          },
          credential: {
            id: true,
            name: true,
          },
        },
      });

      return response.successResponse({
        message: data
          ? CONSTANT.SUCCESS.RECORD_FOUND('Credentials')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Credentials'),
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('count-for-admin')
  async getCredentialCountForAdmin() {
    try {
      const count =
        await this.providerCredentialsService.getProviderCredentialStatusCounts();

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Credential Count'),
        data: count,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch('verification-status/:id')
  async approveOrRejectProviderCredential(
    @Param('id', UUIDValidationPipe) id: string,
    @Body()
    approveOrRejectProviderCredentialDto: ApproveOrRejectProviderCredentialDto,
    @Req() req: IRequest,
  ) {
    try {
      const { is_verified, reason } = approveOrRejectProviderCredentialDto;

      // Validate reason for rejection
      if (is_verified === CREDENTIAL_STATUS.rejected && !reason) {
        return response.badRequest({
          message: CONSTANT.ERROR.REQUIRED('Reason'),
          data: {},
        });
      }
      const providerCredential =
        await this.providerCredentialsService.findOneWhere({
          where: { id },
          relations: ['provider'],
          select: {
            id: true,
            name: true,
            is_verified: true,
            provider: {
              id: true,
              first_name: true,
              last_name: true,
              profile_progress: true,
              status: { id: true, name: true },
            },
          },
        });

      if (!providerCredential) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Credential'),
          data: {},
        });
      }

      if (providerCredential.is_verified !== CREDENTIAL_STATUS.pending) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Credential'),
          data: {},
        });
      }

      // Set timestamp based on action
      const timestamp = new Date().toISOString();
      if (is_verified === CREDENTIAL_STATUS.rejected) {
        approveOrRejectProviderCredentialDto.credential_rejected_at = timestamp;
        await this.facilityProviderService.providerActivityLog(
          req,
          id,
          ACTIVITY_TYPE.STAFF_CREDENTIAL_REJECTED,
          {
            [req.user.role]: `${req.user.first_name} ${req.user.last_name}`,
            from_status: providerCredential.is_verified,
            to_status: CREDENTIAL_STATUS.rejected,
            provider: `${providerCredential.provider.first_name} ${providerCredential.provider.last_name}`,
            credential: providerCredential.name,
          },
        );
      } else if (is_verified === CREDENTIAL_STATUS.verified) {
        approveOrRejectProviderCredentialDto.credential_approved_at = timestamp;
        await this.facilityProviderService.providerActivityLog(
          req,
          id,
          ACTIVITY_TYPE.STAFF_CREDENTIAL_APPROVED,
          {
            [req.user.role]: `${req.user.first_name} ${req.user.last_name}`,
            from_status: providerCredential.is_verified,
            to_status: CREDENTIAL_STATUS.verified,
            provider: `${providerCredential.provider.first_name} ${providerCredential.provider.last_name}`,
            credential: providerCredential.name,
          },
        );
      }

      // Update credential and professional references concurrently
      const [result] = await Promise.all([
        this.providerCredentialsService.approveOrRejectProviderCredential(
          id,
          approveOrRejectProviderCredentialDto,
        ),
        this.providerProfessionalReferenceRepository.update(
          {
            provider: { id: providerCredential.provider.id },
            status: ProfessionalReferenceStatus.awaiting_approval,
          },
          { status: ProfessionalReferenceStatus.approved },
        ),
      ]);

      if (is_verified === CREDENTIAL_STATUS.rejected) {
        // send notification if all the credentials are verified
        const notification =
          await this.notificationService.createUserSpecificNotification({
            title: CONSTANT.NOTIFICATION.CREDENTIAL_REJECTED_TITLE,
            text: CONSTANT.NOTIFICATION.CREDENTIAL_REJECTED_TEXT,
            push_type: PushNotificationType.notify,
          });

        // Send notification to provider
        await this.firebaseNotificationService.sendNotificationToOne(
          notification,
          TABLE.provider,
          providerCredential.provider.id,
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
            description: CONSTANT.NOTIFICATION.CREDENTIAL_REJECTED_DESCRIPTION,
          },
        );
      }

      // Check if provider should be auto-verified
      await this.updateProviderStatusIfEligible(providerCredential.provider.id);

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Credential')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Credential'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  private async updateProviderStatusIfEligible(providerId: string) {
    // ✅ use the deduplicated query instead of findAll
    const totalCredentials =
      await this.providerCredentialsService.getLatestCredentialsByProvider(
        providerId,
      );

    if (!totalCredentials?.length) return;

    const allVerified = totalCredentials.every(
      (credential) => credential.is_verified === CREDENTIAL_STATUS.verified,
    );

    const anyRejected = totalCredentials.some(
      (credential) => credential.is_verified === CREDENTIAL_STATUS.rejected,
    );

    const profileComplete = totalCredentials[0].profile_progress >= 100;
    const verificationStatus =
      totalCredentials[0].verification_status !== VERIFICATION_STATUS.verified;

    if (allVerified && !anyRejected && profileComplete && verificationStatus) {
      const activeStatus = await this.providerCredentialsService.statusSetting({
        where: { status_for: USER_TYPE.provider, name: active },
      });

      await this.providerRepository.update(providerId, {
        verification_status: VERIFICATION_STATUS.verified,
        status: { id: activeStatus.id },
      });

      // send notification if all the credentials are verified
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
        providerId,
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
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post('send-credential/:id')
  async sendCredentialToMail(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() sendCredential: SendCredentialDto,
  ) {
    try {
      const providerCredential =
        await this.providerCredentialsService.findOneWhere({
          where: { id },
          relations: { provider: { certificate: true, speciality: true } },
          select: {
            id: true,
            base_url: true,
            filename: true,
            original_filename: true,
            provider: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
              certificate: { id: true, name: true, abbreviation: true },
              speciality: { id: true, name: true, abbreviation: true },
            },
          },
        });

      if (!providerCredential) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Credential'),
          data: {},
        });
      }

      if (!providerCredential.filename || !providerCredential.base_url) {
        return response.badRequest({
          message: CONSTANT.ERROR.MISSING('Credential Document'),
          data: {},
        });
      }

      await this.providerCredentialsService.sendCredentialToMail(
        providerCredential,
        sendCredential.email,
      );

      return response.successResponse({
        message: CONSTANT.SUCCESS.SENT('Credential'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
