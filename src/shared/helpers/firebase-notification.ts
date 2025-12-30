import { Notification as NotificationEntity } from '@/notification/entities/notification.entity';
import { TokenService } from '@/token/token.service';
import { UserNotificationService } from '@/user-notification/user-notification.service';
import { Injectable } from '@nestjs/common';
import admin, { app } from 'firebase-admin';
import { DEVICE_TYPE } from '../constants/enum';
import { AUTH_TABLE } from '../constants/types';
import logger from './logger';
import {
  AndroidConfig,
  ApnsConfig,
  MulticastMessage,
  Notification,
  WebpushConfig,
} from 'firebase-admin/lib/messaging/messaging-api';
import { ChatGateway } from '@/chat/chat.gateway';

@Injectable()
export class FirebaseNotificationService {
  firebaseAdmin: app.App;

  constructor(
    private readonly userTokenService: TokenService,
    private readonly userNotificationService: UserNotificationService,
    private readonly chatGateway: ChatGateway,
  ) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
    }
    this.firebaseAdmin = admin.app();
  }

  async sendNotificationToAll(
    notification: NotificationEntity,
    table: AUTH_TABLE,
  ) {
    try {
      const where = {};
      if (
        notification.device_type &&
        notification.device_type !== DEVICE_TYPE.all
      ) {
        Object.assign(where, { device_type: notification.device_type });
      }

      const list = await this.userTokenService.getFirebaseToken(where, table);

      await this.send(
        list.map((userToken) => userToken.firebase),
        notification,
      );

      this.userNotificationService.createForAll(notification);
    } catch (error) {
      logger.error(`${new Date().toLocaleString('es-CL')} ${error.message}`);
    }
  }

  async sendNotificationToOne(
    notification: NotificationEntity,
    table: AUTH_TABLE,
    id: string,
    related: any,
  ) {
    try {
      const where = {
        [table]: { id },
      };
      const list = await this.userTokenService.getFirebaseToken(where, table);
      const data = {
        [related.to]: JSON.stringify(related),
      };

      await this.send(
        list.map((userToken) => userToken.firebase),
        notification,
        data,
      );

      if (notification.id) {
        await this.userNotificationService.createForOne(
          notification.id,
          table,
          id,
          related,
        );
      }

      await this.chatGateway.emitUnreadNotificationCount(id);
    } catch (error) {
      logger.error(`${new Date().toLocaleString('es-CL')} ${error.message}`);
    }
  }

  async send(
    tokens: string[],
    notificationData: NotificationEntity,
    data?: { [key: string]: string },
  ) {
    const notification: Notification = {
      title: notificationData.title,
      body: notificationData.text,
      // imageUrl: process.env.AWS_ASSETS_PATH + notificationData.image,
    };

    const android: AndroidConfig = {
      priority: 'high',
      data: data,
      notification: {
        title: notificationData.title,
        body: notificationData.text,
        // imageUrl: notification.imageUrl,
        priority: 'high',
      },
    };

    const webpush: WebpushConfig = {
      data: data,
      notification: {
        title: notification.title,
        // badge: notification.imageUrl,
        body: notification.body,
        data: data,
        // icon: notification.imageUrl,
        // image: notification.imageUrl,
      },
    };

    const apns: ApnsConfig = {
      payload: {
        aps: {
          alert: { title: notification.title, body: notification.body },
          mutableContent: true,
        },
      },
      fcmOptions: {
        // imageUrl: notification.imageUrl,
      },
    };

    const batchSize = 500;

    for (let i = 0; i < tokens.length; i += batchSize) {
      const batchTokens = tokens.slice(i, i + batchSize);

      const message: MulticastMessage = {
        data: data,
        notification: notification,
        android: android,
        webpush: webpush,
        apns: apns,
        tokens: batchTokens,
      };

      await this.firebaseAdmin.messaging().sendEachForMulticast(message);
    }
  }
}
