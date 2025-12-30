import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { Roles } from '@/shared/decorator/role.decorator';
import { RoleGuard } from '@/shared/guard/role.guard';
import { AuthGuard } from '@nestjs/passport';
import { ActivityQuery } from './dto/activity-query.dto';
import { transformAndGroupActivities } from '@/shared/helpers/transform-activity';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Roles('facility', 'facility_user', 'admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get()
  async findAllWithFilters(@Query() queryParamsDto: ActivityQuery) {
    try {
      const [result, count] =
        await this.activityService.findAllWithFilters(queryParamsDto);
      const data = transformAndGroupActivities(result);
      return response.successResponseWithPagination({
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Activity')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Activity'),
        total: count,
        limit: +queryParamsDto.limit,
        offset: +queryParamsDto.offset,
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
