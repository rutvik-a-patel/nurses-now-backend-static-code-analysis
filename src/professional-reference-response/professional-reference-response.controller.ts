import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProfessionalReferenceResponseService } from './professional-reference-response.service';
import { ProfessionalReferenceSubmissionDto } from './dto/create-professional-reference-response.dto';
import { CONSTANT } from '@/shared/constants/message';
import { VerifyStaticTokeGuard } from '@/shared/guard/verify-static-token.guard';
import response from '@/shared/response';
import {
  DEFAULT_STATUS,
  ProfessionalReferenceStatus,
  PushNotificationType,
  TABLE,
} from '@/shared/constants/enum';
import { ILike, Not } from 'typeorm';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import { Notification } from '@/notification/entities/notification.entity';
import * as moment from 'moment';

@Controller('professional-reference-response')
export class ProfessionalReferenceResponseController {
  constructor(
    private readonly professionalReferenceResponseService: ProfessionalReferenceResponseService,
    private readonly encryptDecryptService: EncryptDecryptService,
    private readonly notificationService: NotificationService,
    private readonly firebaseNotificationService: FirebaseNotificationService,
  ) {}

  @UseGuards(VerifyStaticTokeGuard)
  @Post(':id')
  async saveProfessionalReferenceResponse(
    @Param('id') id: string,
    @Query('is_decline') is_decline: boolean,
    @Body() submission: ProfessionalReferenceSubmissionDto,
  ) {
    try {
      const decryptedId = this.encryptDecryptService.decrypt(id);
      const { responses, reference_person } = submission;

      const professionalReference =
        await this.professionalReferenceResponseService.findOneProfessionalReference(
          {
            where: {
              id: decryptedId,
            },
            relations: {
              provider: true,
            },
            select: {
              id: true,
              status: true,
              provider: {
                id: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        );
      if (
        professionalReference &&
        [
          ProfessionalReferenceStatus.decline,
          ProfessionalReferenceStatus.awaiting_approval,
        ].includes(professionalReference.status)
      ) {
        const isDeclined =
          professionalReference.status === ProfessionalReferenceStatus.decline;
        return response.badRequest({
          message: isDeclined
            ? CONSTANT.ERROR.RESPONSE_ALREADY_DECLINED
            : CONSTANT.ERROR.RESPONSE_ALREADY_SUBMITTED('Response'),
          data: {},
        });
      }
      if (is_decline) {
        await this.professionalReferenceResponseService.updateProviderProfessionalReference(
          { id: decryptedId },
          {
            status: ProfessionalReferenceStatus.decline,
          },
        );

        // Create notification entity (can also be pre-created/reused)
        const notification =
          await this.notificationService.createUserSpecificNotification({
            title: CONSTANT.NOTIFICATION.PROFESSIONAL_REFERENCE_DECLINED_TITLE,
            text: CONSTANT.NOTIFICATION.PROFESSIONAL_REFERENCE_DECLINED_TEXT(
              reference_person.name || 'The reference',
            ),
            push_type: PushNotificationType.notify,
          });

        await this.notificationUpdate(
          notification,
          CONSTANT.NOTIFICATION.PROFESSIONAL_REFERENCE_DECLINED_DESCRIPTION(
            reference_person.name || 'The reference',
          ),
          professionalReference.provider.id,
        );
        return response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Response Declined'),
          data: {},
        });
      }

      // add validation for reference duplicate email and mobile number
      const ifExists =
        await this.professionalReferenceResponseService.findOneProfessionalReference(
          {
            where: [
              {
                id: Not(decryptedId),
                email: ILike(`%${reference_person.email}%`),
                provider: { id: professionalReference.provider.id },
              },
              {
                id: Not(decryptedId),
                mobile_no: reference_person.mobile_no,
                provider: { id: professionalReference.provider.id },
              },
            ],
          },
        );
      if (ifExists) {
        // If email or mobile number already exists for the same provider
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Email or Mobile Number'),
          data: {},
        });
      }

      // Attach provider_professional_reference id
      const mappedResponses = responses.map((response) => ({
        ...response,
        provider_professional_reference: decryptedId,
      }));
      const addResponse =
        await this.professionalReferenceResponseService.createResponse(
          mappedResponses,
          decryptedId,
        );

      await this.professionalReferenceResponseService.updateProviderProfessionalReference(
        { id: decryptedId },
        {
          status: ProfessionalReferenceStatus.awaiting_approval,
          employer: reference_person.employers,
          name: reference_person.name,
          title: reference_person.title,
          email: reference_person.email,
          country_code: reference_person.country_code,
          mobile_no: reference_person.mobile_no,
        },
      );

      // Create notification entity (can also be pre-created/reused)
      const notification =
        await this.notificationService.createUserSpecificNotification({
          title: CONSTANT.NOTIFICATION.PROFESSIONAL_REFERENCE_SUBMITTED_TITLE,
          text: CONSTANT.NOTIFICATION.PROFESSIONAL_REFERENCE_SUBMITTED_TEXT(
            reference_person.name || 'The reference',
          ),
          push_type: PushNotificationType.notify,
        });

      await this.notificationUpdate(
        notification,
        CONSTANT.NOTIFICATION.PROFESSIONAL_REFERENCE_SUBMITTED_DESCRIPTION(
          reference_person.name || 'The reference',
        ),
        professionalReference.provider.id,
      );

      return response.successCreate({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Response Submitted'),
        data: addResponse,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @UseGuards(VerifyStaticTokeGuard)
  @Get(':id') // provider_professional_reference id
  async fetchProfessionalReferenceResponse(@Param('id') id: string) {
    try {
      const decryptedId = this.encryptDecryptService.decrypt(id);
      const fetchProviderProfessionalReference =
        await this.professionalReferenceResponseService.findOneProfessionalReference(
          {
            where: { id: decryptedId },
            relations: {
              provider: true,
            },
          },
        );
      if (!fetchProviderProfessionalReference) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Professional Reference'),
          data: {},
        });
      }
      const alreadySubmitted =
        await this.professionalReferenceResponseService.findOneProfessionalReference(
          {
            where: {
              id: decryptedId,
              status: Not(ProfessionalReferenceStatus.awaiting_response),
            },
          },
        );
      if (
        alreadySubmitted &&
        (alreadySubmitted.status ===
          ProfessionalReferenceStatus.awaiting_approval ||
          alreadySubmitted.status === ProfessionalReferenceStatus.decline)
      ) {
        return response.badRequest({
          message:
            alreadySubmitted.status === ProfessionalReferenceStatus.decline
              ? CONSTANT.ERROR.RESPONSE_ALREADY_DECLINED
              : CONSTANT.ERROR.RESPONSE_ALREADY_SUBMITTED('Response'),
          data:
            alreadySubmitted.status === ProfessionalReferenceStatus.decline
              ? { is_declined: true }
              : { is_submitted: true },
        });
      }
      const fetchReferenceQuestion =
        await this.professionalReferenceResponseService.findReferenceFormDesign(
          {
            where: {
              reference_form: {
                status: DEFAULT_STATUS.active,
              },
            },
            relations: { reference_form_option: true },
            order: {
              order: 'ASC',
            },
          },
        );
      return response.successResponse({
        message:
          fetchReferenceQuestion.length > 0
            ? CONSTANT.SUCCESS.RECORD_FOUND('Question')
            : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Question'),
        data: {
          reference_person: {
            id: fetchProviderProfessionalReference.id,
            employers: fetchProviderProfessionalReference.employer,
            name: fetchProviderProfessionalReference.name,
            title: fetchProviderProfessionalReference.title,
            email: fetchProviderProfessionalReference.email,
            country_code: fetchProviderProfessionalReference.country_code,
            mobile_no: fetchProviderProfessionalReference.mobile_no,
            provider_name:
              fetchProviderProfessionalReference.provider.first_name +
              ' ' +
              fetchProviderProfessionalReference.provider.last_name,
          },
          questions: fetchReferenceQuestion,
        },
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  async notificationUpdate(
    notification: Notification,
    description: string,
    provider_id: string,
  ) {
    // Send notification to provider
    await this.firebaseNotificationService.sendNotificationToOne(
      notification,
      TABLE.provider,
      provider_id,
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
        description,
      },
    );
  }
}
