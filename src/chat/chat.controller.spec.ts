import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { Chat } from './entities/chat.entity';

describe('ChatController', () => {
  let controller: ChatController;
  let chatService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: {
            getChatList: jest.fn(),
            getChatHistoryForUser: jest.fn(),
            getRoomIds: jest.fn(),
            markMessagesAsRead: jest.fn(),
            getChatHistory: jest.fn(),
            getInternalChatHistory: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
    chatService = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getChatList', () => {
    const req: any = { user: { id: '1' } };
    it('should return null data if there is no data', async () => {
      chatService.getChatList.mockResolvedValue(null);

      const result = await controller.getChatList(req);
      expect(chatService.getChatList).toHaveBeenCalledWith(req.user);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Chat List'),
          data: {},
        }),
      );
    });

    it('should return team list data', async () => {
      chatService.getChatList.mockResolvedValue([new Chat()]);

      const result = await controller.getChatList(req);
      expect(chatService.getChatList).toHaveBeenCalledWith(req.user);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Chat List'),
          data: [new Chat()],
        }),
      );
    });

    it('should handle failure case', async () => {
      const error = new Error('error');
      chatService.getChatList.mockRejectedValue(error);

      const result = await controller.getChatList(req);
      expect(chatService.getChatList).toHaveBeenCalledWith(req.user);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getChatHistoryForUser', () => {
    const roomId = 'id';
    const limit = '10';
    const offset = '0';
    it('should return no data found there is no record', async () => {
      chatService.getChatHistoryForUser.mockResolvedValue([[], 0]);

      const result = await controller.getChatHistoryForUser(roomId);
      expect(chatService.getChatHistoryForUser).toHaveBeenCalledWith(
        roomId,
        +limit,
        +offset,
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Chat'),
          total: 0,
          limit: +limit,
          offset: +offset,
          data: [],
        }),
      );
    });

    it('should return team list data', async () => {
      chatService.getChatHistoryForUser.mockResolvedValue([[new Chat()], 1]);

      const result = await controller.getChatHistoryForUser(
        roomId,
        limit,
        offset,
      );
      expect(chatService.getChatHistoryForUser).toHaveBeenCalledWith(
        roomId,
        +limit,
        +offset,
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Chat'),
          total: 1,
          limit: +limit,
          offset: +offset,
          data: [new Chat()],
        }),
      );
    });

    it('should handle failure case', async () => {
      const error = new Error('error');
      chatService.getChatHistoryForUser.mockRejectedValue(error);

      const result = await controller.getChatHistoryForUser(
        roomId,
        limit,
        offset,
      );
      expect(chatService.getChatHistoryForUser).toHaveBeenCalledWith(
        roomId,
        +limit,
        +offset,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getInternalChatHistory', () => {
    const req: any = { user: { id: '1' } };
    const userId = 'id';
    const limit = '10';
    const offset = '0';
    it('should return no data found there is no record', async () => {
      chatService.getInternalChatHistory.mockResolvedValue([[], 0]);

      const result = await controller.getInternalChatHistory(req, userId);
      expect(chatService.getInternalChatHistory).toHaveBeenCalledWith(
        req.user.id,
        userId,
        +limit,
        +offset,
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Chat'),
          total: 0,
          limit: +limit,
          offset: +offset,
          data: [],
        }),
      );
    });

    it('should return team list data', async () => {
      chatService.getInternalChatHistory.mockResolvedValue([[new Chat()], 1]);

      const result = await controller.getInternalChatHistory(
        req,
        userId,
        limit,
        offset,
      );
      expect(chatService.getInternalChatHistory).toHaveBeenCalledWith(
        req.user.id,
        userId,
        +limit,
        +offset,
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Chat'),
          total: 1,
          limit: +limit,
          offset: +offset,
          data: [new Chat()],
        }),
      );
    });

    it('should handle failure case', async () => {
      const error = new Error('error');
      chatService.getInternalChatHistory.mockRejectedValue(error);

      const result = await controller.getInternalChatHistory(
        req,
        userId,
        limit,
        offset,
      );
      expect(chatService.getInternalChatHistory).toHaveBeenCalledWith(
        req.user.id,
        userId,
        +limit,
        +offset,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getChatHistory', () => {
    const req: any = { user: { id: '1' } };
    const userId = 'id';
    const limit = '10';
    const offset = '0';
    it('should return no data found there is no record', async () => {
      chatService.getChatHistory.mockResolvedValue([[], 0]);

      const result = await controller.getChatHistory(req, userId);
      expect(chatService.getChatHistory).toHaveBeenCalledWith(
        req.user.id,
        userId,
        +limit,
        +offset,
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Chat'),
          total: 0,
          limit: +limit,
          offset: +offset,
          data: [],
        }),
      );
    });

    it('should return team list data', async () => {
      chatService.getChatHistory.mockResolvedValue([[new Chat()], 1]);

      const result = await controller.getChatHistory(
        req,
        userId,
        limit,
        offset,
      );
      expect(chatService.getChatHistory).toHaveBeenCalledWith(
        req.user.id,
        userId,
        +limit,
        +offset,
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Chat'),
          total: 1,
          limit: +limit,
          offset: +offset,
          data: [new Chat()],
        }),
      );
    });

    it('should handle failure case', async () => {
      const error = new Error('error');
      chatService.getRoomIds.mockRejectedValue(error);

      const result = await controller.getChatHistory(
        req,
        userId,
        limit,
        offset,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('markAsRead', () => {
    const req: any = { user: { id: '1' } };
    const id = '1';
    it('should mark as read all unread msgs', async () => {
      chatService.markMessagesAsRead.mockResolvedValue({ affected: 1 });

      const result = await controller.markAsRead(req, id);
      expect(chatService.markMessagesAsRead).toHaveBeenCalledWith(
        req.user.id,
        id,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Mark as Read'),
          data: {},
        }),
      );
    });

    it('should handle failure case', async () => {
      const error = new Error('error');
      chatService.markMessagesAsRead.mockRejectedValue(error);

      const result = await controller.markAsRead(req, id);
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
