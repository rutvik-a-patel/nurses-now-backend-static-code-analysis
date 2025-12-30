import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { defaultLimit, defaultOffset } from '@/shared/constants/constant';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { IRequest } from '@/shared/constants/types';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Roles('admin', 'facility', 'facility_user', 'provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('list')
  async getChatList(@Req() req: IRequest) {
    try {
      const chatList = await this.chatService.getChatList(req.user);

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Chat List'),
        data: chatList ? chatList : {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('facility', 'facility_user', 'provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('history')
  async getChatHistoryForUser(
    @Query('room_id') roomId: string,
    @Query('limit') limit: string = defaultLimit,
    @Query('offset') offset: string = defaultOffset,
  ) {
    try {
      const [chatHistory, count] = await this.chatService.getChatHistoryForUser(
        roomId,
        +limit,
        +offset,
      );

      return response.successResponseWithPagination({
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Chat')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Chat'),
        total: count,
        limit: +limit,
        offset: +offset,
        data: chatHistory,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('internal')
  async getInternalChatHistory(
    @Req() req: IRequest,
    @Query('user_id') userId: string,
    @Query('limit') limit: string = defaultLimit,
    @Query('offset') offset: string = defaultOffset,
  ) {
    try {
      const [list, count] = await this.chatService.getInternalChatHistory(
        req.user.id,
        userId,
        +limit,
        +offset,
      );

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Chat')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Chat'),
        total: count,
        limit: +limit,
        offset: +offset,
        data: list,
      };
      return response.successResponseWithPagination(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('admin')
  async getChatHistory(
    @Req() req: IRequest,
    @Query('user_id') userId: string,
    @Query('limit') limit: string = defaultLimit,
    @Query('offset') offset: string = defaultOffset,
  ) {
    try {
      const [chatHistory, count] = await this.chatService.getChatHistory(
        req.user.id,
        userId,
        +limit,
        +offset,
      );
      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Chat')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Chat'),
        total: count,
        limit: +limit,
        offset: +offset,
        data: chatHistory,
      };
      return response.successResponseWithPagination(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch('mark-read/:id')
  async markAsRead(
    @Req() req: IRequest,
    @Param('id', UUIDValidationPipe) id: string,
  ) {
    try {
      await this.chatService.markMessagesAsRead(req.user.id, id);

      return response.successResponse({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Mark as Read'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
