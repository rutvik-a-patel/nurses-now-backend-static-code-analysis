import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TimecardsService } from './timecards.service';
import { Roles } from '@/shared/decorator/role.decorator';
import { RoleGuard } from '@/shared/guard/role.guard';
import { AuthGuard } from '@nestjs/passport';
import response from '@/shared/response';
import { FilterTimecardDto } from '@/shift/dto/filter-timecard.dto';
import { CONSTANT } from '@/shared/constants/message';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { PERMISSIONS, SECTIONS, SUB_SECTION } from '@/shared/constants/enum';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Section(SECTIONS.timecards, SUB_SECTION.timecards)
@Controller('timecards')
export class TimecardsController {
  constructor(private readonly timecardsService: TimecardsService) {}

  @Roles('admin', 'facility', 'facility_user')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get()
  async findAll(@Query() filterTimecardDto: FilterTimecardDto) {
    try {
      const [timecards, count] =
        await this.timecardsService.getAllTimecards(filterTimecardDto);
      return response.successResponseWithPagination({
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Timecards')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Timecards'),
        data: timecards,
        total: count,
        limit: +filterTimecardDto.limit,
        offset: +filterTimecardDto.offset,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('admin-facility-timecards')
  async findTimeCardForFacility(@Query() filterTimecardDto: FilterTimecardDto) {
    try {
      const [timecards, count] =
        await this.timecardsService.getAllTimeCardForFacility(
          filterTimecardDto,
        );
      return response.successResponseWithPagination({
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Timecards')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Timecards'),
        data: timecards,
        total: count,
        limit: +filterTimecardDto.limit,
        offset: +filterTimecardDto.offset,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('count')
  async getTimecardCount() {
    try {
      const count = await this.timecardsService.getTimecardCount();
      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Timecard count'),
        data: count,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
