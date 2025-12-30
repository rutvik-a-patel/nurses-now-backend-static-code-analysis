import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { IRequest } from '@/shared/constants/types';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import { FilterEarningsDto } from './dto/filter-earnings.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('provider')
  async getProviderDashboard(@Req() req: IRequest) {
    try {
      const timezone = `${req.headers['timezone']}`;
      const [hoursString, minutesString] = timezone.split(':');
      const offsetHours = parseInt(hoursString, 10);
      const offsetMinutes = parseInt(minutesString, 10);
      const utcDate = new Date().toUTCString();

      const date = new Date(utcDate).getTime();

      const offset = (offsetHours * 60 + offsetMinutes) * 60000; // Calculate offset in milliseconds
      const diff = date + offset;

      const provider = await this.dashboardService.findOneProviderWhere({
        where: { id: req.user.id },
        relations: {
          certificate: true,
          speciality: true,
          address: true,
          status: true,
        },
      });

      if (!provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        });
      }

      if (!provider.certificate) {
        return response.badRequest({
          message: CONSTANT.ERROR.SHIFT_LIST_PROFILE_INCOMPLETE,
          data: {},
        });
      }

      const data = await this.dashboardService.getApplicationProgress(req.user);

      if (data.overall_progress < 100) {
        return response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Application Progress'),
          data,
        });
      }

      const summary = await this.dashboardService.getProviderDashboard(
        provider,
        diff,
      );

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Dashboard Summary'),
        data: { ...summary, overall_progress: data.overall_progress },
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('provider-credential/:id')
  async getProviderCredentials(
    @Param('id', UUIDValidationPipe) id: string,
    @Query() queryParamsDto: QueryParamsDto,
  ) {
    try {
      const provider = await this.dashboardService.findOneProviderWhere({
        where: { id },
        relations: { certificate: true },
      });

      if (!provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        });
      }
      const [list, count] =
        await this.dashboardService.getProviderCredentialsSummary(
          provider,
          queryParamsDto,
        );

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Credentials')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Credentials'),
        total: count,
        limit: +queryParamsDto.limit,
        offset: +queryParamsDto.offset,
        data: list,
      };
      return response.successResponseWithPagination(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('earnings')
  async getProviderEarnings(
    @Req() req: IRequest,
    @Query() queryParams: FilterEarningsDto,
  ) {
    try {
      const providerId = req.user.id;
      const data = await this.dashboardService.getProviderEarnings(
        providerId,
        queryParams,
      );

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Earnings'),
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
