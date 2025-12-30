import { Test, TestingModule } from '@nestjs/testing';
import { UserNotificationController } from './user-notification.controller';
import { UserNotificationService } from './user-notification.service';
import { UserNotification } from './entities/user-notification.entity';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { IsNull } from 'typeorm';
import { UserNotificationQuery } from '@/shared/dto/query-params.dto';

describe('UserNotificationController', () => {
  let controller: UserNotificationController;
  let userNotificationService: any;

  beforeEach(async () => {
    const userNotificationServiceMock = {
      markAsRead: jest.fn(),
      findAll: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserNotificationController],
      providers: [
        {
          provide: UserNotificationService,
          useValue: userNotificationServiceMock,
        },
      ],
    }).compile();

    controller = module.get<UserNotificationController>(
      UserNotificationController,
    );
    userNotificationService = module.get<UserNotificationService>(
      UserNotificationService,
    );

    userNotificationService.markAsRead = jest
      .fn()
      .mockResolvedValue({ affected: 1 }) as jest.MockedFunction<
      typeof userNotificationService.update
    >;
    userNotificationService.findAll = jest
      .fn()
      .mockResolvedValue([[new UserNotification()], 1]) as jest.MockedFunction<
      typeof userNotificationService.findAll
    >;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('markAsRead', () => {
    const req: any = { user: { id: '1', role: 'provider' } };
    const id = '1';
    it('should return record not found if no notification updated', async () => {
      userNotificationService.markAsRead.mockResolvedValue({ affected: 0 });

      const result = await controller.markAsRead(id, req);

      expect(userNotificationService.markAsRead).toHaveBeenCalledWith({
        notification: { id },
        is_read: false,
        [req.user.role]: req.user.id,
        deleted_at: IsNull(),
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
          data: {},
        }),
      );
    });

    it('should return success message if notification updated', async () => {
      userNotificationService.markAsRead.mockResolvedValue({ affected: 1 });

      const result = await controller.markAsRead(id, req);

      expect(userNotificationService.markAsRead).toHaveBeenCalledWith({
        notification: { id },
        is_read: false,
        [req.user.role]: req.user.id,
        deleted_at: IsNull(),
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Marked as Read'),
          data: {},
        }),
      );
    });

    it('should return success message if notification updated', async () => {
      const error = new Error('Database error');
      userNotificationService.markAsRead.mockRejectedValue(error);
      const result = await controller.markAsRead(id, req);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('markAsAllRead', () => {
    const req: any = { user: { id: '1', user: 'provider' } };
    it('should return record not found if no notification updated', async () => {
      userNotificationService.markAsRead.mockResolvedValue({ affected: 0 });

      const result = await controller.markAsAllRead(req);

      expect(userNotificationService.markAsRead).toHaveBeenCalledWith({
        is_read: false,
        [req.user.role]: req.user.id,
        deleted_at: IsNull(),
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
          data: {},
        }),
      );
    });

    it('should return success message if notification updated', async () => {
      userNotificationService.markAsRead.mockResolvedValue({ affected: 1 });

      const result = await controller.markAsAllRead(req);

      expect(userNotificationService.markAsRead).toHaveBeenCalledWith({
        is_read: false,
        [req.user.role]: req.user.id,
        deleted_at: IsNull(),
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Marked as Read'),
          data: {},
        }),
      );
    });

    it('should return success message if notification updated', async () => {
      const error = new Error('Database error');
      userNotificationService.markAsRead.mockRejectedValue(error);
      const result = await controller.markAsAllRead(req);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findAll', () => {
    const req: any = { user: { id: '1', role: 'provider' } };
    const queryParamsDto = new UserNotificationQuery();
    it('should successfully retrieve notification', async () => {
      const mockHistory = Array(10).fill(new UserNotification());
      const mockCount = 10;

      userNotificationService.findAll.mockResolvedValue([
        mockHistory,
        mockCount,
      ]); // Mock service response

      const result = await controller.findAll(queryParamsDto, req);

      expect(userNotificationService.findAll).toHaveBeenCalledWith(
        req.user.id,
        req.user.role,
        queryParamsDto,
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Notification'),
          total: mockCount,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: mockHistory,
        }),
      );
    });

    it('should return no records found when there are no notification', async () => {
      userNotificationService.findAll.mockResolvedValue([[], 0]);

      const result = await controller.findAll(queryParamsDto, req);
      expect(userNotificationService.findAll).toHaveBeenCalledWith(
        req.user.id,
        req.user.role,
        queryParamsDto,
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Notification'),
          total: 0,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: [],
        }),
      );
    });

    it('should handle errors during the fetch process', async () => {
      const errorMessage = 'Database error';
      userNotificationService.findAll.mockRejectedValue(
        new Error(errorMessage),
      ); // Simulate an error

      const result = await controller.findAll(queryParamsDto, req);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });
});
