import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserNotificationService } from './user-notification.service';
import { UserNotification } from './entities/user-notification.entity';
import { Repository } from 'typeorm';
import { Notification } from '@/notification/entities/notification.entity';
import { DEVICE_TYPE, TABLE } from '@/shared/constants/enum';
import { UserNotificationQuery } from '@/shared/dto/query-params.dto';
import { Token } from '@/token/entities/token.entity';

describe('UserNotificationService', () => {
  let service: UserNotificationService;
  let userNotificationRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserNotificationService,
        {
          provide: getRepositoryToken(UserNotification),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              leftJoin: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              offset: jest.fn().mockReturnThis(),
              getRawMany: jest.fn(),
              getCount: jest.fn(),
            })),
            query: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Token),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<UserNotificationService>(UserNotificationService);
    userNotificationRepository = module.get<Repository<UserNotification>>(
      getRepositoryToken(UserNotification),
    );
  });

  describe('findAll', () => {
    let mockQueryBuilder;
    beforeEach(() => {
      mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
      };

      // Setup mock for createQueryBuilder to return the mock query builder
      userNotificationRepository.createQueryBuilder = jest.fn(
        () => mockQueryBuilder,
      );
    });
    it('should return a list of user notifications and count', async () => {
      const id = '1';
      const table = TABLE.provider;
      const queryParamsDto = new UserNotificationQuery();
      queryParamsDto.limit = '10';
      queryParamsDto.offset = '0';

      const mockUserNotifications = [new UserNotification()];
      const mockCount = 1;

      mockQueryBuilder.getRawMany.mockResolvedValue(mockUserNotifications);
      mockQueryBuilder.getCount.mockResolvedValue(mockCount);

      const result = await service.findAll(id, table, queryParamsDto);
      expect(result).toEqual([mockUserNotifications, mockCount]);
    });
  });

  describe('createForAll', () => {
    it('should create notifications for all users', async () => {
      const notification = new Notification();
      notification.id = '1';
      notification.device_type = DEVICE_TYPE.web;
      userNotificationRepository.query.mockResolvedValue(
        new UserNotification(),
      );
      await service.createForAll(notification);
    });

    it('should create notifications for specific device type users', async () => {
      const notification = new Notification();
      notification.id = '1';
      notification.device_type = DEVICE_TYPE.all;
      await service.createForAll(notification);
    });
  });

  describe('createForOne', () => {
    it('should create a notification for a specific user', async () => {
      const notificationId = '1';
      const table = TABLE.provider;
      const userId = '1';
      const data = { message: 'Test message' };
      await service.createForOne(notificationId, table, userId, data);
    });
  });

  describe('markAsRead', () => {
    it('should mark notifications as read', async () => {
      const where = { id: '1' };
      const updateResult = { affected: 1 };

      userNotificationRepository.update.mockResolvedValue(updateResult);

      const result = await service.markAsRead(where);
      expect(userNotificationRepository.update).toHaveBeenCalledWith(where, {
        is_read: true,
      });
      expect(result).toEqual(updateResult);
    });
  });
});
