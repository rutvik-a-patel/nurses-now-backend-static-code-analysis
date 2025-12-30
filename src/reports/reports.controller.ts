import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Roles } from '@/shared/decorator/role.decorator';
import { RoleGuard } from '@/shared/guard/role.guard';
import { AuthGuard } from '@nestjs/passport';
import { CONSTANT } from '@/shared/constants/message';
import response from '@/shared/response';
import { FilterDnrReportDto } from './dto/filter-report.dto';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { PERMISSIONS, SECTIONS, SUB_SECTION } from '@/shared/constants/enum';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Section(SECTIONS.reports, SUB_SECTION.reports)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Roles('admin', 'facility', 'facility_user')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('dnr-report')
  async getAllDnrReport(@Query() filterDnrReportDto: FilterDnrReportDto) {
    try {
      const [list, count] =
        await this.reportsService.getAllDnrReport(filterDnrReportDto);
      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Staff')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff'),
        total: count,
        limit: +filterDnrReportDto.limit,
        offset: +filterDnrReportDto.offset,
        data: count ? list : [],
      };
      return response.successResponseWithPagination(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
