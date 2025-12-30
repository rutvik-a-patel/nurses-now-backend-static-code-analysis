import { Injectable } from '@nestjs/common';
import sendEmailHelper from './send-email-helper';
import { SHIFT_NOTIFICATION } from '../constants/types';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from './firebase-notification';
import logger from './logger';
import { SHIFT_STATUS_DESCRIPTIONS } from '../constants/constant';
import * as moment from 'moment';
@Injectable()
export class ShiftNotificationService {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly firebaseNotificationService: FirebaseNotificationService,
  ) {}

  async sendNotification(payload: SHIFT_NOTIFICATION) {
    try {
      await sendEmailHelper({
        email: payload.email,
        cc_email: payload?.cc_mail,
        email_type: payload.emailType,
        subject: payload.subject,
        shiftData: payload.shiftData,
        redirectUrl: payload.redirectUrl,
      });
      const notification =
        await this.notificationService.createUserSpecificNotification({
          title: payload.title,
          text: payload.text,
          push_type: payload.push_type,
        });

      await this.firebaseNotificationService.sendNotificationToOne(
        notification,
        payload.role,
        payload.userId,
        {
          id: payload.shiftData.id,
          notification_id: notification.id,
          status: payload.shiftData.status,
          start_date: payload.shiftData.start_date,
          start_time: payload.shiftData.start_time,
          end_date: payload.shiftData.end_date,
          end_time: payload.shiftData.end_time,
          facility: {
            id: payload.shiftData.facility.id,
            name: payload.shiftData.facility.name,
            street_address: payload.shiftData.facility.street_address,
            house_no: payload.shiftData.facility.house_no,
            zip_code: payload.shiftData.facility.zip_code,
            latitude: payload.shiftData.facility.latitude,
            longitude: payload.shiftData.facility.longitude,
          },
          description: SHIFT_STATUS_DESCRIPTIONS[payload.shiftStatus]?.({
            date_time: `${moment(payload.shiftData.start_date).format('MMMM D YYYY')}, ${moment(payload.shiftData.start_time, 'HH:mm:ss').format('hh:mm A')} to ${moment(payload.shiftData.end_time, 'HH:mm:ss').format('hh:mm A')}`,
            location: payload.shiftData.facility.name,
            name: `${payload.shiftData?.provider?.first_name} ${payload.shiftData?.provider?.last_name}`,
          }),
          shift_status: payload.shiftStatus,
          to: 'notification_data',
          created_at: new Date().toISOString(),
        },
      );
    } catch (error) {
      logger.error(`${new Date().toLocaleString('es-CL')} ${error.message}`);
    }
  }
}
