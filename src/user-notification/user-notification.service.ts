import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserNotification } from './entities/user-notification.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Notification } from '@/notification/entities/notification.entity';
import { DEVICE_TYPE, TABLE } from '@/shared/constants/enum';
import { AUTH_TABLE } from '@/shared/constants/types';
import { UserNotificationQuery } from '@/shared/dto/query-params.dto';
import * as jwt from 'jsonwebtoken';
import { Token } from '@/token/entities/token.entity';

@Injectable()
export class UserNotificationService {
  private room: Record<
    string,
    Record<string, { id: string; name: string; user_type: TABLE }>
  > = {};
  private clientRooms: Record<string, string[]> = {};

  constructor(
    @InjectRepository(UserNotification)
    private readonly userNotificationRepository: Repository<UserNotification>,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  async findAll(
    id: string,
    table: TABLE,
    queryParamsDto: UserNotificationQuery,
  ): Promise<[UserNotification[], number]> {
    const queryBuilder =
      this.userNotificationRepository.createQueryBuilder('un');

    queryBuilder
      .leftJoin('un.notification', 'n')
      .select([
        'n.id AS id',
        'un.is_read AS is_read',
        'un.created_at AS created_at',
        'un.data AS notification_data',
        'n.title AS title',
        'n.text AS text',
        'n.base_url AS base_url',
        'n.image AS image',
        'n.push_type AS push_type',
      ])
      .where(`un.${table}_id = '${id}'`);

    if (queryParamsDto.is_read) {
      queryBuilder.andWhere('un.is_read = :is_read', {
        is_read: queryParamsDto.is_read,
      });
    }

    queryBuilder.orderBy(`un.created_at`, 'DESC');
    if (+queryParamsDto.limit > 0) {
      queryBuilder.limit(+queryParamsDto.limit);
    }
    if (+queryParamsDto.offset > 0) {
      queryBuilder.offset(+queryParamsDto.offset);
    }
    const list = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();
    return [list, count];
  }

  async createForAll(notification: Notification) {
    let where = `deleted_at IS NULL`;
    if (notification.device_type !== DEVICE_TYPE.all) {
      where += ` AND device_type = '${notification.device_type}' `;
    }
    const query = `
      INSERT INTO user_notification (provider_id, facility_id, facility_user_id, admin_id, notification_id)
      SELECT DISTINCT provider_id, facility_id, facility_user_id, admin_id, '${notification.id}'::uuid FROM token
      WHERE ${where}
    `;
    await this.userNotificationRepository.query(query);
  }

  async createForOne(
    notification: string,
    table: AUTH_TABLE,
    id: string,
    data?: any,
  ) {
    const query = `
      INSERT INTO user_notification (${table}_id, notification_id, data)
      VALUES ('${id}', '${notification}', '${JSON.stringify(data)}');
    `;
    await this.userNotificationRepository.query(query);
  }

  async markAsRead(where: FindOptionsWhere<UserNotification>) {
    const result = await this.userNotificationRepository.update(where, {
      is_read: true,
    });
    return result;
  }

  async validateToken(token: string): Promise<boolean> {
    const validate: any = await jwt.verify(token, process.env.JWT_SECRET);
    if (validate) {
      const isExist = await this.tokenRepository.findOne({
        where: {
          [validate['table']]: { id: validate.id },
          jwt: token,
        },
      });
      if (!isExist) {
        return false;
      }
      return true;
    }
    return false;
  }

  handleDisconnect(clientId: string) {
    const clientRooms = this.clientRooms[clientId] || [];
    clientRooms.forEach((roomId) => {
      if (this.room[roomId] && this.room[roomId][clientId]) {
        delete this.room[roomId][clientId];
        if (Object.keys(this.room[roomId]).length === 0) {
          delete this.room[roomId];
        }
      }
    });
    delete this.clientRooms[clientId];
  }
}
