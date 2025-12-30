import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { TimeEntryApprovalService } from './time-entry-approval.service';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { UpdateTimeEntryApprovalDto } from './dto/update-time-entry-approval.dto';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { PERMISSIONS, SECTIONS, SUB_SECTION } from '@/shared/constants/enum';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Section(SECTIONS.staff_app_settings, SUB_SECTION.time_entry_approval)
@Controller('time-entry-approval')
export class TimeEntryApprovalController {
  constructor(
    private readonly timeEntryApprovalService: TimeEntryApprovalService,
  ) {}

  @Roles('admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get()
  async getAllSettings() {
    try {
      const data = await this.timeEntryApprovalService.findAll({
        select: {
          id: true,
          key: true,
          name: true,
          value: true,
          order: true,
        },
        order: { order: 'ASC' },
      });

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Time entry setting'),
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.edit)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Patch(':id')
  async updateSetting(
    @Param('id') id: string,
    @Body() updateTimeEntryApprovalDto: UpdateTimeEntryApprovalDto,
  ) {
    try {
      const setting = await this.timeEntryApprovalService.findOneWhere({
        where: { id },
      });

      if (!setting) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Time entry setting'),
          data: {},
        });
      }

      const result = await this.timeEntryApprovalService.updateWhere(
        { id },
        updateTimeEntryApprovalDto,
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Time entry setting')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Time entry setting'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
