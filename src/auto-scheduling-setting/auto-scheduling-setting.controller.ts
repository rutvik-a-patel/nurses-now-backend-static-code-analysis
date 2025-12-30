import { Controller, Get, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { AutoSchedulingSettingService } from './auto-scheduling-setting.service';
import { UpdateAutoSchedulingSettingDto } from './dto/update-auto-scheduling-setting.dto';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { PERMISSIONS, SECTIONS, SUB_SECTION } from '@/shared/constants/enum';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Section(
  SECTIONS.admin_portal_settings,
  SUB_SECTION.shift_auto_schedule_settings,
)
@Controller('auto-scheduling-setting')
export class AutoSchedulingSettingController {
  constructor(
    private readonly autoSchedulingSettingService: AutoSchedulingSettingService,
  ) {}

  @Roles('admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get()
  async find() {
    try {
      const result = await this.autoSchedulingSettingService.find({
        select: {
          id: true,
          cancel_request_expiry: true,
          check_distance_time: true,
          facility_cancel_time: true,
          post_shift_to_open: true,
          provider_radius: true,
          running_late_ai_time: true,
          running_late_request_expiry: true,
          send_another_request: true,
          bulk_scheduling_duration: true,
        },
      });
      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Record'),
        data: result[0],
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
    @Body() updateAutoSchedulingSettingDto: UpdateAutoSchedulingSettingDto,
  ) {
    try {
      const setting = await this.autoSchedulingSettingService.find({
        where: { id },
      });

      if (!setting || !setting.length) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Setting'),
          data: {},
        });
      }

      const result = await this.autoSchedulingSettingService.update(
        id,
        updateAutoSchedulingSettingDto,
      );

      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Setting')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Setting'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
