import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { CreateUserNotificationDto } from '@/user-notification/dto/create-user-notification.dto';
import { NotificationFor, DEFAULT_IMAGE } from '@/shared/constants/enum';
import { FindOneOptions, Repository } from 'typeorm';

describe('NotificationService', () => {
  let service: NotificationService;
  let notificationRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(Notification),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);

    notificationRepository = module.get<Repository<Notification>>(
      getRepositoryToken(Notification),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUserSpecificNotification', () => {
    const createUserNotification = new CreateUserNotificationDto();
    it('should create new notification', async () => {
      notificationRepository.save.mockResolvedValue(new Notification());
      const result = await service.createUserSpecificNotification(
        createUserNotification,
      );
      expect(notificationRepository.save).toHaveBeenCalledWith({
        title: createUserNotification.title,
        text: createUserNotification.text,
        for: NotificationFor.ONE_USER,
        base_url: process.env.AWS_ASSETS_PATH,
        image: DEFAULT_IMAGE.logo,
      });
      expect(result).toEqual(new Notification());
    });
  });

  describe('findOneWhere', () => {
    const option: FindOneOptions<Notification> = { where: { id: '1' } };
    it('should get one notification data', async () => {
      notificationRepository.findOne.mockResolvedValue(new Notification());
      const result = await service.findOneWhere(option);
      expect(notificationRepository.findOne).toHaveBeenCalledWith(option);
      expect(result).toEqual(new Notification());
    });
  });
});
