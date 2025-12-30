import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FacilityProviderService } from './facility-provider.service';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import {
  FilterFacilityProviderDto,
  FilterFacilityProviderWithStaffDto,
} from './dto/filter-facility-provider.dto';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { FlagDnrDto } from './dto/flag-dnr.dto';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { UpdateFacilityProviderDto } from './dto/update-facility-provider.dto';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import { FilterShiftDto } from './dto/filter-shift.dto';
import { AllShiftFilterDto } from '@/shift/dto/all-shift-filter.dto';
import { IRequest } from '@/shared/constants/types';
import {
  FACILITY_CONTACT_PERMISSIONS,
  FACILITY_PROVIDER_FLAGS,
  TABLE,
} from '@/shared/constants/enum';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';
import { FacilityContactPermission } from '@/shared/decorator/access-control.decorator';

@Controller('facility-provider')
export class FacilityProviderController {
  constructor(
    private readonly facilityProviderService: FacilityProviderService,
  ) {}

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('all/:id')
  async getAll(
    @Query() filterFacilityProviderDto: FilterFacilityProviderDto,
    @Param('id', UUIDValidationPipe) id: string,
  ) {
    try {
      const [list, count] = await this.facilityProviderService.getAll(
        filterFacilityProviderDto,
        id,
      );
      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Staff')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff'),
        total: count,
        limit: +filterFacilityProviderDto.limit,
        offset: +filterFacilityProviderDto.offset,
        data: count ? list : [],
      };
      return response.successResponseWithPagination(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('one/:id')
  async getOne(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const provider = await this.facilityProviderService.findOneWhere({
        where: { id },
      });

      if (!provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Record'),
          data: {},
        });
      }
      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Record'),
        data: provider,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @FacilityContactPermission([
    FACILITY_CONTACT_PERMISSIONS.can_flag_staff_as_preferred_and_dnr,
  ])
  @Patch('dnr/:id')
  async flagAsDnr(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() flagDnrDto: FlagDnrDto,
    @Req() req: IRequest,
  ) {
    try {
      const provider = await this.facilityProviderService.findOneWhere({
        where: { id },
        relations: { provider: true, facility: true },
      });

      if (!provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Record'),
          data: {},
        });
      }
      const isWorked = await this.facilityProviderService.countOfShiftsWorked(
        provider.provider.id,
        provider.facility.id,
      );

      if (!isWorked) {
        return response.badRequest({
          message: CONSTANT.ERROR.YET_TO_WORK(
            provider.provider.first_name + ' ' + provider.provider.last_name,
          ),
          data: {},
        });
      }

      const dnrStaff = {
        dnr_at: new Date(),
        created_by_id: req.user.id,
        created_by_type: TABLE[req.user.role],
      };
      Object.assign(flagDnrDto, dnrStaff);

      const result = await this.facilityProviderService.flagAsDnr(
        { id },
        flagDnrDto,
      );

      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.SUCCESSFULLY(
              `Flagged ${provider.provider.first_name + ' ' + provider.provider.last_name} as DNR`,
            )
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @FacilityContactPermission([
    FACILITY_CONTACT_PERMISSIONS.can_flag_staff_as_preferred_and_dnr,
  ])
  @Patch('update/:id')
  async update(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() updateFacilityProviderDto: UpdateFacilityProviderDto,
  ) {
    try {
      const provider = await this.facilityProviderService.findOneWhere({
        where: { id },
        relations: { provider: true, facility: true },
      });

      if (!provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        });
      }

      const isWorked = await this.facilityProviderService.countOfShiftsWorked(
        provider.provider.id,
        provider.facility.id,
      );

      if (!isWorked) {
        return response.badRequest({
          message: CONSTANT.ERROR.YET_TO_WORK(
            provider.provider.first_name + ' ' + provider.provider.last_name,
          ),
          data: {},
        });
      }

      if (
        updateFacilityProviderDto.flag === FACILITY_PROVIDER_FLAGS.preferred
      ) {
        updateFacilityProviderDto.dnr_type = null;
        updateFacilityProviderDto.dnr_at = null;
        updateFacilityProviderDto.dnr_reason = null;
      }

      const result = await this.facilityProviderService.updateWhere(
        { id },
        updateFacilityProviderDto,
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.SUCCESSFULLY(
              `Flagged ${provider.provider.first_name + ' ' + provider.provider.last_name} as Preferred`,
            )
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('details')
  async getProviderDetails(
    @Query('id', UUIDValidationPipe) id: string,
    @Query('facility_id', UUIDValidationPipe) facility_id: string,
  ) {
    try {
      const provider = await this.facilityProviderService.getProviderDetails(
        id,
        facility_id,
      );

      if (!provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        });
      }
      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Staff Details'),
        data: provider,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('summary/:id')
  async getProviderSummary(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const provider =
        await this.facilityProviderService.getProviderSummary(id);
      if (!provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        });
      }
      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Staff Summary'),
        data: provider,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('calendar/:id')
  async getScheduledCalendar(
    @Param('id', UUIDValidationPipe) id: string,
    @Query('start_date') start_date: string,
    @Query('end_date') end_date: string,
  ) {
    try {
      const facilityProvider = await this.facilityProviderService.findOneWhere({
        relations: { provider: true, facility: true },
        where: { id },
      });
      if (!facilityProvider) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        });
      }

      const result = await this.facilityProviderService.getScheduledCalendar(
        facilityProvider,
        start_date,
        end_date,
      );
      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Scheduled Shift'),
        data: result,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('admin-calendar/:id')
  async getScheduledCalendarForAdmin(
    @Param('id', UUIDValidationPipe) id: string,
    @Query('start_date') start_date: string,
    @Query('end_date') end_date: string,
  ) {
    try {
      const provider = await this.facilityProviderService.findProviderDetails({
        where: { id },
      });

      if (!provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        });
      }

      const result =
        await this.facilityProviderService.getScheduledCalendarForAdmin(
          provider,
          start_date,
          end_date,
        );

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Scheduled Shift'),
        data: result,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('admin/shift/:id') // provider_id
  async getShiftHistoryForAdminPortal(
    @Param('id', UUIDValidationPipe) id: string,
    @Query() queryParamsDto: AllShiftFilterDto,
  ) {
    try {
      const provider = await this.facilityProviderService.findProviderDetails({
        where: { id },
      });

      if (!provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        });
      }

      const [list, count] =
        await this.facilityProviderService.getShiftHistoryForAdminPortal(
          provider.id,
          queryParamsDto,
        );

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Shift History')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift History'),
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
  @Roles('facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('shift/:id')
  async getShiftHistory(
    @Param('id', UUIDValidationPipe) id: string,
    @Query() queryParamsDto: AllShiftFilterDto,
  ) {
    try {
      const facilityProvider = await this.facilityProviderService.findOneWhere({
        relations: { provider: true, facility: true },
        where: { id },
      });

      if (!facilityProvider) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        });
      }

      const [list, count] = await this.facilityProviderService.getShiftHistory(
        facilityProvider,
        queryParamsDto,
      );

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Shift History')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift History'),
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

  @Roles('admin', 'facility', 'facility_user')
  @FacilityContactPermission([
    FACILITY_CONTACT_PERMISSIONS.view_download_staff_credentials,
  ])
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('credentials/:id')
  async getCredentials(
    @Param('id', UUIDValidationPipe) id: string,
    @Query('search') search: string,
  ) {
    try {
      const provider = await this.facilityProviderService.findProviderDetails({
        where: { id },
        relations: {
          certificate: true,
          speciality: true,
        },
      });

      if (!provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        });
      }

      const result = await this.facilityProviderService.getAllCredentials(
        provider,
        search,
      );

      return response.successResponse({
        message: result
          ? CONSTANT.SUCCESS.RECORD_FOUND('Credentials')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Credentials'),
        data: result ? result : [],
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('facilities/:id')
  async getFacilities(
    @Param('id', UUIDValidationPipe) id: string,
    @Query() queryParamsDto: QueryParamsDto,
  ) {
    try {
      const provider = await this.facilityProviderService.findProviderDetails({
        where: { id },
      });

      if (!provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        });
      }

      const [list, count] =
        await this.facilityProviderService.findAllFacilities(
          id,
          queryParamsDto,
        );

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Facilities')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facilities'),
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

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('open-shifts/:id')
  async getShifts(
    @Param('id', UUIDValidationPipe) id: string,
    @Query() filterDto: FilterShiftDto,
  ) {
    try {
      const facilityProvider = await this.facilityProviderService.findOneWhere({
        relations: {
          provider: { certificate: true, speciality: true },
          facility: true,
        },
        where: { id },
      });

      if (!facilityProvider) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        });
      }

      const { provider } = facilityProvider;
      const [shifts, count] = await this.facilityProviderService.getShifts(
        facilityProvider.facility.id,
        provider,
        filterDto,
      );

      return response.successResponseWithPagination({
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Shifts')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shifts'),
        total: count,
        limit: +filterDto.limit,
        offset: +filterDto.offset,
        data: shifts,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('experience/:id')
  async getExperience(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const facilityProvider = await this.facilityProviderService.findOneWhere({
        relations: { provider: true, facility: true },
        where: { id },
      });

      if (!facilityProvider) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        });
      }

      const result = await this.facilityProviderService.findProviderDetails({
        relations: {
          education_history: true,
          professional_reference: true,
          work_history: true,
        },
        where: { id: facilityProvider.provider.id },
        select: {
          id: true,
          education_history: {
            id: true,
            school: true,
            location: true,
            course: true,
            degree: true,
            graduation_date: true,
          },
          work_history: {
            id: true,
            employer_name: true,
            supervisors_name: true,
            supervisors_title: true,
            work_phone_country_code: true,
            work_phone: true,
            location: true,
            is_teaching_facility: true,
            charge_experience: true,
            can_contact_employer: true,
            is_current: true,
            start_date: true,
            end_date: true,
          },
          professional_reference: {
            id: true,
            employer: true,
            name: true,
            title: true,
            email: true,
            country_code: true,
            mobile_no: true,
            start_date: true,
            end_date: true,
            total_reminder_sent: true,
          },
        },
      });
      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Experience'),
        data: result,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch('self-dnr/:id')
  async providerSelfDnr(
    @Param('id', UUIDValidationPipe) id: string,
    @Req() req: IRequest,
  ) {
    try {
      const isWorked = await this.facilityProviderService.countOfShiftsWorked(
        req.user.id,
        id,
      );

      if (!isWorked) {
        return response.badRequest({
          message: CONSTANT.ERROR.NEVER_WORKED,
          data: {},
        });
      }

      const facilityProvider = await this.facilityProviderService.findOneWhere({
        where: { provider: { id: req.user.id }, facility: { id } },
      });

      await this.facilityProviderService.updateWhere(
        { provider: { id: req.user.id }, facility: { id } },
        {
          self_dnr_at: facilityProvider?.self_dnr
            ? null
            : new Date().toISOString(),
          self_dnr_reason: null,
          self_dnr_description: null,
          self_dnr: facilityProvider?.self_dnr ? false : true,
        },
      );

      const result = await this.facilityProviderService.findOneWhere({
        where: { provider: { id: req.user.id }, facility: { id } },
      });
      return response.successResponse({
        message:
          result.self_dnr === true
            ? CONSTANT.SUCCESS.SUCCESSFULLY('Flagged as DNR')
            : CONSTANT.SUCCESS.SUCCESSFULLY('Flag Removed as DNR'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('staff-worked-facilities')
  async listOfFacilityStaffWorked(
    @Query() query: FilterFacilityProviderWithStaffDto,
  ) {
    try {
      const [facilities, count] =
        await this.facilityProviderService.listOfFacilityStaffWorked(query);
      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Facilities')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facilities'),
        total: count,
        limit: +query.limit,
        offset: +query.offset,
        data: count ? facilities : [],
      };
      return response.successResponseWithPagination(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
