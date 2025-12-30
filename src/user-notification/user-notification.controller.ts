import { Roles } from '@/shared/decorator/role.decorator';
import { UserNotificationQuery } from '@/shared/dto/query-params.dto';
import { RoleGuard } from '@/shared/guard/role.guard';
import response from '@/shared/response';
import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserNotificationService } from './user-notification.service';
import { IRequest } from '@/shared/constants/types';
import { CONSTANT } from '@/shared/constants/message';
import { IsNull } from 'typeorm';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';

@Controller('user-notification')
export class UserNotificationController {
  constructor(
    private readonly userNotificationService: UserNotificationService,
  ) {}

  @Roles('provider', 'facility_user', 'facility', 'admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch('mark/:id')
  async markAsRead(
    @Param('id', UUIDValidationPipe) id: string,
    @Req() req: IRequest,
  ) {
    try {
      const result = await this.userNotificationService.markAsRead({
        notification: { id },
        is_read: false,
        [req.user.role]: req.user.id,
        deleted_at: IsNull(),
      });

      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.SUCCESSFULLY('Marked as Read')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
        data: {},
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider', 'facility_user', 'facility', 'admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch('mark-all')
  async markAsAllRead(@Req() req: IRequest) {
    try {
      const result = await this.userNotificationService.markAsRead({
        is_read: false,
        [req.user.role]: req.user.id,
        deleted_at: IsNull(),
      });

      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.SUCCESSFULLY('Marked as Read')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
        data: {},
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider', 'facility_user', 'facility', 'admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get()
  async findAll(
    @Query() queryParamsDto: UserNotificationQuery,
    @Req() req: IRequest,
  ) {
    try {
      const [list, count] = await this.userNotificationService.findAll(
        req.user.id,
        req.user.role,
        queryParamsDto,
      );

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Notification')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Notification'),
        total: count,
        limit: +queryParamsDto.limit,
        offset: +queryParamsDto.offset,
        data: count ? list : [],
      };
      return response.successResponseWithPagination(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
