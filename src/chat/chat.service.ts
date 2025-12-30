import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, In, Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { Token } from '@/token/entities/token.entity';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Provider } from '@/provider/entities/provider.entity';
import { JoinDto } from './dto/join.dto';
import { CreateChatDto } from './dto/create-chat.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { Media } from '@/media/entities/media.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { plainToInstance } from 'class-transformer';
import { CHAT_TABLE, TABLE } from '@/shared/constants/enum';
import { Facility } from '@/facility/entities/facility.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { Admin } from '@/admin/entities/admin.entity';
import { Department } from '@/department/entities/department.entity';
import { Room } from '@/room/entities/room.entity';
import { UserNotification } from '@/user-notification/entities/user-notification.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { ClockOutDto } from './dto/clock-out.dto';

@Injectable()
export class ChatService {
  private room: Record<
    string,
    Record<string, { id: string; name: string; user_type: TABLE }>
  > = {};
  private clientRooms: Record<string, string[]> = {};

  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    @InjectRepository(Facility)
    private readonly facilityRepository: Repository<Facility>,
    @InjectRepository(FacilityUser)
    private readonly facilityUserRepository: Repository<FacilityUser>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(UserNotification)
    private readonly userNotificationRepository: Repository<UserNotification>,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
  ) {}
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

  async joinRoom(joinDto: JoinDto, clientId: string) {
    const roomId = joinDto.room;
    this.room[roomId] ??= {};
    this.room[roomId][clientId] = joinDto.user;
    this.clientRooms[clientId] ??= [];
    if (!this.clientRooms[clientId].includes(roomId)) {
      this.clientRooms[clientId].push(roomId);
    }
  }

  async leaveRoom(leaveDto: JoinDto, clientId: string) {
    const roomId = leaveDto.room;
    if (this.room[roomId] && this.room[roomId][clientId]) {
      delete this.room[roomId][clientId];
      if (Object.keys(this.room[roomId]).length === 0) {
        delete this.room[roomId];
      }
    }
    this.clientRooms[clientId] = this.clientRooms[clientId]?.filter(
      (id) => id !== roomId,
    );
    if (this.clientRooms[clientId]?.length === 0) {
      delete this.clientRooms[clientId];
    }
  }

  async getUserByRoomIdAndClientId(roomId: string, clientId: string) {
    return this.room[roomId]?.[clientId];
  }

  async saveChat(sendMessage: SendMessageDto, clientId: string) {
    const user = this.room[sendMessage.room]?.[clientId];
    if (user) {
      const chat = {
        sender_id: user.id,
        sender_type: user.user_type,
        user_id: sendMessage.user_id, // Receiver's user ID
        user_type: sendMessage.user_type,
        message: sendMessage.message,
        task: sendMessage.shift,
        created_at_ip: sendMessage.created_at_ip,
        parent: sendMessage.parent,
      };
      if (
        sendMessage.media &&
        sendMessage.media.image &&
        sendMessage.media.image.length
      ) {
        const media = await this.mediaRepository.save({
          base_url: process.env.AWS_ASSETS_PATH,
          image: sendMessage.media.image,
        });
        Object.assign(chat, { media });
      }
      await this.chatRepository.save(plainToInstance(Chat, chat));
      let parent;
      if (sendMessage.parent) {
        const parentData = await this.chatRepository.findOne({
          where: { id: sendMessage.parent },
        });

        if (!parentData) {
          return [chat, parentData];
        }
        const queryBuilder = this.chatRepository
          .createQueryBuilder('c')
          .leftJoin('c.media', 'm') // Joining media
          .leftJoin(
            `${CHAT_TABLE[parentData.user_type]}`, // Dynamic join for receiver's table
            'receiver',
            'receiver.id = c.user_id',
          )
          .leftJoin(
            `${CHAT_TABLE[parentData.sender_type]}`, // Dynamic join for sender's table
            'sender',
            'sender.id = c.sender_id',
          );

        // Define the dynamic fields for both sender and receiver
        const selectFields = [
          'c.id AS id',
          'c.message AS message',
          'c.created_at AS created_at',
          'c.updated_at AS updated_at',
          'm.id AS media_id',
          'm.base_url AS media_base_url',
          'm.image AS media_image',

          // Receiver fields (handling "department" type specifically)
          'receiver.id AS receiver_id',
          parentData.user_type === CHAT_TABLE.department
            ? 'receiver.name AS receiver_name'
            : "receiver.first_name || ' ' || receiver.last_name AS receiver_name",
          'receiver.base_url AS receiver_base_url',
          parentData.user_type === CHAT_TABLE.provider
            ? 'receiver.profile_image AS receiver_image'
            : 'receiver.image AS receiver_image',

          // Sender fields (handling "department" type specifically)
          'sender.id AS sender_id',
          parentData.sender_type === CHAT_TABLE.department
            ? 'sender.name AS sender_name'
            : "sender.first_name || ' ' || sender.last_name AS sender_name",
          'sender.base_url AS sender_base_url',
          parentData.sender_type === CHAT_TABLE.provider
            ? 'sender.profile_image AS sender_image'
            : 'sender.image AS sender_image',
        ];

        // Add reply data dynamically
        const reply = `
            jsonb_build_object(
              'id', receiver.id,
              'name', ${
                parentData.user_type === CHAT_TABLE.department
                  ? 'receiver.name'
                  : `receiver.first_name || ' ' || receiver.last_name`
              },
              'base_url', receiver.base_url,
              'image', ${
                parentData.user_type === CHAT_TABLE.provider
                  ? 'receiver.profile_image'
                  : 'receiver.image'
              }
            ) AS receiver_details,
            jsonb_build_object(
              'id', sender.id,
              'name', ${
                parentData.sender_type === CHAT_TABLE.department
                  ? 'sender.name'
                  : `sender.first_name || ' ' || sender.last_name`
              },
              'base_url', sender.base_url,
              'image', ${
                parentData.sender_type === CHAT_TABLE.provider
                  ? 'sender.profile_image'
                  : 'sender.image'
              }
            ) AS sender_details
          `;

        selectFields.push(reply);

        // Apply the select fields
        queryBuilder.select(selectFields);

        // Add the condition for parent ID
        queryBuilder.where('c.id = :parentId', {
          parentId: sendMessage.parent,
        });

        // Execute the query
        parent = await queryBuilder.getRawOne();
      }
      return [chat, parent, user];
    }
  }

  async update(id: string, createChatDto: CreateChatDto) {
    const record = await this.chatRepository.update(id, createChatDto);
    return record;
  }

  async markMessagesAsRead(reqUserId: string, userId: string) {
    const result = await this.chatRepository
      .createQueryBuilder()
      .update(Chat)
      .set({ is_read: true })
      .where(
        `(user_id = :reqUserId AND sender_id = :userId) OR 
         (sender_id = :reqUserId AND user_id = :userId)`,
        { reqUserId, userId },
      )
      .execute();
    return result;
  }

  async markAsRead(messageId: string) {
    const chat = await this.chatRepository.findOne({
      where: { id: messageId, is_read: false },
    });
    chat.is_read = true;
    return await this.chatRepository.save(chat);
  }

  async remove(id: string, deleteDto: DeleteDto) {
    const record = await this.chatRepository.update(
      { id },
      {
        deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: new Date().toISOString(),
      },
    );
    return record;
  }

  async updateLocation(updateLocationDto: UpdateLocationDto) {
    const result = await this.providerRepository.update(
      { id: updateLocationDto.id },
      {
        latitude: updateLocationDto.latitude,
        longitude: updateLocationDto.longitude,
      },
    );
    return result;
  }

  async findAll(where: FindManyOptions<Chat>): Promise<[Chat[], number]> {
    const [list, count] = await this.chatRepository.findAndCount(where);
    return [plainToInstance(Chat, list), count];
  }

  async getChatList(user: any) {
    const chatList = {
      provider: [],
      facility: [],
      facility_user: [],
      admin: [],
    };

    const adminRooms = await this.roomRepository.find({
      where: [
        { user_id: user.id, sender_type: user.role },
        { sender_id: user.id, user_type: user.role },
      ],
    });

    // Process Admin Rooms
    for (const room of adminRooms) {
      const sender = room.user_id === user.id ? room.sender_id : room.user_id;
      const chat = await this.getLastMessage(
        room.user_id,
        room.sender_id,
        sender,
        [user.id],
      );

      if (chat) {
        Object.assign(chat, { room: room.id });
        chatList.admin.push(chat);
      }
    }

    // Fetch departments where the user is a member
    const departments = await this.departmentRepository
      .createQueryBuilder('d')
      .where(`members @> :user_id`, {
        user_id: [user.id],
      })
      .getMany();

    const departmentIds = departments.map((department) => department.id);

    const roomData = await this.roomRepository.find({
      where: {
        sender_id: In(departmentIds),
        sender_type: CHAT_TABLE.department,
      },
    });

    // Process departments for other types
    for (const department of roomData) {
      const lastMessage = await this.getLastMessage(
        department.user_id,
        department.sender_id,
        null,
        departmentIds,
      );

      if (lastMessage) {
        Object.assign(lastMessage, { room: department.id });
        chatList[department.user_type].push(lastMessage);
      }
    }
    Object.keys(chatList).forEach((userType) => {
      const messages = chatList[userType];

      // Group by sender_id and retain the latest message for each
      if (userType !== CHAT_TABLE.admin) {
        const uniqueMessages = Object.values(
          messages.reduce((acc, message) => {
            const senderId =
              message.chat.sender_type === CHAT_TABLE.department
                ? message.chat.user_id
                : message.chat.sender_id;

            if (
              !acc[senderId] ||
              new Date(message.chat.created_at) >
                new Date(acc[senderId].chat.created_at)
            ) {
              acc[senderId] = message;
            }

            return acc;
          }, {}),
        );
        chatList[userType] = uniqueMessages;
      }
    });

    return chatList;
  }

  async getLastMessage(
    reqUserId: string,
    roomSenderId: string,
    sender?: string | null,
    reqIds?: string[],
  ) {
    const lastMessage = await this.chatRepository
      .createQueryBuilder('c')
      .leftJoin('c.media', 'm') // Join user table dynamically
      .select([
        'c.id AS id',
        'c.message AS message',
        'c.created_at AS created_at',
        'c.user_id AS user_id',
        'c.user_type AS user_type',
        'c.sender_id AS sender_id',
        'c.sender_type AS sender_type',
        `json_agg(json_build_object('id', m.id, 'base_url', m.base_url, 'image', m.image)) AS media`,
        `(SELECT COUNT(*)::INTEGER 
          FROM chat 
          WHERE 
            is_read = false 
            AND sender_id NOT IN (:...reqIds)  
            AND 
            (
              (user_id = :reqUserId AND sender_id = :roomSenderId) OR 
              (sender_id = :reqUserId AND user_id = :roomSenderId)
            )
          ) AS total_unread`,
      ])
      .where(
        `(c.user_id = :reqUserId AND c.sender_id = :roomSenderId) OR 
         (c.sender_id = :reqUserId AND c.user_id = :roomSenderId)`,
        { reqUserId, roomSenderId, reqIds },
      )
      .orderBy('c.created_at', 'DESC')
      .groupBy('c.id')
      .getRawOne();

    if (!lastMessage) {
      return null;
    }

    const repositoryMap = {
      provider: this.providerRepository,
      facility: this.facilityRepository,
      facility_user: this.facilityUserRepository,
      admin: this.adminRepository,
      department: this.departmentRepository,
    };

    const selectFieldsMap = {
      provider: {
        id: true,
        first_name: true,
        last_name: true,
        base_url: true,
        profile_image: true,
        created_at: true,
      },
      facility: {
        id: true,
        name: true,
        base_url: true,
        image: true,
        created_at: true,
      },
      facility_user: {
        id: true,
        first_name: true,
        last_name: true,
        base_url: true,
        image: true,
        created_at: true,
      },
      admin: {
        id: true,
        first_name: true,
        last_name: true,
        base_url: true,
        country_code: true,
        mobile_no: true,
        email: true,
        role: {
          id: true,
          name: true,
        },
        image: true,
        created_at: true,
      },
      department: {
        id: true,
        name: true,
        base_url: true,
        image: true,
        created_at: true,
      },
    };

    const userType =
      lastMessage.sender_type === CHAT_TABLE.department
        ? lastMessage.user_type
        : lastMessage.sender_type;

    let userId =
      lastMessage.sender_type === CHAT_TABLE.department
        ? lastMessage.user_id
        : lastMessage.sender_id;

    userId = sender ?? userId;
    const repository = repositoryMap[userType];
    const selectFields = selectFieldsMap[userType];

    const relation = {
      relation: userType === CHAT_TABLE.admin ? { role: true } : {},
    };
    const result = await repository.findOne({
      where: { id: userId },
      select: selectFields,
      ...relation,
    });

    Object.assign(result, {
      chat: lastMessage,
    });

    return result;
  }

  async getChatHistoryForUser(
    roomId: string | undefined,
    limit: number,
    offset: number,
  ): Promise<[Chat[], number]> {
    const queryBuilder = this.chatRepository
      .createQueryBuilder('c')
      .leftJoin('c.media', 'm')
      .leftJoin('c.parent', 'p')
      .leftJoin('c.team', 't')
      .leftJoin('t.team_member', 'tm')
      .leftJoin(
        'provider',
        'created_by_provider',
        'c.user_id = created_by_provider.id AND c.user_type = :providerType',
        { providerType: TABLE.provider },
      )
      .leftJoin(
        'facility',
        'created_by_facility',
        'c.user_id = created_by_facility.id AND c.user_type = :facilityType',
        { facilityType: TABLE.facility },
      )
      .leftJoin(
        'facility_user',
        'created_by_facility_user',
        'c.user_id = created_by_facility_user.id AND c.user_type = :facilityUserType',
        { facilityUserType: TABLE.facility_user },
      )
      .leftJoin(
        'provider',
        'reply_by_provider',
        'p.user_id = reply_by_provider.id AND p.user_type = :replyProviderType',
        { replyProviderType: TABLE.provider },
      )
      .leftJoin(
        'facility',
        'reply_by_facility',
        'p.user_id = reply_by_facility.id AND p.user_type = :replyFacilityType',
        { replyFacilityType: TABLE.facility },
      )
      .leftJoin(
        'facility_user',
        'reply_by_facility_user',
        'p.user_id = reply_by_facility_user.id AND p.user_type = :replyFacilityUserType',
        { replyFacilityUserType: TABLE.facility_user },
      )
      .select([
        'c.id AS id',
        'c.message AS message',
        'c.is_read AS is_read',
        'c.is_edit AS is_edit',
        'c.created_at AS created_at',
        `CASE
          WHEN c.media_id IS NULL THEN null
          ELSE
            json_agg(json_build_object('id', m.id, 'base_url', m.base_url, 'image', m.image))
          END AS media`,
        `CASE
          WHEN c.user_type = 'admin' THEN jsonb_build_object('id', t.id, 'name', t.team_name, 'image', t.image, 'base_url', t.base_url)
          WHEN c.user_type = 'provider' THEN jsonb_build_object('id', created_by_provider.id, 'name', created_by_provider.first_name || ' ' || created_by_provider.last_name, 'image', created_by_provider.profile_image, 'base_url', created_by_provider.base_url)
          WHEN c.user_type = 'facility' THEN jsonb_build_object('id', created_by_facility.id, 'name', created_by_facility.name, 'image', created_by_facility.image, 'base_url', created_by_facility.base_url)
          WHEN c.user_type = 'facility_user' THEN jsonb_build_object('id', created_by_facility_user.id, 'name', created_by_facility_user.first_name, 'image', created_by_facility_user.image, 'base_url', created_by_facility_user.base_url)
          ELSE NULL
        END AS user`,
        `CASE
          WHEN c.parent_id IS NULL THEN null
          ELSE
          json_build_object('id', p.id, 'message', p.message, 'created_at', p.created_at, 'parent_msg',
          CASE
            WHEN p.user_type = 'admin' THEN jsonb_build_object('id', t.id, 'name', t.team_name, 'image', t.image, 'base_url', t.base_url)
            WHEN p.user_type = 'provider' THEN jsonb_build_object('id', reply_by_provider.id, 'name', reply_by_provider.first_name || ' ' || reply_by_provider.last_name, 'image', reply_by_provider.profile_image, 'base_url', reply_by_provider.base_url)
            WHEN p.user_type = 'facility' THEN jsonb_build_object('id', reply_by_facility.id, 'name', reply_by_facility.name, 'image', reply_by_facility.image, 'base_url', reply_by_facility.base_url)
            WHEN p.user_type = 'facility_user' THEN jsonb_build_object('id', reply_by_facility_user.id, 'name', reply_by_facility_user.first_name, 'image', reply_by_facility_user.image, 'base_url', reply_by_facility_user.base_url)
            ELSE NULL
          END)
        END AS parent`,
      ])
      .andWhere('c.team_id = :team_id', { team_id: roomId })
      .groupBy(
        'c.id, t.id, created_by_provider.id, created_by_facility.id, created_by_facility_user.id, p.id, reply_by_provider.id, reply_by_facility.id, reply_by_facility_user.id',
      )
      .limit(limit)
      .offset(offset)
      .orderBy('c.created_at', 'DESC');

    const chatHistory = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();
    return [chatHistory, count];
  }

  async getChatHistory(
    reqId: string,
    userId: string,
    limit: number,
    offset: number,
  ): Promise<[Chat[], number]> {
    const departments = await this.departmentRepository
      .createQueryBuilder('d')
      .where(`members @> :user_id`, {
        user_id: [reqId],
      })
      .getMany();
    const departmentIds = departments.map((department) => department.id);

    const queryBuilder = this.chatRepository
      .createQueryBuilder('c')
      .leftJoin('c.media', 'm')
      .leftJoin('c.parent', 'p')
      .leftJoin(
        'provider',
        'created_by_provider',
        'c.sender_id = created_by_provider.id AND c.sender_type = :providerType',
        { providerType: 'provider' },
      )
      .leftJoin(
        'facility',
        'created_by_facility',
        'c.sender_id = created_by_facility.id AND c.sender_type = :facilityType',
        { facilityType: 'facility' },
      )
      .leftJoin(
        'facility_user',
        'created_by_facility_user',
        'c.sender_id = created_by_facility_user.id AND c.sender_type = :facilityUserType',
        { facilityUserType: 'facility_user' },
      )
      .leftJoin(
        'admin',
        'created_by_admin',
        'c.sender_id = created_by_admin.id AND c.sender_type = :adminType',
        { adminType: 'admin' },
      )
      .leftJoin(
        'department',
        'created_by_department',
        'c.sender_id = created_by_department.id AND c.sender_type = :departmentType',
        { departmentType: 'department' },
      )
      .leftJoin(
        'provider',
        'parent_by_provider',
        'p.sender_id = parent_by_provider.id AND p.sender_type = :parentProviderType',
        { parentProviderType: 'provider' },
      )
      .leftJoin(
        'facility',
        'parent_by_facility',
        'p.sender_id = parent_by_facility.id AND p.sender_type = :parentFacilityType',
        { parentFacilityType: 'facility' },
      )
      .leftJoin(
        'facility_user',
        'parent_by_facility_user',
        'p.sender_id = parent_by_facility_user.id AND p.sender_type = :parentFacilityUserType',
        { parentFacilityUserType: 'facility_user' },
      )
      .leftJoin(
        'admin',
        'parent_by_admin',
        'p.sender_id = parent_by_admin.id AND p.sender_type = :parentAdminType',
        { parentAdminType: 'admin' },
      )
      .leftJoin(
        'department',
        'parent_by_department',
        'p.sender_id = parent_by_department.id AND p.sender_type = :parentDepartmentType',
        { parentDepartmentType: 'department' },
      )
      .select([
        'c.id AS id',
        'c.message AS message',
        'c.created_at AS created_at',
        'c.user_id AS user_id',
        'c.user_type AS user_type',
        'c.sender_id AS sender_id',
        'c.sender_type AS sender_type',
        `json_agg(json_build_object('id', m.id, 'base_url', m.base_url, 'image', m.image)) AS media`,
        `CASE
          WHEN c.sender_type = 'provider' THEN jsonb_build_object('id', created_by_provider.id, 'name', created_by_provider.first_name || ' ' || created_by_provider.last_name, 'image', created_by_provider.profile_image, 'base_url', created_by_provider.base_url)
          WHEN c.sender_type = 'facility' THEN jsonb_build_object('id', created_by_facility.id, 'name', created_by_facility.name, 'image', created_by_facility.image, 'base_url', created_by_facility.base_url)
          WHEN c.sender_type = 'facility_user' THEN jsonb_build_object('id', created_by_facility_user.id, 'name', created_by_facility_user.first_name || ' ' || created_by_facility_user.last_name, 'image', created_by_facility_user.image, 'base_url', created_by_facility_user.base_url)
          WHEN c.sender_type = 'admin' THEN jsonb_build_object('id', created_by_admin.id, 'name', created_by_admin.first_name || ' ' || created_by_admin.last_name, 'image', created_by_admin.image, 'base_url', created_by_admin.base_url)
          WHEN c.sender_type = 'department' THEN jsonb_build_object('id', created_by_department.id, 'name', created_by_department.name, 'image', created_by_department.image, 'base_url', created_by_department.base_url)
          ELSE NULL
        END AS user`,
        `CASE
          WHEN c.parent_id IS NULL THEN null
          ELSE json_build_object(
            'id', p.id,
            'message', p.message,
            'created_at', p.created_at,
            'user', CASE
              WHEN p.sender_type = 'provider' THEN jsonb_build_object('id', parent_by_provider.id, 'name', parent_by_provider.first_name || ' ' || parent_by_provider.last_name, 'image', parent_by_provider.profile_image, 'base_url', parent_by_provider.base_url)
              WHEN p.sender_type = 'facility' THEN jsonb_build_object('id', parent_by_facility.id, 'name', parent_by_facility.name, 'image', parent_by_facility.image, 'base_url', parent_by_facility.base_url)
              WHEN p.sender_type = 'facility_user' THEN jsonb_build_object('id', parent_by_facility_user.id, 'name', parent_by_facility_user.first_name || ' ' || parent_by_facility_user.last_name, 'image', parent_by_facility_user.image, 'base_url', parent_by_facility_user.base_url)
              WHEN p.sender_type = 'admin' THEN jsonb_build_object('id', parent_by_admin.id, 'name', parent_by_admin.first_name || ' ' || parent_by_admin.last_name, 'image', parent_by_admin.image, 'base_url', parent_by_admin.base_url)
              WHEN p.sender_type = 'department' THEN jsonb_build_object('id', parent_by_department.id, 'name', parent_by_department.name, 'image', parent_by_department.image, 'base_url', parent_by_department.base_url)
              ELSE NULL
            END
          )
        END AS parent`,
      ])
      .where(
        `(c.user_id = :userId AND c.sender_id IN (:...departmentIds)) OR 
          (c.sender_id = :userId AND c.user_id IN (:...departmentIds))`,
        { userId, departmentIds },
      )
      .groupBy(
        'c.id, p.id, created_by_provider.id, created_by_facility.id, created_by_facility_user.id, created_by_admin.id, created_by_department.id, parent_by_provider.id, parent_by_facility.id, parent_by_facility_user.id, parent_by_admin.id, parent_by_department.id',
      )
      .orderBy('c.created_at', 'DESC')
      .limit(limit)
      .offset(offset);

    const chatHistory = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();
    return [chatHistory, count];
  }

  async getInternalChatHistory(
    reqId: string,
    userId: string,
    limit: number,
    offset: number,
  ): Promise<[Chat[], number]> {
    const queryBuilder = this.chatRepository
      .createQueryBuilder('c')
      .leftJoin('c.media', 'm')
      .leftJoin('c.parent', 'p')
      .leftJoin(
        'admin',
        'created_by_admin',
        'c.sender_id = created_by_admin.id AND c.sender_type = :adminType',
        { adminType: TABLE.admin },
      )
      .leftJoin(
        'admin',
        'reply_by_admin',
        'p.sender_id = reply_by_admin.id AND p.sender_type = :replyAdminType',
        { replyAdminType: TABLE.admin },
      )
      .select([
        'c.id AS id',
        'c.message AS message',
        'c.is_read AS is_read',
        'c.is_edit AS is_edit',
        'c.created_at AS created_at',
        `CASE
          WHEN c.media_id IS NULL THEN null
          ELSE
            json_agg(json_build_object('id', m.id, 'base_url', m.base_url, 'image', m.image))
          END AS media`,
        `CASE
          WHEN c.sender_type = 'admin' THEN jsonb_build_object('id', created_by_admin.id, 'name', created_by_admin.first_name || ' ' || created_by_admin.last_name, 'image', created_by_admin.image, 'base_url', created_by_admin.base_url)
          ELSE NULL
        END AS user`,
        `CASE
          WHEN c.parent_id IS NULL THEN null
          ELSE
          json_build_object('id', p.id, 'message', p.message, 'created_at', p.created_at, 'parent_msg',
          CASE
            WHEN p.sender_type = 'admin' THEN jsonb_build_object('id', reply_by_admin.id, 'name', reply_by_admin.first_name || ' ' || reply_by_admin.last_name, 'image', reply_by_admin.image, 'base_url', reply_by_admin.base_url)
            ELSE NULL
          END)
          END AS parent`,
      ])
      .where(
        `(c.user_id = :userId AND c.sender_id = :reqId) OR 
         (c.sender_id = :userId AND c.user_id = :reqId)`,
        { userId, reqId },
      )
      .groupBy('c.id, created_by_admin.id, p.id, reply_by_admin.id')
      .limit(limit)
      .offset(offset)
      .orderBy('c.created_at', 'DESC');

    const chatHistory = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();
    return [chatHistory, count];
  }

  async findOneDepartmentWhere(option: FindOneOptions<Department>) {
    const result = await this.departmentRepository.findOne(option);
    return plainToInstance(Department, result);
  }

  async getUnreadNotificationCount(
    option: FindOneOptions<UserNotification>,
  ): Promise<number> {
    const result = await this.userNotificationRepository.count(option);
    return result;
  }

  async getOngoingShift(payload: any) {
    if (!payload?.id || !payload?.shiftId) return null;

    const shift = await this.shiftRepository.findOne({
      where: { provider: { id: payload.id }, shift_id: payload.shiftId },
    });

    if (!shift) return null;

    const onBreak =
      !shift.break_start_time && !shift.break_end_time ? false : true;

    const breakDuration = onBreak
      ? this.durationToSeconds(payload.breakTimeDuration)
      : shift.break_duration;

    return {
      clock_in: shift.clock_in,
      clock_out_time: shift.clock_out,
      clock_out_status: shift.clock_out ? 'completed' : 'pending',
      break_time: breakDuration,
      break_start_date: shift.break_start_date,
      break_start_time: shift.break_start_time,
      isOnBreak: onBreak,
    };
  }

  private durationToSeconds(duration: string): number {
    const [hours, minutes, seconds] = duration.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  }

  async getShiftData(clockOutDto: ClockOutDto) {
    const shift = await this.shiftRepository.findOne({
      relations: { provider: true },
      where: { id: clockOutDto.shift_id },
    });

    if (!shift) return null;

    const onBreak =
      !shift.break_start_time && !shift.break_end_time ? false : true;

    return {
      shift_id: shift.id,
      latitude: shift.provider.latitude,
      longitude: shift.provider.longitude,
      clock_in: shift.clock_in,
      provider_id: shift.provider.id,
      clock_out_status: shift.status,
      clock_out_time: shift.clock_out,
      worked_time: shift.total_worked,
      break_time: shift.break_duration,
      break_start_date: shift.break_start_date,
      break_start_time: shift.break_start_time,
      isOnBreak: onBreak,
    };
  }
}
