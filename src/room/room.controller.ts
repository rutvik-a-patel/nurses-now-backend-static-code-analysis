import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { IRequest } from '@/shared/constants/types';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Roles('admin', 'facility', 'facility_user', 'provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post()
  async createRoom(@Req() req: IRequest, @Body() createRoomDto: CreateRoomDto) {
    try {
      const data = await this.roomService.isRoomExists(
        req.user.id,
        createRoomDto.sender_id,
      );

      const userData = await this.roomService.getUserData(
        createRoomDto.sender_id,
        createRoomDto.sender_type,
      );

      Object.assign(userData, { user_type: createRoomDto.sender_type });
      if (data) {
        Object.assign(data, { user: userData });
        return response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Room'),
          data: data,
        });
      }

      const room = await this.roomService.create(req.user, createRoomDto);

      Object.assign(room, { user: userData });

      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Room'),
        data: room,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
