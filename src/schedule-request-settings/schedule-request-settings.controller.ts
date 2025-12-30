import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ScheduleRequestSettingsService } from './schedule-request-settings.service';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { UpdateScheduleRequestSettingDto } from './dto/update-schedule-request-setting.dto';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { PERMISSIONS, SECTIONS, SUB_SECTION } from '@/shared/constants/enum';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Section(SECTIONS.staff_app_settings, SUB_SECTION.schedule_and_requests)
@Controller('schedule-request-settings')
export class ScheduleRequestSettingsController {
  constructor(
    private readonly scheduleRequestSettingsService: ScheduleRequestSettingsService,
  ) {}

  @Roles('admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get()
  async findAll() {
    try {
      const list = await this.scheduleRequestSettingsService.findAll({
        order: { order: 'ASC' },
      });

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Schedule request setting'),
        data: list,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.edit)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Patch(':id')
  async update(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() updateScheduleRequestSettingDto: UpdateScheduleRequestSettingDto,
  ) {
    try {
      const data = await this.scheduleRequestSettingsService.findOneWhere({
        where: { id },
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Schedule request setting'),
          data: {},
        });
      }

      const result = await this.scheduleRequestSettingsService.update(
        { id },
        updateScheduleRequestSettingDto,
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Schedule request setting')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Schedule request setting'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
