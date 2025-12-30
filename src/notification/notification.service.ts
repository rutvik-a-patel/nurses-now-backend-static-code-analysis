import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateUserNotificationDto } from '@/user-notification/dto/create-user-notification.dto';
import { DEFAULT_IMAGE, NotificationFor } from '@/shared/constants/enum';
import { plainToClass } from 'class-transformer';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async createUserSpecificNotification(
    createUserNotification: CreateUserNotificationDto,
  ) {
    const obj = {
      title: createUserNotification.title,
      text: createUserNotification.text,
      push_type: createUserNotification.push_type,
      for: NotificationFor.ONE_USER,
      base_url: process.env.AWS_ASSETS_PATH,
      image: DEFAULT_IMAGE.logo,
    };
    const result = await this.notificationRepository.save(obj);
    return plainToClass(Notification, result);
  }

  async findOneWhere(option: FindOneOptions<Notification>) {
    const result = await this.notificationRepository.findOne(option);
    return plainToClass(Notification, result);
  }
}
