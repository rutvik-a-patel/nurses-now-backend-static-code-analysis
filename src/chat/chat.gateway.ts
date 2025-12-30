import { CONSTANT } from '@/shared/constants/message';
import logger from '@/shared/helpers/logger';
import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import { TypingDto } from './dto/typing.dto';
import { JoinDto } from './dto/join.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { DeleteChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import * as moment from 'moment';
import { ReadMessageDto } from './dto/read-message.dto';
import { CHAT_TABLE } from '@/shared/constants/enum';
import { UnreadNotificationDto } from './dto/unread-notification.dto';
import { ClockOutDto } from './dto/clock-out.dto';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.authorization as string;
      const valid = await this.chatService.validateToken(token);
      if (!valid) {
        throw new Error(CONSTANT.ERROR.RECORD_NOT_FOUND('User'));
      }
    } catch (error) {
      this.handleError(client, error, CONSTANT.ERROR.UNAUTHENTICATED);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.chatService.handleDisconnect(client.id);
  }

  handleError(client: Socket, error: any, message: string) {
    logger.error(
      `${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })} - CHAT - ${error.message}`,
    );
    client.emit('error', message);
  }

  @SubscribeMessage('location')
  async handleLocationUpdate(@MessageBody() payload: UpdateLocationDto) {
    await this.chatService.updateLocation(payload);
    const data = await this.chatService.getOngoingShift(payload);

    payload = { ...payload, ...data };
    this.server.emit(`provider-tracking/${payload.id}`, payload);
  }

  @SubscribeMessage('provider-tracking')
  async providerTracking(@MessageBody() clockOutDto: ClockOutDto) {
    const data = await this.chatService.getShiftData(clockOutDto);

    this.server.emit(`provider-tracking/${data.provider_id}`, data);
  }

  @SubscribeMessage('join')
  async joinRoom(
    @MessageBody() joinDto: JoinDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Store user data in Object
      const user = await this.chatService.joinRoom(joinDto, client.id);

      // Join Room
      client.join(joinDto.room);
      client.broadcast.to(joinDto.room).emit('join', user);
    } catch (error) {
      this.handleError(client, error, CONSTANT.ERROR.JOIN_ROOM);
    }
  }

  @SubscribeMessage('typing')
  async typing(
    @MessageBody() typingDto: TypingDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user = await this.chatService.getUserByRoomIdAndClientId(
        typingDto.room,
        client.id,
      );
      client.broadcast
        .to(typingDto.room)
        .emit('typing', { user, is_typing: typingDto.is_typing });
    } catch (error) {
      this.handleError(client, error, CONSTANT.ERROR.TYPING);
    }
  }

  @SubscribeMessage('leave')
  async leaveRoom(
    @MessageBody() leaveDto: JoinDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Remove user data in Object
      const user = await this.chatService.leaveRoom(leaveDto, client.id);

      // Leave Room
      client.leave(leaveDto.room);
      client.broadcast.to(leaveDto.room).emit('leave', user);
    } catch (error) {
      this.handleError(client, error, CONSTANT.ERROR.LEAVE_ROOM);
    }
  }

  @SubscribeMessage('send')
  async sendMessageInRoom(
    @MessageBody() sendMessage: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      sendMessage.created_at_ip = client.handshake.address;

      // Store message in database and get user.
      const [chat, parent, user] = await this.chatService.saveChat(
        sendMessage,
        client.id,
      );

      // Broadcast the message to the room
      client.broadcast.to(sendMessage.room).emit('send', {
        id: chat.id,
        user: user.id,
        user_type: user.user_type,
        message: sendMessage.message,
        media: {
          base_url: process.env.AWS_ASSETS_PATH,
          image: sendMessage?.media?.image?.length
            ? sendMessage.media.image
            : null,
        },
        time: moment().format('hh:mm A'),
        parent,
      });

      // Prepare an array of member updates to minimize redundancy
      const membersToUpdate = new Set<string>();

      if (sendMessage.user_type === CHAT_TABLE.department) {
        const department = await this.chatService.findOneDepartmentWhere({
          where: { id: sendMessage.user_id },
          select: { members: true },
        });

        for (const member of department.members) {
          membersToUpdate.add(member);
        }
      }

      if (user.user_type === CHAT_TABLE.department) {
        const department = await this.chatService.findOneDepartmentWhere({
          where: { id: user.id },
          select: { members: true },
        });

        for (const member of department.members) {
          membersToUpdate.add(member);
        }
      }

      if (sendMessage.user_type === CHAT_TABLE.admin) {
        membersToUpdate.add(sendMessage.user_id);
      }

      if (user.user_type === CHAT_TABLE.admin) {
        membersToUpdate.add(user.id);
      }

      // Check if there are members to update before proceeding
      if (membersToUpdate.size > 0) {
        for (const memberId of membersToUpdate) {
          await this.updateChatList(memberId, CHAT_TABLE.admin);
        }
      }
    } catch (error) {
      this.handleError(client, error, CONSTANT.ERROR.SENDING_MESSAGE);
    }
  }

  @SubscribeMessage('update')
  async update(
    @MessageBody() updateChatDto: UpdateChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.chatService.update(updateChatDto.id, {
        message: updateChatDto.message,
        is_edit: true,
        updated_at_ip: client.handshake.address,
      });
      client.broadcast.to(updateChatDto.room).emit('update', {
        id: updateChatDto.id,
        message: updateChatDto.message,
      });
    } catch (error) {
      this.handleError(client, error, CONSTANT.ERROR.SOMETHING_WENT_WRONG);
    }
  }

  @SubscribeMessage('delete')
  async delete(
    @MessageBody() deleteChatDto: DeleteChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.chatService.remove(deleteChatDto.id, {
        deleted_at_ip: client.handshake.address,
      });
      client.broadcast
        .to(deleteChatDto.room)
        .emit('delete', { room: deleteChatDto.room, id: deleteChatDto.id });
    } catch (error) {
      this.handleError(client, error, CONSTANT.ERROR.SOMETHING_WENT_WRONG);
    }
  }

  @SubscribeMessage('messageRead')
  async handleReadMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() readMessageDto: ReadMessageDto,
  ): Promise<void> {
    try {
      await this.chatService.markAsRead(readMessageDto.message_id);
      client.broadcast.to(readMessageDto.room).emit('messageRead', {
        message_id: readMessageDto.message_id,
        is_read: readMessageDto.is_read,
      });
    } catch (error) {
      this.handleError(client, error, CONSTANT.ERROR.SOMETHING_WENT_WRONG);
    }
  }

  @SubscribeMessage('unread-notification')
  async getUnreadNotificationCount(
    @ConnectedSocket() client: Socket,
    @MessageBody() unreadNotificationDto: UnreadNotificationDto,
  ) {
    try {
      const count = await this.chatService.getUnreadNotificationCount({
        where: [
          { facility_user: { id: unreadNotificationDto.id }, is_read: false },
          { facility: { id: unreadNotificationDto.id }, is_read: false },
          { admin: { id: unreadNotificationDto.id }, is_read: false },
        ],
      });

      client.emit(`unread-notification-count`, {
        id: unreadNotificationDto.id,
        unread_count: count,
      });
    } catch (error) {
      this.handleError(client, error, CONSTANT.ERROR.SOMETHING_WENT_WRONG);
    }
  }

  @SubscribeMessage('clock-out')
  async clockOut(
    @ConnectedSocket() client: Socket,
    @MessageBody() clockOutDto: ClockOutDto,
  ) {
    try {
      const data = await this.chatService.getShiftData(clockOutDto);
      this.server.emit(`clock-out`, data);
    } catch (error) {
      this.handleError(client, error, CONSTANT.ERROR.SOMETHING_WENT_WRONG);
    }
  }

  async updateChatList(userId: string, userType: string) {
    const chatList = await this.chatService.getChatList({
      id: userId,
      user_type: userType,
    });

    this.server.emit(`chat-list/${userId}`, {
      data: chatList,
    });
  }

  async emitUnreadNotificationCount(userId: string) {
    const count = await this.chatService.getUnreadNotificationCount({
      where: [
        { facility_user: { id: userId }, is_read: false },
        { facility: { id: userId }, is_read: false },
      ],
    });

    this.server.emit('unread-notification', {
      id: userId,
      unread_count: count,
    });
  }
}
