import { Injectable } from '@nestjs/common';
import { CreateReferenceFormGlobalSettingDto } from './dto/create-reference-form-global-setting.dto';
import { UpdateReferenceFormGlobalSettingDto } from './dto/update-reference-form-global-setting.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ReferenceFormGlobalSetting } from './entities/reference-form-global-setting.entity';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { ProviderProfessionalReference } from '@/provider-professional-reference/entities/provider-professional-reference.entity';
import { total_attempts } from '@/shared/constants/constant';
import {
  ProfessionalReferenceStatus,
  EJS_FILES,
  PushNotificationType,
  TABLE,
} from '@/shared/constants/enum';
import { CONSTANT } from '@/shared/constants/message';
import logger from '@/shared/helpers/logger';
import sendEmailHelper from '@/shared/helpers/send-email-helper';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';

@Injectable()
export class ReferenceFormGlobalSettingService {
  constructor(
    @InjectRepository(ReferenceFormGlobalSetting)
    private readonly referenceFormGlobalSettingRepository: Repository<ReferenceFormGlobalSetting>,
    @InjectRepository(ProviderProfessionalReference)
    private readonly providerProfessionalReferenceRepository: Repository<ProviderProfessionalReference>,
    private readonly encryptDecryptService: EncryptDecryptService,
    private readonly notificationService: NotificationService,
    private readonly firebaseNotificationService: FirebaseNotificationService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleReferenceFormReminders() {
    try {
      if (process.env.NODE_APP_INSTANCE === '0') {
        await this.sendReminders();
      }
    } catch (error) {
      logger.error('Reminder job failed:', error);
    }
  }

  async create(
    createReferenceFormGlobalSettingDto: CreateReferenceFormGlobalSettingDto,
  ) {
    const existingRecord =
      await this.referenceFormGlobalSettingRepository.findOne({
        where: {},
      });

    if (existingRecord) {
      await this.referenceFormGlobalSettingRepository.update(
        existingRecord.id,
        {
          ...createReferenceFormGlobalSettingDto,
          updated_at: new Date().toISOString(),
        },
      );
      return await this.findOne({ where: { id: existingRecord.id } });
    }

    const result = await this.referenceFormGlobalSettingRepository.save({
      ...createReferenceFormGlobalSettingDto,
      created_at: new Date().toISOString(),
    });
    return plainToInstance(ReferenceFormGlobalSetting, result);
  }

  async findAll(
    options: FindManyOptions<ReferenceFormGlobalSetting>,
  ): Promise<[ReferenceFormGlobalSetting[], number]> {
    const [list, count] =
      await this.referenceFormGlobalSettingRepository.findAndCount(options);
    return [plainToInstance(ReferenceFormGlobalSetting, list), count];
  }

  async findOne(options: FindOneOptions<ReferenceFormGlobalSetting>) {
    const result =
      await this.referenceFormGlobalSettingRepository.findOne(options);
    return plainToInstance(ReferenceFormGlobalSetting, result);
  }

  async findOneWhere(options: FindOneOptions<ReferenceFormGlobalSetting>) {
    const result =
      await this.referenceFormGlobalSettingRepository.findOne(options);
    return plainToInstance(ReferenceFormGlobalSetting, result);
  }

  async update(
    id: string,
    updateReferenceFormGlobalSettingDto: UpdateReferenceFormGlobalSettingDto,
  ) {
    const record = await this.referenceFormGlobalSettingRepository.update(id, {
      ...updateReferenceFormGlobalSettingDto,
      updated_at: new Date().toISOString(),
    });
    return record;
  }

  async updateWhere(
    where: FindOptionsWhere<ReferenceFormGlobalSetting>,
    updateReferenceFormGlobalSettingDto: UpdateReferenceFormGlobalSettingDto,
  ) {
    const record = await this.referenceFormGlobalSettingRepository.update(
      where,
      {
        ...updateReferenceFormGlobalSettingDto,
        updated_at: new Date().toISOString(),
      },
    );
    return record;
  }

  async remove(id: string, deleteDto: DeleteDto) {
    const record = await this.referenceFormGlobalSettingRepository.update(
      { id: id },
      {
        deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: new Date().toISOString(),
      },
    );
    return record;
  }

  async sendReminders() {
    const globalSetting =
      await this.referenceFormGlobalSettingRepository.findOne({
        where: {},
      });

    const reminderInterval = globalSetting?.reminder_interval || 1;

    // fetch pending references
    const allPendingReferences =
      await this.providerProfessionalReferenceRepository.find({
        where: {
          status: ProfessionalReferenceStatus.awaiting_response,
        },
        relations: { provider: true },
      });
    if (!allPendingReferences || allPendingReferences.length === 0) {
      logger.warn('No pending references found for reminders.');
      return;
    }

    for (const reference of allPendingReferences) {
      const isTimeToRemind = this.hasEnoughTimePassed(
        reference.updated_at,
        reminderInterval,
      );
      if (isTimeToRemind) {
        await this.sendReminderWithSpecifiedMethod(reference);
        await this.updateReminderCounters(reference, globalSetting);
      }
    }
  }

  /**
   * Send reminder email/SMS
   */
  private async sendReminderWithSpecifiedMethod(
    reference: ProviderProfessionalReference,
  ): Promise<void> {
    try {
      if (reference.send_form_by === 'email' && reference.email) {
        await this.sendEmailReminder(reference);
      } else if (reference.send_form_by === 'sms' && reference.mobile_no) {
        await this.sendSMSReminder(reference);
      } else {
        logger.warn(
          `No valid contact method for reference ${reference.id}: ${reference.send_form_by}`,
        );
      }
    } catch (error) {
      logger.error(
        `Failed to send reminder for reference ${reference.id}:`,
        error,
      );
    }
  }

  /**
   * Send email reminder
   */
  private async sendEmailReminder(
    reference: ProviderProfessionalReference,
  ): Promise<void> {
    const redirectUrl = `${process.env.PROFESSIONAL_REFERENCE}?id=${this.encryptDecryptService.encrypt(reference.id)}`;
    await sendEmailHelper({
      name: reference.name,
      email: reference.email,
      email_type: EJS_FILES.professional_reference_reminder,
      shiftData: { provider: reference.provider } as any,
      redirectUrl,
      subject: CONSTANT.EMAIL.PROFESSIONAL_REFERENCE_REMINDER,
    });
  }

  /**
   * Send SMS reminder (placeholder implementation)
   */
  private async sendSMSReminder(
    reference: ProviderProfessionalReference,
  ): Promise<void> {
    // TODO: Implement SMS sending logic
    logger.warn(
      `SMS reminder would be sent to ${reference.country_code}${reference.mobile_no} for reference ${reference.id}`,
    );

    // temporary message for logging
    const message = `Hi ${reference.name}, this is a reminder to complete the professional reference form for ${reference.provider.first_name} ${reference.provider.last_name}. Please click: ${process.env.PROFESSIONAL_REFERENCE}?id=${this.encryptDecryptService.encrypt(reference.id)}`;

    logger.warn(`SMS content: ${message}`);
  }

  /**
   * Update reminder counters after successful send
   */
  private async updateReminderCounters(
    reference: ProviderProfessionalReference,
    globalSettings: ReferenceFormGlobalSetting,
  ): Promise<void> {
    const newReminderCount = reference.total_reminder_sent + 1;

    await this.providerProfessionalReferenceRepository.update(
      { id: reference.id },
      {
        total_reminder_sent: newReminderCount,
        updated_at: new Date(),
      },
    );

    const total_reminder_attempts =
      globalSettings?.total_reminder_attempts || total_attempts;

    // If we've reached the maximum attempts, update status to 'no_response'
    if (newReminderCount >= total_reminder_attempts) {
      await this.providerProfessionalReferenceRepository.update(
        { id: reference.id },
        {
          status: ProfessionalReferenceStatus.no_response,
          updated_at: new Date(),
        },
      );

      // sending notification to provider about no response
      // Create notification entity (can also be pre-created/reused)
      const notification =
        await this.notificationService.createUserSpecificNotification({
          title: CONSTANT.NOTIFICATION.PROFESSIONAL_REFERENCE_NO_RESPONSE_TITLE,
          text: CONSTANT.NOTIFICATION.PROFESSIONAL_REFERENCE_NO_RESPONSE_TEXT(
            reference.name || 'The reference',
          ),
          push_type: PushNotificationType.notify,
        });

      // Send notification to provider
      await this.firebaseNotificationService.sendNotificationToOne(
        notification,
        TABLE.provider,
        reference.provider.id,
        {
          expire_in: 0,
          is_timer: false,
          status: PushNotificationType.auto_scheduling,

          // Use first shift from newShifts array for notification details
          start_date: moment().format('YYYY-MM-DD'),
          end_date: moment().format('YYYY-MM-DD'),
          start_time: moment().format('HH:mm:ss'),
          end_time: moment().format('HH:mm:ss'),
          to: 'notification_data',
          created_at: new Date().toISOString(),
          description:
            CONSTANT.NOTIFICATION.PROFESSIONAL_REFERENCE_NO_RESPONSE_DESCRIPTION(
              reference.provider.first_name,
            ),
        },
      );
    }
  }

  private hasEnoughTimePassed(lastDate: Date, interval: number): boolean {
    const now = moment();
    const lastMoment = moment(lastDate);
    const requiredMoment = lastMoment.clone().add(interval, 'seconds');

    const hasPassedTime = now.isAfter(requiredMoment);

    return hasPassedTime;
  }
}
