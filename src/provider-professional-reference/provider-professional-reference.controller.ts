import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProviderProfessionalReferenceService } from './provider-professional-reference.service';
import { CreateProviderProfessionalReferenceDto } from './dto/create-provider-professional-reference.dto';
import { UpdateProviderProfessionalReferenceDto } from './dto/update-provider-professional-reference.dto';
import { IRequest } from '@/shared/constants/types';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { ILike, IsNull } from 'typeorm';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import sendEmailHelper from '@/shared/helpers/send-email-helper';
import {
  DEFAULT_STATUS,
  EJS_FILES,
  ProfessionalReferenceStatus,
  PushNotificationType,
  TABLE,
} from '@/shared/constants/enum';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { Shift } from '@/shift/entities/shift.entity';
import * as moment from 'moment';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import { ProviderProfessionalReference } from './entities/provider-professional-reference.entity';

@Controller('provider-professional-reference')
export class ProviderProfessionalReferenceController {
  constructor(
    private readonly providerProfessionalReferenceService: ProviderProfessionalReferenceService,
    private readonly encryptDecryptService: EncryptDecryptService,
    private readonly notificationService: NotificationService,
    private readonly firebaseNotificationService: FirebaseNotificationService,
  ) {}

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post()
  async create(
    @Body()
    createProviderProfessionalReferenceDto: CreateProviderProfessionalReferenceDto,
    @Req() req: IRequest,
  ) {
    try {
      if (
        createProviderProfessionalReferenceDto.email === req.user.email ||
        createProviderProfessionalReferenceDto.mobile_no === req.user.mobile_no
      ) {
        return response.badRequest({
          message: CONSTANT.ERROR.PROFESSIONAL_REFERENCE_SELF,
          data: {},
        });
      }

      // checking if the reference already exists
      const isAlreadyAddedAsReference =
        await this.providerProfessionalReferenceService.findOneWhere({
          where: [
            {
              provider: {
                id: req.user.id,
              },
              email: ILike(`%${createProviderProfessionalReferenceDto.email}%`),
            },
            {
              provider: {
                id: req.user.id,
              },
              mobile_no: createProviderProfessionalReferenceDto.mobile_no,
            },
          ],
        });
      if (isAlreadyAddedAsReference) {
        return response.badRequest({
          message: CONSTANT.ERROR.PROFESSIONAL_REFERENCE_ALREADY_EXISTS,
          data: {},
        });
      }
      createProviderProfessionalReferenceDto.provider = req.user;
      const activeReferenceForm =
        await this.providerProfessionalReferenceService.findOneReferenceForm({
          where: { status: DEFAULT_STATUS.active },
        });

      if (!activeReferenceForm) {
        return response.badRequest({
          message: CONSTANT.ERROR.REFERENCE_FORM_NOT_FOUND,
          data: {},
        });
      }
      Object.assign(
        createProviderProfessionalReferenceDto,
        activeReferenceForm && { reference_form: activeReferenceForm.id },
      );
      const data = await this.providerProfessionalReferenceService.create(
        createProviderProfessionalReferenceDto,
      );
      if (createProviderProfessionalReferenceDto.send_form_by === 'email') {
        // Send email logic here
        await sendEmailHelper({
          name: createProviderProfessionalReferenceDto.name,
          email: createProviderProfessionalReferenceDto.email,
          email_type: EJS_FILES.professional_reference_reminder,
          shiftData: { provider: req.user } as Shift,
          redirectUrl:
            process.env.PROFESSIONAL_REFERENCE +
            `?id=${this.encryptDecryptService.encrypt(data.id)}`,
          subject: CONSTANT.EMAIL.PROFESSIONAL_REFERENCE_REMINDER,
        });
      } else if (
        createProviderProfessionalReferenceDto.send_form_by === 'sms'
      ) {
        // SMS logic implementation
      }
      delete data.provider;
      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Professional Reference'),
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get()
  async findAll(@Req() req: IRequest) {
    try {
      const [list, count] =
        await this.providerProfessionalReferenceService.findAll({
          where: {
            provider: {
              id: req.user.id,
            },
          },
          order: { created_at: 'DESC' },
        });

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Professional Reference')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Professional Reference'),
        data: list,
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get(':id')
  async findOne(
    @Param('id', UUIDValidationPipe) id: string,
    @Req() req: IRequest,
  ) {
    try {
      const result =
        await this.providerProfessionalReferenceService.findOneWhere({
          where: {
            id: id,
            provider: {
              id: req.user.id,
            },
          },
        });

      if (!result) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Professional Reference'),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Professional Reference'),
        data: result,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch(':id')
  async update(
    @Param('id', UUIDValidationPipe) id: string,
    @Body()
    updateProviderProfessionalReferenceDto: UpdateProviderProfessionalReferenceDto,
    @Req() req: IRequest,
  ) {
    try {
      const history =
        await this.providerProfessionalReferenceService.findOneWhere({
          where: {
            id: id,
            provider: {
              id: req.user.id,
            },
          },
        });

      if (!history) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Professional Reference'),
          data: {},
        });
      }

      const data = await this.providerProfessionalReferenceService.update(
        id,
        updateProviderProfessionalReferenceDto,
      );
      return response.successResponse({
        message: data.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Professional Reference')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Professional Reference'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Delete(':id')
  async remove(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() deleteDto: DeleteDto,
    @Req() req: IRequest,
  ) {
    try {
      const result = await this.providerProfessionalReferenceService.remove(
        {
          id: id,
          provider: {
            id: req.user.id,
          },
          deleted_at: IsNull(),
        },
        deleteDto,
      );
      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Professional Reference')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Professional Reference'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('admin/:id')
  async professionalReferenceDetail(
    @Param('id', UUIDValidationPipe) id: string,
  ) {
    try {
      const result =
        await this.providerProfessionalReferenceService.findOneWhere({
          where: {
            id,
          },
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
        });

      if (!result) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Professional Reference'),
          data: {},
        });
      }

      const fetchResponse =
        await this.providerProfessionalReferenceService.getProfessionalReferenceResponses(
          result.id,
        );
      Object.assign(result, { responses: fetchResponse });

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Professional Reference'),
        data: result,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch('admin/:id')
  async updateProfessionalReference(
    @Param('id', UUIDValidationPipe) id: string,
    @Body()
    updateProviderProfessionalReferenceDto: UpdateProviderProfessionalReferenceDto,
  ) {
    try {
      const reference =
        await this.providerProfessionalReferenceService.findOneWhere({
          where: {
            id,
          },
          relations: { provider: true },
        });

      if (!reference) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Professional Reference'),
          data: {},
        });
      }

      switch (updateProviderProfessionalReferenceDto.status) {
        case ProfessionalReferenceStatus.approved:
          // Send Push Notification
          await this.sendNotification(
            ProfessionalReferenceStatus.approved,
            reference,
          );
          return await this.updateProfessionalReferenceStatus(
            id,
            updateProviderProfessionalReferenceDto,
            'Approved',
          );
        case ProfessionalReferenceStatus.rejected:
          // Send Push Notification
          await this.sendNotification(
            ProfessionalReferenceStatus.rejected,
            reference,
          );
          return await this.updateProfessionalReferenceStatus(
            id,
            updateProviderProfessionalReferenceDto,
            'Rejected',
          );
        case ProfessionalReferenceStatus.no_response:
          // update status logic here
          return await this.updateProfessionalReferenceStatus(
            id,
            updateProviderProfessionalReferenceDto,
            'Marked As No Response',
          );
        case ProfessionalReferenceStatus.awaiting_response:
          // send Email for professional reference logic here
          await sendEmailHelper({
            name: reference.name,
            email: reference.email,
            email_type: EJS_FILES.professional_reference_reminder,
            shiftData: { provider: reference.provider } as Shift,
            redirectUrl:
              process.env.PROFESSIONAL_REFERENCE +
              `?id=${this.encryptDecryptService.encrypt(reference.id)}`,
            subject: CONSTANT.EMAIL.PROFESSIONAL_REFERENCE_REMINDER,
          });
          return await this.updateProfessionalReferenceStatus(
            id,
            updateProviderProfessionalReferenceDto,
            'Resent',
          );

        default:
          return response.successResponse({
            message: CONSTANT.ERROR.REQUIRED('Valid status'),
            data: {},
          });
      }
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  // for updating the professional reference status
  private async updateProfessionalReferenceStatus(
    id: string,
    updateProviderProfessionalReferenceDto: UpdateProviderProfessionalReferenceDto,
    type: string,
  ) {
    // update status logic
    await this.providerProfessionalReferenceService.update(
      id,
      updateProviderProfessionalReferenceDto,
    );

    return response.successResponse({
      message: CONSTANT.SUCCESS.SUCCESSFULLY(`Professional Reference ${type}`),
      data: {},
    });
  }

  // for sending the notification
  private async sendNotification(
    status: ProfessionalReferenceStatus,
    reference: ProviderProfessionalReference,
  ) {
    // Create notification entity (can also be pre-created/reused)
    const notification =
      await this.notificationService.createUserSpecificNotification({
        title:
          status === ProfessionalReferenceStatus.approved
            ? CONSTANT.NOTIFICATION.PROFESSIONAL_REFERENCE_APPROVED_TITLE
            : CONSTANT.NOTIFICATION
                .PROFESSIONAL_REFERENCE_DECLINED_BY_ADMIN_TITLE,
        text:
          status === ProfessionalReferenceStatus.approved
            ? CONSTANT.NOTIFICATION.PROFESSIONAL_REFERENCE_APPROVED_TEXT(
                reference.name,
              )
            : CONSTANT.NOTIFICATION.PROFESSIONAL_REFERENCE_DECLINED_BY_ADMIN_TEXT(
                reference.name,
              ),
        push_type: status,
      });

    // Send notification to provider
    await this.firebaseNotificationService.sendNotificationToOne(
      notification,
      TABLE.provider,
      reference.provider.id,
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
        description:
          status === ProfessionalReferenceStatus.approved
            ? CONSTANT.NOTIFICATION.PROFESSIONAL_REFERENCE_APPROVED_DESCRIPTION(
                reference.name,
              )
            : CONSTANT.NOTIFICATION.PROFESSIONAL_REFERENCE_DECLINED_BY_ADMIN_DESCRIPTION(
                reference.name,
              ),
      },
    );
  }

  @Roles('admin', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Delete('admin/:id')
  async deleteProfessionalReference(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() deleteDto: DeleteDto,
  ) {
    try {
      const reference =
        await this.providerProfessionalReferenceService.findOneWhere({
          where: {
            id,
          },
        });

      if (!reference) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Professional Reference'),
          data: {},
        });
      }

      const data = await this.providerProfessionalReferenceService.remove(
        { id },
        deleteDto,
      );
      return response.successResponse({
        message: data.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Professional Reference')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Professional Reference'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
