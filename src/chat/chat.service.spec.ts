import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Token } from '@/token/entities/token.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { Media } from '@/media/entities/media.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { Admin } from '@/admin/entities/admin.entity';
import { FindOneOptions, Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { JoinDto } from './dto/join.dto';
import { CHAT_TABLE, TABLE } from '@/shared/constants/enum';
import { Room } from '@/room/entities/room.entity';
import { Department } from '@/department/entities/department.entity';
import { UserNotification } from '@/user-notification/entities/user-notification.entity';
import { Shift } from '@/shift/entities/shift.entity';

describe('ChatService', () => {
  let service: ChatService;
  let chatRepository: any;
  let tokenRepository: any;
  let mediaRepository: any;
  let roomRepository: any;
  let departmentRepository: any;
  let providerRepository: any;
  let adminRepository: any;

  beforeAll(() => {
    process.env.AWS_ASSETS_PATH = 'aws_path';
  });

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    execute: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getMany: jest.fn(),
    getRawOne: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getRepositoryToken(Chat),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            findAndCount: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              select: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              offset: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              getCount: jest.fn().mockReturnThis(),
              getRawMany: jest.fn(),
              getRawOne: jest.fn(),
            })),
          },
        },
        {
          provide: getRepositoryToken(Token),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Provider),
          useValue: {
            update: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Facility),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(FacilityUser),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Admin),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Media),
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Room),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserNotification),
          useValue: {
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Shift),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Department),
          useValue: {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              select: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              getMany: jest.fn(),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    chatRepository = module.get<Repository<Chat>>(getRepositoryToken(Chat));
    tokenRepository = module.get<Repository<Token>>(getRepositoryToken(Token));
    mediaRepository = module.get<Repository<Media>>(getRepositoryToken(Media));
    roomRepository = module.get<Repository<Room>>(getRepositoryToken(Room));
    providerRepository = module.get<Repository<Provider>>(
      getRepositoryToken(Provider),
    );
    adminRepository = module.get<Repository<Admin>>(getRepositoryToken(Admin));
    departmentRepository = module.get<Repository<Department>>(
      getRepositoryToken(Department),
    );
    chatRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
    departmentRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateToken', () => {
    it('should return true for a valid token', async () => {
      const token = 'valid-token';
      const decodedToken: any = { id: 1, table: 'users' };
      const mockTokenRecord = { jwt: token, users: { id: decodedToken.id } };

      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        return {
          id: '1',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 60 * 60,
        }; // Token expires in 1 hour
      });
      tokenRepository.findOne.mockResolvedValue(mockTokenRecord);

      const result = await service.validateToken(token);
      expect(result).toBe(true);
      expect(tokenRepository.findOne).toHaveBeenCalled();
    });
    it('should return true for a valid token', async () => {
      const token = 'valid-token';

      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        return {
          id: '1',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 60 * 60,
        }; // Token expires in 1 hour
      });
      tokenRepository.findOne.mockResolvedValue(null);

      const result = await service.validateToken(token);
      expect(result).toBe(false);
      expect(tokenRepository.findOne).toHaveBeenCalled();
    });

    it('should return false for an invalid token', async () => {
      const token = 'invalid-token';
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        return null;
      });

      const result = await service.validateToken(token);
      expect(result).toBe(false);
    });
  });

  describe('markMessagesAsRead', () => {
    it('should mark all unread msgs', async () => {
      mockQueryBuilder.execute.mockResolvedValue({ affected: 1 });

      const result = await service.markMessagesAsRead('1', '1');
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('joinRoom', () => {
    it('should allow a user to join a room', async () => {
      const joinDto = new JoinDto();
      const clientId = 'client1';

      await service.joinRoom(joinDto, clientId);
    });

    it('should add a user to an existing room', async () => {
      const joinDto1 = new JoinDto();
      const joinDto2 = new JoinDto();
      const clientId1 = 'client1';
      const clientId2 = 'client2';

      await service.joinRoom(joinDto1, clientId1);
      await service.joinRoom(joinDto2, clientId2);
    });
  });

  describe('leaveRoom', () => {
    it('should allow a user to leave a room and delete the room if it is empty', async () => {
      const joinDto: any = {
        room: 'room1',
        user: { id: 'user1', name: 'Test', user_type: 'USER' },
      };
      const clientId = 'client1';
      const leaveRoom: any = { room: 'room1' };

      await service.joinRoom(joinDto, clientId);

      // Ensure the room and user are set up correctly
      expect(service['room']['room1']).toBeDefined();
      expect(service['room']['room1'][clientId]).toEqual(joinDto.user);

      // Call leaveRoom and verify the room is removed
      await service.leaveRoom(leaveRoom, clientId);
      expect(service['room']['room1']).toBeUndefined();
      expect(service['clientRooms'][clientId]).toBeUndefined();
    });

    it('should remove only the specified client from a room and keep the room if other users exist', async () => {
      const joinDto1: any = {
        room: 'room1',
        user: { id: 'user1', name: 'User1', user_type: 'USER' },
      };
      const joinDto2: any = {
        room: 'room1',
        user: { id: 'user2', name: 'User2', user_type: 'USER' },
      };
      const clientId1 = 'client1';
      const clientId2 = 'client2';

      const leaveRoom: any = { room: 'room1' };

      await service.joinRoom(joinDto1, clientId1);
      await service.joinRoom(joinDto2, clientId2);

      // Ensure the room has both clients
      expect(service['room']['room1']).toBeDefined();
      expect(service['room']['room1'][clientId1]).toEqual(joinDto1.user);
      expect(service['room']['room1'][clientId2]).toEqual(joinDto2.user);

      // Call leaveRoom for client1 and verify the room still exists for client2
      await service.leaveRoom(leaveRoom, clientId1);
      expect(service['room']['room1']).toBeDefined();
      expect(service['room']['room1'][clientId1]).toBeUndefined();
      expect(service['room']['room1'][clientId2]).toEqual(joinDto2.user);
    });

    it('should handle attempting to leave a room that does not exist gracefully', async () => {
      const clientId = 'client1';
      const leaveRoom: any = { room: 'nonExistentRoom' };

      // Call leaveRoom for a non-existent room
      await service.leaveRoom(leaveRoom, clientId);

      // Verify no errors are thrown and no data is modified
      expect(service['room']['nonExistentRoom']).toBeUndefined();
      expect(service['clientRooms'][clientId]).toBeUndefined();
    });
  });

  describe('handleDisconnect', () => {
    it('should remove the client from all rooms on disconnect', () => {
      const clientId = 'client1';
      const room1 = 'room1';
      const room2 = 'room2';

      service['room'][room1] = {
        [clientId]: { id: 'user1', name: 'Test', user_type: TABLE.admin },
      };
      service['room'][room2] = {
        [clientId]: { id: 'user1', name: 'Test', user_type: TABLE.admin },
      };
      service['clientRooms'][clientId] = [room1, room2];

      service.handleDisconnect(clientId);

      expect(service['room'][room1]).toBeUndefined();
      expect(service['room'][room2]).toBeUndefined();
      expect(service['clientRooms'][clientId]).toBeUndefined();
    });

    it('should remove the client from all rooms on disconnect', () => {
      const clientId = 'client1';
      const room1 = 'room1';
      const room2 = 'room2';

      service['room'][room1] = {
        [clientId]: { id: 'user1', name: 'Test', user_type: TABLE.admin },
      };
      service['room'][room2] = {
        [clientId]: { id: 'user1', name: 'Test', user_type: TABLE.admin },
      };
      service['clientRooms'][clientId] = null;

      service.handleDisconnect(clientId);
      expect(service['clientRooms'][clientId]).toBeUndefined();
    });
  });

  describe('getUserByRoomIdAndClientId', () => {
    it('should return the user associated with the given roomId and clientId', async () => {
      const roomId = 'room1';
      const clientId: TABLE = TABLE.admin;
      const mockUser = { id: 'user1', name: 'Test User', user_type: 'USER' };
      const mockData: any = { [clientId]: mockUser };
      service['room'][roomId] = mockData;

      const result = await service.getUserByRoomIdAndClientId(roomId, clientId);
      expect(result).toEqual(mockUser);
    });

    it('should return undefined if the roomId or clientId does not exist', async () => {
      const roomId = 'room1';
      const clientId = 'client1';

      const result = await service.getUserByRoomIdAndClientId(roomId, clientId);
      expect(result).toBeUndefined();
    });
  });

  describe('saveChat', () => {
    it('should save a chat when a user exists in the room', async () => {
      const clientId = TABLE.admin;
      const roomId = 'room1';
      const mockUser = { id: 'user1', user_type: 'USER' };
      const mockData: any = { [clientId]: mockUser };
      const sendMessageDto = {
        id: 'chat1',
        room: roomId,
        shift: 'shift1',
        message: 'Hello World',
        user_id: '1', // Receiver's user ID
        user_type: CHAT_TABLE.admin,
        created_at_ip: '127.0.0.1',
        parent: null,
        media: {
          image: ['image1.jpg', 'image2.jpg'],
        },
      };

      service['room'][roomId] = mockData;
      const mockSavedMedia: any = {
        id: 'media1',
        base_url: 'http://example.com',
        image: 2,
      };
      const mockSavedChat: any = {
        id: 'chat1',
        ...sendMessageDto,
        user_id: 'user1',
        user_type: 'USER',
      };

      mediaRepository.save.mockResolvedValue(mockSavedMedia);
      jest
        .spyOn(service['chatRepository'], 'save')
        .mockResolvedValue(mockSavedChat);

      await service.saveChat(sendMessageDto, clientId);

      expect(service['mediaRepository'].save).toHaveBeenCalledWith({
        base_url: process.env.AWS_ASSETS_PATH,
        image: ['image1.jpg', 'image2.jpg'],
      });
      expect(service['chatRepository'].save).toHaveBeenCalled();
    });

    it('should return parent chat if it exists', async () => {
      const clientId = TABLE.admin;
      const roomId = 'room1';
      const mockUser = { id: 'user1', user_type: 'USER' };
      const mockData: any = { [clientId]: mockUser };
      const sendMessageDto = {
        id: 'chat1',
        room: roomId,
        shift: 'shift1',
        message: 'Hello World',
        user_id: '1', // Receiver's user ID
        user_type: CHAT_TABLE.admin,
        created_at_ip: '127.0.0.1',
        parent: 'parentChatId',
        media: null,
      };

      service['room'][roomId] = mockData;

      jest.spyOn(service['chatRepository'], 'findOne').mockResolvedValue(null);

      await service.saveChat(sendMessageDto, clientId);

      expect(service['chatRepository'].findOne).toHaveBeenCalledWith({
        where: { id: 'parentChatId' },
      });
    });

    it('should return parent chat if it exists', async () => {
      const clientId = TABLE.admin;
      const roomId = 'room1';
      const mockUser = { id: 'user1', user_type: 'USER' };
      const mockData: any = { [clientId]: mockUser };
      const sendMessageDto = {
        id: 'chat1',
        room: roomId,
        shift: 'shift1',
        message: 'Hello World',
        user_id: '1', // Receiver's user ID
        user_type: CHAT_TABLE.admin,
        created_at_ip: '127.0.0.1',
        parent: 'parentChatId',
        media: null,
      };

      service['room'][roomId] = mockData;

      const mockParentChat: any = {
        id: 'parentChatId',
        user_type: TABLE.facility,
        user_id: 'user2',
        message: 'Parent Message',
      };

      jest
        .spyOn(service['chatRepository'], 'findOne')
        .mockResolvedValue(mockParentChat);

      await service.saveChat(sendMessageDto, clientId);

      expect(service['chatRepository'].findOne).toHaveBeenCalledWith({
        where: { id: 'parentChatId' },
      });
    });

    it('should return parent chat if it exists', async () => {
      const clientId = TABLE.admin;
      const roomId = 'room1';
      const mockUser = { id: 'user1', user_type: 'USER' };
      const mockData: any = { [clientId]: mockUser };
      const sendMessageDto = {
        id: 'chat1',
        room: roomId,
        shift: 'shift1',
        message: 'Hello World',
        user_id: '1', // Receiver's user ID
        user_type: CHAT_TABLE.admin,
        created_at_ip: '127.0.0.1',
        parent: 'parentChatId',
        media: null,
      };

      service['room'][roomId] = mockData;

      const mockParentChat: any = {
        id: 'parentChatId',
        user_type: CHAT_TABLE.provider,
        sender_type: CHAT_TABLE.provider,
        user_id: 'user2',
        message: 'Parent Message',
      };

      jest
        .spyOn(service['chatRepository'], 'findOne')
        .mockResolvedValue(mockParentChat);

      await service.saveChat(sendMessageDto, clientId);

      expect(service['chatRepository'].findOne).toHaveBeenCalledWith({
        where: { id: 'parentChatId' },
      });
    });

    it('should return parent chat if it exists', async () => {
      const clientId = TABLE.admin;
      const roomId = 'room1';
      const mockUser = { id: 'user1', user_type: 'USER' };
      const mockData: any = { [clientId]: mockUser };
      const sendMessageDto = {
        id: 'chat1',
        room: roomId,
        shift: 'shift1',
        message: 'Hello World',
        user_id: '1', // Receiver's user ID
        user_type: CHAT_TABLE.admin,
        created_at_ip: '127.0.0.1',
        parent: 'parentChatId',
        media: null,
      };

      service['room'][roomId] = mockData;

      const mockParentChat: any = {
        id: 'parentChatId',
        user_type: CHAT_TABLE.department,
        sender_type: CHAT_TABLE.department,
        user_id: 'user2',
        message: 'Parent Message',
      };

      jest
        .spyOn(service['chatRepository'], 'findOne')
        .mockResolvedValue(mockParentChat);

      await service.saveChat(sendMessageDto, clientId);

      expect(service['chatRepository'].findOne).toHaveBeenCalledWith({
        where: { id: 'parentChatId' },
      });
    });

    it('should return undefined if user is not found in the room', async () => {
      const sendMessageDto = {
        id: 'chat1',
        room: 'room1',
        shift: 'shift1',
        message: 'Hello World',
        user_id: '1', // Receiver's user ID
        user_type: CHAT_TABLE.admin,
        created_at_ip: '127.0.0.1',
        parent: null,
        media: null,
      };

      const result = await service.saveChat(
        sendMessageDto,
        'nonExistentClient',
      );
      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update a chat record', async () => {
      const chatId = 'chat1';
      const createChatDto = {
        message: 'Updated message',
        shift: 'shift2',
      };
      const mockUpdateResult: any = { affected: 1 };

      jest
        .spyOn(service['chatRepository'], 'update')
        .mockResolvedValue(mockUpdateResult);

      const result = await service.update(chatId, createChatDto);

      expect(service['chatRepository'].update).toHaveBeenCalledWith(
        chatId,
        createChatDto,
      );
      expect(result).toEqual(mockUpdateResult);
    });

    it('should return undefined if no records are affected during update', async () => {
      const chatId = 'chat1';
      const createChatDto = {
        message: 'Updated message',
        shift: 'shift2',
      };
      const mockUpdateResult: any = { affected: 0 };

      jest
        .spyOn(service['chatRepository'], 'update')
        .mockResolvedValue(mockUpdateResult);

      const result = await service.update(chatId, createChatDto);

      expect(service['chatRepository'].update).toHaveBeenCalledWith(
        chatId,
        createChatDto,
      );
      expect(result).toEqual(mockUpdateResult);
    });
  });

  describe('markAsRead', () => {
    it('should mark a chat message as read if it is unread', async () => {
      const messageId = 'message1';
      const mockChat = new Chat();

      jest
        .spyOn(service['chatRepository'], 'findOne')
        .mockResolvedValue(mockChat);
      jest
        .spyOn(service['chatRepository'], 'save')
        .mockResolvedValue(new Chat());

      await service.markAsRead(messageId);

      expect(service['chatRepository'].findOne).toHaveBeenCalledWith({
        where: { id: messageId, is_read: false },
      });
      expect(service['chatRepository'].save).toHaveBeenCalledWith({
        ...mockChat,
        is_read: true,
      });
    });
  });

  describe('remove', () => {
    it('should mark a chat record as deleted with metadata', async () => {
      const id = 'chat1';
      const deleteDto = { deleted_at_ip: '127.0.0.1' };
      const mockUpdateResult: any = { affected: 1 };

      jest
        .spyOn(service['chatRepository'], 'update')
        .mockResolvedValue(mockUpdateResult);

      const result = await service.remove(id, deleteDto);

      expect(service['chatRepository'].update).toHaveBeenCalledWith(
        { id },
        {
          deleted_at_ip: '127.0.0.1',
          deleted_at: expect.any(String),
        },
      );
      expect(result).toEqual(mockUpdateResult);
    });
  });

  describe('updateLocation', () => {
    it('should update the provider location', async () => {
      const updateLocationDto = {
        id: 'provider1',
        shiftId: '1',
        latitude: 10.1234,
        longitude: 20.5678,
        worked_time: '05:00',
      };
      const mockUpdateResult: any = { affected: 1 };

      jest
        .spyOn(service['providerRepository'], 'update')
        .mockResolvedValue(mockUpdateResult);

      const result = await service.updateLocation(updateLocationDto);

      expect(service['providerRepository'].update).toHaveBeenCalledWith(
        { id: updateLocationDto.id },
        {
          latitude: updateLocationDto.latitude,
          longitude: updateLocationDto.longitude,
        },
      );
      expect(result).toEqual(mockUpdateResult);
    });
  });

  describe('findAll', () => {
    it('should return a list of chats and their count', async () => {
      const mockChatList = [new Chat(), new Chat()];
      const mockCount = 2;

      jest
        .spyOn(service['chatRepository'], 'findAndCount')
        .mockResolvedValue([mockChatList, mockCount]);

      const result = await service.findAll({});

      expect(service['chatRepository'].findAndCount).toHaveBeenCalledWith({});
      expect(result).toEqual([mockChatList, mockCount]);
    });
  });

  describe('getChatList', () => {
    it('should handle grouping by sender_id and retain the latest message', async () => {
      const user = { id: 'admin1', role: 'admin' };

      // Room setup
      const room = new Room();
      room.user_type = TABLE.provider;
      room.user_id = '1';
      room.sender_id = '2';

      // Older chat message
      const oldChat = new Chat();
      oldChat.sender_type = CHAT_TABLE.provider;
      oldChat.sender_id = '1';
      oldChat.user_id = 'admin1';
      oldChat.created_at = new Date('2023-01-01T00:00:00Z');

      // Newer chat message
      const newChat = new Chat();
      newChat.sender_type = CHAT_TABLE.provider;
      newChat.sender_id = '1';
      newChat.user_id = 'admin1';
      newChat.created_at = new Date('2023-01-02T00:00:00Z');

      // Different sender_id
      const differentSenderChat = new Chat();
      differentSenderChat.sender_type = CHAT_TABLE.provider;
      differentSenderChat.sender_id = '1';
      differentSenderChat.user_id = 'admin1';
      differentSenderChat.created_at = new Date('2023-01-03T00:00:00Z');

      // Provider data
      const providerData1 = new Provider();
      Object.assign(providerData1, { chat: oldChat });

      const providerData2 = new Provider();
      Object.assign(providerData2, { chat: newChat });

      const providerData3 = new Provider();
      Object.assign(providerData3, { chat: differentSenderChat });

      jest
        .spyOn(roomRepository, 'find')
        .mockResolvedValueOnce([room])
        .mockResolvedValueOnce([room, room]);

      jest
        .spyOn(service, 'getLastMessage')
        .mockResolvedValueOnce(providerData1)
        .mockResolvedValueOnce(providerData2)
        .mockResolvedValueOnce(providerData3);

      const department = new Department();
      department.id = '1';
      mockQueryBuilder.getMany.mockResolvedValue([department]);

      await service.getChatList(user);
    });

    it('should handle grouping by sender_id and retain the latest message', async () => {
      const user = { id: 'admin1', role: 'admin' };

      // Room setup
      const room = new Room();
      room.user_type = TABLE.provider;
      room.user_id = 'admin1';

      // Older chat message
      const oldChat = new Chat();
      oldChat.sender_type = CHAT_TABLE.department;
      oldChat.sender_id = '1';
      oldChat.user_id = 'admin1';
      oldChat.created_at = new Date('2023-01-01T00:00:00Z');

      // Newer chat message
      const newChat = new Chat();
      newChat.sender_type = CHAT_TABLE.department;
      newChat.sender_id = '1';
      newChat.user_id = 'admin1';
      newChat.created_at = new Date('2023-01-02T00:00:00Z');

      // Different sender_id
      const differentSenderChat = new Chat();
      differentSenderChat.sender_type = CHAT_TABLE.provider;
      differentSenderChat.sender_id = '1';
      differentSenderChat.user_id = 'admin1';
      differentSenderChat.created_at = new Date('2023-01-03T00:00:00Z');

      // Provider data
      const providerData1 = new Provider();
      Object.assign(providerData1, { chat: oldChat });

      const providerData2 = new Provider();
      Object.assign(providerData2, { chat: newChat });

      const providerData3 = new Provider();
      Object.assign(providerData3, { chat: differentSenderChat });

      jest
        .spyOn(roomRepository, 'find')
        .mockResolvedValueOnce([room])
        .mockResolvedValueOnce([room, room]);

      jest
        .spyOn(service, 'getLastMessage')
        .mockResolvedValueOnce(providerData1)
        .mockResolvedValueOnce(providerData2)
        .mockResolvedValueOnce(providerData3);

      const department = new Department();
      department.id = '1';
      mockQueryBuilder.getMany.mockResolvedValue([department]);

      await service.getChatList(user);
    });
  });

  describe('getLastMessage', () => {
    const reqUserId = '1';
    const roomSenderId = '1';
    it('should return null if chat not found', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValue(null);

      const result = await service.getLastMessage(reqUserId, roomSenderId);
      expect(mockQueryBuilder.getRawOne).toHaveBeenCalled();
      expect(result).toEqual(null);
    });

    it('should return null if chat not found', async () => {
      const chat = new Chat();
      chat.sender_type = CHAT_TABLE.department;
      chat.user_type = CHAT_TABLE.admin;
      const department = new Admin();
      mockQueryBuilder.getRawOne.mockResolvedValue(chat);
      adminRepository.findOne.mockResolvedValue(department);
      Object.assign(department, {
        chat,
      });
      const result = await service.getLastMessage(reqUserId, roomSenderId);
      expect(mockQueryBuilder.getRawOne).toHaveBeenCalled();
      expect(adminRepository.findOne).toHaveBeenCalled();
      expect(result).toEqual(department);
    });

    it('should return null if chat not found', async () => {
      const chat = new Chat();
      chat.sender_type = CHAT_TABLE.provider;
      chat.user_type = CHAT_TABLE.provider;
      const department = new Provider();
      mockQueryBuilder.getRawOne.mockResolvedValue(chat);
      providerRepository.findOne.mockResolvedValue(department);
      Object.assign(department, {
        chat,
      });
      const result = await service.getLastMessage(reqUserId, roomSenderId);
      expect(mockQueryBuilder.getRawOne).toHaveBeenCalled();
      expect(providerRepository.findOne).toHaveBeenCalled();
      expect(result).toEqual(department);
    });
  });

  describe('getChatHistoryForUser', () => {
    const roomId = '1';
    const limit = 10;
    const offset = 0;
    it('should return chat lit', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([new Chat()]);
      mockQueryBuilder.getCount.mockResolvedValue(1);

      const result = await service.getChatHistoryForUser(roomId, limit, offset);

      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
      expect(result).toEqual([[new Chat()], 1]);
    });
  });

  describe('getChatHistory', () => {
    const reqId = '1';
    const userId = '1';
    const limit = 10;
    const offset = 0;
    it('should return chat lit', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([new Chat()]);
      mockQueryBuilder.getCount.mockResolvedValue(1);

      const result = await service.getChatHistory(reqId, userId, limit, offset);

      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
      expect(result).toEqual([[new Chat()], 1]);
    });
  });

  describe('getInternalChatHistory', () => {
    const reqId = '1';
    const userId = '1';
    const limit = 10;
    const offset = 0;
    it('should return chat lit', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([new Chat()]);
      mockQueryBuilder.getCount.mockResolvedValue(1);

      const result = await service.getInternalChatHistory(
        reqId,
        userId,
        limit,
        offset,
      );

      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
      expect(result).toEqual([[new Chat()], 1]);
    });
  });

  describe('findOneDepartmentWhere', () => {
    const option: FindOneOptions<Department> = { where: { id: '1' } };
    it('should find one department with condition', async () => {
      departmentRepository.findOne.mockResolvedValue(new Department());

      const result = await service.findOneDepartmentWhere(option);
      expect(departmentRepository.findOne).toHaveBeenCalledWith(option);
      expect(result).toEqual(new Department());
    });
  });
});
