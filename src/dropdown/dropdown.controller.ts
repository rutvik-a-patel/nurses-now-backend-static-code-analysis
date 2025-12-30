import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { DropdownService } from './dropdown.service';
import { CONSTANT } from '@/shared/constants/message';
import response from '@/shared/response';
import { Request } from 'express';
import { ILike, In, IsNull, Not } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import {
  ENTITY_STATUS,
  DEFAULT_STATUS,
  DNR_TYPE,
  USER_TYPE,
  USER_STATUS,
} from '@/shared/constants/enum';
import { Roles } from '@/shared/decorator/role.decorator';
import { RoleGuard } from '@/shared/guard/role.guard';
import { IFilterDropdownOptions, IRequest } from '@/shared/constants/types';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import {
  FilterProviderDto,
  FilterProviderV2Dto,
} from './dto/filter-provider.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import {
  FilterDropdownDto,
  SearchDropdownDto,
  SearchUserByTypeDropdownDto,
} from './dto/filter.dropdown.dto';
import { active, applicant } from '@/shared/constants/constant';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';

@Throttle({
  default: { limit: 50, ttl: 60000 },
})
@Controller('dropdown')
export class DropdownController {
  constructor(private readonly dropdownService: DropdownService) {}

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard, ThrottlerGuard)
  @Get('facility-certificate-speciality')
  async getFacilityCertificateSpeciality(@Query() filter?: FilterDropdownDto) {
    try {
      const result: IFilterDropdownOptions = {};
      const parsedSearch = filter.search
        ? parseSearchKeyword(filter.search)
        : undefined;
      // If no filters provided or facility filter is true
      if (!filter || Object.keys(filter).length === 0 || filter.facility) {
        const facilities = await this.dropdownService.getFacility({
          relations: { status: true },
          where: {
            is_corporate_client: false,
            status: { name: active },
            name: parsedSearch ? ILike(`%${parsedSearch}%`) : undefined,
          },
          select: {
            id: true,
            name: true,
            is_master: true,
            is_floor: true,
          },
          order: {
            name: 'ASC',
          },
        });
        result.facilities = facilities || [];
      }

      // If no filters provided or certificate filter is true
      if (!filter || Object.keys(filter).length === 0 || filter.certificate) {
        const certificates = await this.dropdownService.getCertificates(filter);
        result.certificates = certificates || [];
      }

      // If no filters provided or speciality filter is true
      if (!filter || Object.keys(filter).length === 0 || filter.speciality) {
        const specialities = await this.dropdownService.getSpecialties(filter);
        result.specialities = specialities || [];
      }

      // If no filters provided or status filter is true
      if (!filter || Object.keys(filter).length === 0 || filter.status) {
        const status = await this.dropdownService.getStatusOption({
          where: {
            status: DEFAULT_STATUS.active,
            status_for: USER_TYPE.facility,
          },
        });
        result.status = status || [];
      }

      // If no filters provided or facility_type filter is true
      if (!filter || Object.keys(filter).length === 0 || filter.facility_type) {
        const facility_type = await this.dropdownService.getLineOfBusiness();
        result.facility_type = facility_type || [];
      }

      const data = {
        message: Object.keys(result).length
          ? CONSTANT.SUCCESS.RECORD_FOUND('Records')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Records'),
        data: result,
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard, ThrottlerGuard)
  @Get('search-facilities')
  async searchFacilities(@Query('search') search: string) {
    try {
      const parsedSearch = search ? parseSearchKeyword(search) : undefined;
      const facilities = await this.dropdownService.getFacility({
        relations: { status: true },
        where: {
          name: parsedSearch ? ILike(`%${parsedSearch}%`) : undefined,
        },
        select: {
          id: true,
          name: true,
          is_master: true,
          is_floor: true,
        },
        order: {
          name: 'ASC',
        },
      });

      const data = {
        message: Object.keys(facilities).length
          ? CONSTANT.SUCCESS.RECORD_FOUND('Records')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Records'),
        data: facilities,
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard, ThrottlerGuard)
  @Get('cancel-by')
  async getCancelBy(
    @Query('facility_id') facility_id?: string,
    @Query() filter?: FilterDropdownDto,
  ) {
    try {
      const result: IFilterDropdownOptions = {};
      // If no filters provided or facility_type filter is true
      if (!filter || Object.keys(filter).length === 0 || filter.provider) {
        const provider = await this.dropdownService.getProvider({
          where: {
            is_active: true,
            profile_status: Not(USER_STATUS.deleted),
            first_name: Not(IsNull()),
            last_name: Not(IsNull()),
            certificate: Not(IsNull()),
            speciality: Not(IsNull()),
          },
          select: {
            id: true,
            first_name: true,
            last_name: true,
            base_url: true,
            profile_image: true,
          },
          order: { first_name: 'ASC' },
        });
        result.provider = provider || [];
      }

      // If no filters provided or facility_type filter is true
      if (!filter || Object.keys(filter).length === 0 || filter.facility_user) {
        const facility_user =
          await this.dropdownService.getFacilityUserDropDown(facility_id);
        result.facility_user = facility_user || [];
      }

      // If no filters provided or facility_type filter is true
      if (!filter || Object.keys(filter).length === 0 || filter.admin) {
        const admin = await this.dropdownService.getAllAdminUser({
          where: { status: ENTITY_STATUS.active },
          select: {
            id: true,
            first_name: true,
            last_name: true,
            base_url: true,
            image: true,
          },
          order: { first_name: 'ASC' },
        });
        result.admin = admin || [];
      }

      const data = {
        message: Object.keys(result).length
          ? CONSTANT.SUCCESS.RECORD_FOUND('Records')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Records'),
        data: result,
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @UseGuards(AuthGuard('jwt'), ThrottlerGuard)
  @Get('certificate')
  async getCertificates(@Query() filter: FilterDropdownDto) {
    try {
      const result = await this.dropdownService.getCertificates(filter);

      const data = {
        message: result
          ? CONSTANT.SUCCESS.RECORD_FOUND('Licenses')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Licenses'),
        data: result ? result : [],
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @UseGuards(AuthGuard('jwt'), ThrottlerGuard)
  @Get('speciality')
  async getSpecialties(@Query() filter: FilterDropdownDto) {
    try {
      const result = await this.dropdownService.getSpecialties(filter);

      const data = {
        message: result
          ? CONSTANT.SUCCESS.RECORD_FOUND('Specialty')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Specialty'),
        data: result ? result : [],
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @UseGuards(ThrottlerGuard)
  @Get('country')
  async getCountry() {
    try {
      const result = await this.dropdownService.getCountry();

      const data = {
        message: result
          ? CONSTANT.SUCCESS.RECORD_FOUND('Countries')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Countries'),
        data: result ? result : [],
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @UseGuards(ThrottlerGuard)
  @Get('state')
  async getState(@Req() req: Request) {
    try {
      const where = {
        deleted_at: IsNull(),
      };
      if (req.query && req.query.country_id) {
        Object.assign(where, { country: { id: req.query.country_id } });
      }

      const result = await this.dropdownService.getState({
        where,
        select: {
          id: true,
          name: true,
        },
        order: {
          name: 'ASC',
        },
      });

      const data = {
        message: result
          ? CONSTANT.SUCCESS.RECORD_FOUND('States')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('States'),
        data: result ? result : [],
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @UseGuards(ThrottlerGuard)
  @Get('city')
  async getCity(@Req() req: Request) {
    try {
      const where = {
        deleted_at: IsNull(),
      };
      if (req.query && req.query.state_id) {
        Object.assign(where, { state: { id: req.query.state_id } });
      }

      const result = await this.dropdownService.getCity({
        where,
        select: {
          id: true,
          name: true,
        },
        order: {
          name: 'ASC',
        },
      });

      const data = {
        message: result
          ? CONSTANT.SUCCESS.RECORD_FOUND('Cities')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Cities'),
        data: result ? result : [],
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @UseGuards(ThrottlerGuard)
  @Get('search-city')
  async getCitySearch(@Query('search') search: string) {
    try {
      const where = {
        deleted_at: IsNull(),
      };
      search = search ? parseSearchKeyword(search) : '';
      if (search) {
        Object.assign(where, { name: ILike(`%${search}%`) });
      }

      const result = await this.dropdownService.getCity({
        where,
        relations: {
          state: {
            country: true,
          },
        },
        select: {
          id: true,
          name: true,
          state: {
            id: true,
            name: true,
            country: {
              id: true,
              name: true,
            },
          },
        },
        order: { name: 'ASC' },
      });

      const data = {
        message: result
          ? CONSTANT.SUCCESS.RECORD_FOUND('Cities')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Cities'),
        data: result ? result : [],
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard, ThrottlerGuard)
  @Get('facility-permission')
  async getFacilityPermissions() {
    try {
      const where = {
        deleted_at: IsNull(),
      };

      const result = await this.dropdownService.getFacilityPermissions({
        where,
        select: {
          id: true,
          name: true,
        },
        order: {
          name: 'ASC',
        },
      });

      const data = {
        message: result
          ? CONSTANT.SUCCESS.RECORD_FOUND('Permissions')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Permissions'),
        data: result ? result : [],
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard, ThrottlerGuard)
  @Get('roles')
  async getRoles() {
    try {
      const where = {
        deleted_at: IsNull(),
        status: DEFAULT_STATUS.active,
      };

      const result = await this.dropdownService.getRoles({
        where,
        select: {
          id: true,
          name: true,
        },
        order: {
          name: 'ASC',
        },
      });

      const data = {
        message: result
          ? CONSTANT.SUCCESS.RECORD_FOUND('Roles')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Roles'),
        data: result ? result : [],
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard, ThrottlerGuard)
  @Get('facility')
  async getFacility(@Req() req: IRequest, @Query('search') search: string) {
    try {
      search = search ? parseSearchKeyword(search) : '';

      const where = [
        {
          id: req.user.id,
          name: ILike(`%${search}%`),
        },
        {
          master_facility_id: req.user.id,
          name: ILike(`%${search}%`),
        },
      ];
      if (req.user.facility_id && req.user.facility_id.length) {
        if (req.user.primary_facility) {
          where.push({
            name: ILike(`%${search}%`),
            master_facility_id: req.user.primary_facility.id,
          });
        }
        where.push({
          name: ILike(`%${search}%`),
          id: In(req.user?.facility_id),
        });
      }
      const result = await this.dropdownService.getFacility({
        where,
        relations: {
          facility_type: true,
        },
        select: {
          id: true,
          name: true,
          is_master: true,
          base_url: true,
          image: true,
          facility_type: {
            id: true,
            name: true,
            work_comp_code: true,
          },
          country: true,
          state: true,
          city: true,
        },
        order: {
          name: 'ASC',
        },
      });

      const data = {
        message: result
          ? CONSTANT.SUCCESS.RECORD_FOUND('Facility')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facility'),
        data: result ? result : [],
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  // for listing all floors of the facility
  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard, ThrottlerGuard)
  @Get('facility-floors/:id')
  async getFacilityFloor(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const floor = await this.dropdownService.getAllFloorListing({
        where: { facility: { id } },
        select: {
          id: true,
          created_at: true,
          name: true,
          beds: true,
          po_number: true,
          cost_center: true,
          phone_number: true,
          description: true,
        },
      });

      return response.successResponse({
        message:
          floor.length > 0
            ? CONSTANT.SUCCESS.RECORD_FOUND('Floor')
            : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Floor'),
        data: floor,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard, ThrottlerGuard)
  @Get('all-facility')
  async getAllFacility(
    @Query('id') id?: string,
    @Query('search') search?: string,
    @Query('is_corporate_client') is_corporate_client?: boolean,
  ) {
    try {
      search = search ? parseSearchKeyword(search) : '';

      const findSubFacility = await this.dropdownService.findOneFacilityWhere({
        where: { id },
      });

      const where = [
        {
          id,
          name: ILike(`%${search}%`),
          ...{ is_corporate_client: is_corporate_client || false },
        },
        {
          master_facility_id: id,
          name: ILike(`%${search}%`),
          ...{ is_corporate_client: is_corporate_client || false },
        },
        ...(findSubFacility && findSubFacility.master_facility_id
          ? [
              {
                id: findSubFacility.master_facility_id,
                name: ILike(`%${search}%`),
                ...{ is_corporate_client: is_corporate_client || false },
              },
              {
                master_facility_id: findSubFacility.master_facility_id,
                name: ILike(`%${search}%`),
                ...{ is_corporate_client: is_corporate_client || false },
              },
            ]
          : []),
      ];
      const result = await this.dropdownService.getFacility({
        where,
        relations: {
          facility_type: true,
        },
        select: {
          id: true,
          name: true,
          is_master: true,
          base_url: true,
          image: true,
          facility_type: {
            id: true,
            name: true,
            work_comp_code: true,
          },
          country: true,
          state: true,
          city: true,
          is_corporate_client: true,
        },
        order: {
          name: 'ASC',
        },
      });

      const data = {
        message: result
          ? CONSTANT.SUCCESS.RECORD_FOUND('Facility')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facility'),
        data: result ? result : [],
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user', 'provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard, ThrottlerGuard)
  @Get('shift-cancel-reason')
  async getShiftCancelReason(@Query('type') type: USER_TYPE) {
    try {
      const where = {
        deleted_at: IsNull(),
        user_type: type,
        status: DEFAULT_STATUS.active,
      };
      const result = await this.dropdownService.getShiftCancelReason({
        where: where,
        select: {
          id: true,
          reason: true,
        },
        order: { reason: 'ASC' },
      });

      const data = {
        message: result
          ? CONSTANT.SUCCESS.RECORD_FOUND('Record')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
        data: result ? result : [],
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard, ThrottlerGuard)
  @Get('facility-user/:id')
  async getFacilityUsers(
    @Param('id', UUIDValidationPipe) id: string,
    @Query('search') search: string,
    @Query('is_billing') is_billing: boolean,
  ) {
    try {
      const masterFacility = await this.dropdownService.findOneFacilityWhere({
        where: { id: id, deleted_at: IsNull() },
      });

      if (!masterFacility) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility'),
          data: {},
        });
      }

      const result = await this.dropdownService.getFacilityUser(
        [id],
        search,
        is_billing,
      );
      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Records'),
        data: result,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard, ThrottlerGuard)
  @Get('time-setting/:id')
  async getTimeSettingForShift(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const facility = await this.dropdownService.findOneFacilityWhere({
        where: { id: id, deleted_at: IsNull() },
      });

      if (!facility) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility'),
          data: {},
        });
      }
      const result = await this.dropdownService.getTimeSettingForShift(id);

      const data = {
        message: result
          ? CONSTANT.SUCCESS.RECORD_FOUND('Record')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
        data: result ? result : [],
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard, ThrottlerGuard)
  @Get('provider')
  async getProviders(@Query() filterProviderDto: FilterProviderDto) {
    try {
      const result =
        await this.dropdownService.getAllProvider(filterProviderDto);

      const data = {
        message: result.length
          ? CONSTANT.SUCCESS.RECORD_FOUND('Record')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
        data: result.length ? result : [],
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard, ThrottlerGuard)
  @Get('provider/v2')
  async getProvidersV2(
    @Query() filterProviderDto: FilterProviderV2Dto,
    @Req() req: IRequest,
  ) {
    try {
      const result = await this.dropdownService.getAllProviderV3(
        filterProviderDto,
        req,
      );

      const data = {
        message: result.length
          ? CONSTANT.SUCCESS.RECORD_FOUND('Staff')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff'),
        data: result.length ? result : [],
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard, ThrottlerGuard)
  @Get('shift-type')
  async getShiftTypes() {
    try {
      const result = await this.dropdownService.getShiftTypes();

      const data = {
        message: result
          ? CONSTANT.SUCCESS.RECORD_FOUND('Shift Types')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift Types'),
        data: result ? result : [],
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard, ThrottlerGuard)
  @Get('line-of-business')
  async getLineOfBusiness() {
    try {
      const result = await this.dropdownService.getLineOfBusiness();

      const data = {
        message: result
          ? CONSTANT.SUCCESS.RECORD_FOUND('Line Of Business')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Line Of Business'),
        data: result ? result : [],
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard, ThrottlerGuard)
  @Get('timecard-reject-reason')
  async getAllTimecardRejectReason() {
    try {
      const list = await this.dropdownService.getAllTimecardRejectReason();

      const data = {
        message: list
          ? CONSTANT.SUCCESS.RECORD_FOUND('Timecard Reject Reason')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Timecard Reject Reason'),
        data: list ? list : [],
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard, ThrottlerGuard)
  @Get('certificate-and-speciality')
  async getCertificateAndSpeciality(@Query() filter?: FilterDropdownDto) {
    try {
      const usedFilter = filter || new FilterDropdownDto();
      const certificates =
        await this.dropdownService.getFacilityCertificatesOrNull(usedFilter);
      const specialities =
        await this.dropdownService.getFacilitySpecialtiesOnly(usedFilter);

      const list = {
        certificates,
        specialities,
      };

      const data = {
        message:
          certificates || specialities
            ? CONSTANT.SUCCESS.RECORD_FOUND('License And Speciality')
            : CONSTANT.SUCCESS.RECORD_NOT_FOUND('License And Speciality'),
        data: certificates || specialities ? list : {},
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard, ThrottlerGuard)
  @Get('credentials')
  async getCredentials() {
    try {
      const competencyTest = await this.dropdownService.getCompetencyTest();
      const skillChecklist = await this.dropdownService.getSkillChecklist();
      const eDocs = await this.dropdownService.getEDocs();

      const list = {
        competency_test: competencyTest,
        skill_checklist: skillChecklist,
        e_doc: eDocs,
      };

      const data = {
        message:
          competencyTest || skillChecklist || eDocs
            ? CONSTANT.SUCCESS.RECORD_FOUND('Credentials')
            : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Credentials'),
        data: competencyTest || skillChecklist || eDocs ? list : {},
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard, ThrottlerGuard)
  @Get('credentials-category')
  async getCredentialsCategory() {
    try {
      const data = await this.dropdownService.getCredentialsCategory();

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Credentials category'),
        data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard, ThrottlerGuard)
  @Get('flag')
  async getFlagList() {
    try {
      const flags = await this.dropdownService.getFlagList({
        where: { status: DEFAULT_STATUS.active },
      });

      const data = {
        message: flags
          ? CONSTANT.SUCCESS.RECORD_FOUND('Flags')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Flags'),
        data: flags ? flags : [],
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard, ThrottlerGuard)
  @Get('dnr-reason')
  async getDNRReason(@Query('reason_type') reason_type: DNR_TYPE) {
    try {
      const data = await this.dropdownService.getDNRReason(reason_type);
      return response.successResponse({
        message: data
          ? CONSTANT.SUCCESS.RECORD_FOUND('DNR Reason')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('DNR Reason'),
        data: data ? data : [],
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard, ThrottlerGuard)
  @Get('doc-groups')
  async getEDocGroups() {
    try {
      const data = await this.dropdownService.getEDocGroups();
      return response.successResponse({
        message: data
          ? CONSTANT.SUCCESS.RECORD_FOUND('E-Doc Groups')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('E-Doc Groups'),
        data: data ? data : [],
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('admin-user')
  async getAllAdminUser(@Req() req: IRequest) {
    try {
      const admins = await this.dropdownService.getAllAdminUser({
        where: { status: ENTITY_STATUS.active, id: Not(req.user.id) },
      });

      return response.successResponse({
        message: admins.length
          ? CONSTANT.SUCCESS.RECORD_FOUND('Users')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Users'),
        data: admins.length ? admins : [],
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('status-options')
  async getStatusOption(@Query('status_for') status_for: USER_TYPE) {
    try {
      const statusOptions = await this.dropdownService.getStatusOption({
        where: { status: DEFAULT_STATUS.active, status_for },
      });

      return response.successResponse({
        message: statusOptions.length
          ? CONSTANT.SUCCESS.RECORD_FOUND('Status Option')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Status Option'),
        data: statusOptions.length ? statusOptions : [],
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('status-options-required')
  async getStatusOptionAsRequired(@Query() query: SearchUserByTypeDropdownDto) {
    try {
      const statusOptions =
        await this.dropdownService.getStatusOptionAsRequired(query);

      return response.successResponse({
        message:
          statusOptions.facility.length > 0 || statusOptions.provider.length > 0
            ? CONSTANT.SUCCESS.RECORD_FOUND('Status Option')
            : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Status Option'),
        data:
          statusOptions.facility.length > 0 || statusOptions.provider.length > 0
            ? statusOptions
            : [],
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('relates_to')
  async relatesTo(@Query('search') search: string) {
    try {
      const result = await this.dropdownService.relatesTo(search);

      return response.successResponse({
        message: result
          ? CONSTANT.SUCCESS.RECORD_FOUND('Record')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
        data: result,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('tags')
  async tags(@Query('search') search: string) {
    try {
      const result = await this.dropdownService.tags(search);

      if (!result) {
        return response.failureResponse({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Tags'),
        });
      }
      return response.successResponse({
        message:
          result.length > 0
            ? CONSTANT.SUCCESS.RECORD_FOUND('Tags')
            : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Tags'),
        data: result,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('provider-reject-reason')
  async getAllProviderRejectReason() {
    try {
      const data = await this.dropdownService.getAllProviderRejectReason();

      const dataResponse = {
        message: data
          ? CONSTANT.SUCCESS.RECORD_FOUND('Verification Reject Reason')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Verification Reject Reason'),
        data: data ? data : [],
      };
      return response.successResponse(dataResponse);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('orientation-reject-reason')
  async getAllOrientationRejectReason() {
    try {
      const data = await this.dropdownService.getAllOrientationRejectReason();

      const dataResponse = {
        message: data
          ? CONSTANT.SUCCESS.RECORD_FOUND('Orientation Reject Reason')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Orientation Reject Reason'),
        data: data ? data : [],
      };
      return response.successResponse(dataResponse);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('search-active-provider')
  async searchActiveProvider(@Query('search') search: string) {
    try {
      const result = await this.dropdownService.searchProvider(search, active);

      const data = {
        message: result
          ? CONSTANT.SUCCESS.RECORD_FOUND('Staff')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff'),
        data: result ? result : [],
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('search-applicant')
  async searchApplicant(@Query('search') search: string) {
    try {
      const result = await this.dropdownService.searchProvider(
        search,
        applicant,
      );

      const data = {
        message: result
          ? CONSTANT.SUCCESS.RECORD_FOUND('Staff')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff'),
        data: result ? result : [],
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('search-users')
  async searchUsers(
    @Query('search') search: string,
    @Query('facility') facility: string,
  ) {
    try {
      const result = await this.dropdownService.searchUsers(search, facility);

      const data = {
        message: result.length
          ? CONSTANT.SUCCESS.RECORD_FOUND('Users')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Users'),
        data: result ? result : [],
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('primary-contact')
  async getPrimaryContact(@Query('search') search: string) {
    try {
      const result = await this.dropdownService.getPrimaryContact(search);

      const data = {
        message: result.length
          ? CONSTANT.SUCCESS.RECORD_FOUND('Primary Contact')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Primary Contact'),
        data: result ? result : [],
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('search-document')
  async searchDocument(@Query() filter: SearchDropdownDto) {
    try {
      const result = await this.dropdownService.getDocuments(filter);

      const data = {
        message: result.length
          ? CONSTANT.SUCCESS.RECORD_FOUND(
              result.length > 1 ? 'Records' : 'Record',
            )
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
        data: result ? result : [],
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('get-user-by-type')
  async getUserByType(@Query() filter: SearchUserByTypeDropdownDto) {
    try {
      const result = await this.dropdownService.getUserByType(filter);

      const data = {
        message: result.length
          ? CONSTANT.SUCCESS.RECORD_FOUND(
              result.length > 1 ? 'Records' : 'Record',
            )
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
        data: result ? result : [],
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('credential-reject-reason')
  async getCredetialRejectReason() {
    try {
      const data = await this.dropdownService.getCredentialRejectReason();

      const dataResponse = {
        message: data
          ? CONSTANT.SUCCESS.RECORD_FOUND('Credential Reject Reason')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Credential Reject Reason'),
        data: data ? data : [],
      };
      return response.successResponse(dataResponse);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('reference-reject-reason')
  async getReferenceRejectReason() {
    try {
      const data = await this.dropdownService.getReferenceRejectReasons();

      const dataResponse = {
        message: data
          ? CONSTANT.SUCCESS.RECORD_FOUND('Reference Reject Reason')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Reference Reject Reason'),
        data: data ? data : [],
      };
      return response.successResponse(dataResponse);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('credential-categories-documents')
  async categoriesWithCredentialsDocuments(@Query() filter: QueryParamsDto) {
    try {
      const data =
        await this.dropdownService.categoriesWithCredentialsDocuments(filter);

      const dataResponse = {
        message: data
          ? CONSTANT.SUCCESS.RECORD_FOUND(
              'Categories with Credentials Documents',
            )
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND(
              'Categories with Credentials Documents',
            ),
        data: data ? data : [],
      };
      return response.successResponse(dataResponse);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
