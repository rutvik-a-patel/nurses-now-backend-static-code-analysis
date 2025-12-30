import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { RateGroupsService } from './rate-groups.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateRateGroupDto } from './dto/create-rate-group.dto';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { Roles } from '@/shared/decorator/role.decorator';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { PERMISSIONS, SECTIONS, SUB_SECTION } from '@/shared/constants/enum';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';
import { RoleGuard } from '@/shared/guard/role.guard';

@Section(SECTIONS.admin_portal_settings, SUB_SECTION.rate_groups)
@Controller('rate-groups')
export class RateGroupsController {
  constructor(private readonly rateGroupsService: RateGroupsService) {}

  @Roles('admin')
  @Permission(PERMISSIONS.edit)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post()
  async saveRateGroup(@Body() createRateGroupDto: CreateRateGroupDto) {
    try {
      const { deleted_rate_sheets = [] } = createRateGroupDto;
      await this.rateGroupsService.saveRateGroup(createRateGroupDto);

      const canDeleteRateSheets =
        await this.rateGroupsService.canDeleteRateSheets(deleted_rate_sheets);

      if (!canDeleteRateSheets) {
        return response.badRequest({
          message: CONSTANT.ERROR.CANNOT_DELETE_RATE_SHEETS,
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Rate Group Saved'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get()
  async getRateGroup(@Query('facility') facility: string) {
    try {
      const data = await this.rateGroupsService.getRateGroup(facility);

      if (!data) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Rate Group'),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Rate Group Fetched'),
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
