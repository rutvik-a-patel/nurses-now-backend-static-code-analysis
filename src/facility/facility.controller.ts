import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FacilityService } from './facility.service';
import { CONSTANT } from '@/shared/constants/message';
import { CreateFacilityUserDto } from '@/facility-user/dto/create-facility-user.dto';
import { FacilityUserService } from '@/facility-user/facility-user.service';
import { AuthGuard } from '@nestjs/passport';
import response from '@/shared/response';
import { Roles } from '@/shared/decorator/role.decorator';
import { RoleGuard } from '@/shared/guard/role.guard';
import { UpdateFacilityUserDto } from '@/facility-user/dto/update-facility-user.dto';
import { ILike, In, Not } from 'typeorm';
import { CompleteProfileDto } from './dto/complete-facility-profile.dto';
import {
  ACTION_TABLES,
  ACTIVITY_TYPE,
  CLIENT_TYPE,
  FACILITY_CONTACT_PERMISSIONS,
  LINK_TYPE,
  PERMISSIONS,
  SECTIONS,
  SUB_SECTION,
  TABLE,
  USER_TYPE,
} from '@/shared/constants/enum';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { IRequest } from '@/shared/constants/types';
import { AddFacilityDto } from './dto/add-facility.dto';
import { UpdateFacilitySettingDto } from './dto/update-facility-setting.dto';
import { FilterFacilityDto } from './dto/filter-facility.dto';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { UpdateFacilityDetailDto } from './dto/update-facility-detail.dto';
import { SetupFacility } from './dto/setup-facility.dto';
import { StatusSettingService } from '@/status-setting/status-setting.service';
import { active, in_active, prospect } from '@/shared/constants/constant';
import { RejectFacilityDto } from './dto/update-facility.dto';
import { ContactFilterDto } from '@/facility-user/dto/contact-filter.dto';
import { getTimezone } from '@/shared/helpers/timezone-offset';
import {
  FacilityContactPermission,
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Controller('facility')
export class FacilityController {
  constructor(
    private readonly facilityService: FacilityService,
    private readonly facilityUserService: FacilityUserService,
    private readonly encryptDecryptService: EncryptDecryptService,
    private readonly statusSettingService: StatusSettingService,
  ) {}

  @Section(SECTIONS.facilities, SUB_SECTION.facilities)
  @Roles('admin', 'facility', 'facility_user')
  @Permission(PERMISSIONS.add)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post('add-contacts')
  async addFacilityContacts(
    @Body() createFacilityUserDto: CreateFacilityUserDto,
    @Body('master_facility_id') id: string, // master facility id
  ) {
    try {
      const emailOrMobileExists = await this.facilityUserService.findOneWhere({
        where: [
          { email: createFacilityUserDto.email },
          {
            country_code: createFacilityUserDto.country_code,
            mobile_no: createFacilityUserDto.mobile_no,
          },
        ],
      });

      if (emailOrMobileExists) {
        const facilities = await this.facilityService.findOneWhere({
          where: {
            id: In(emailOrMobileExists.facility_id),
          },
        });

        return response.badRequest({
          message: CONSTANT.ERROR.FACILITY_CONTACT_ALREADY_EXIST(
            facilities.name ? facilities.name : 'other facility',
          ),
          data: {},
        });
      }

      const facility = await this.facilityService.findOneWhere({
        where: { id },
      });
      const isAlreadyPrimaryContactOfFacilityExist =
        await this.facilityUserService.findOneWhere({
          where: {
            primary_facility: { id },
          },
        });

      if (!isAlreadyPrimaryContactOfFacilityExist) {
        createFacilityUserDto.primary_facility = facility;
      }

      const data = await this.facilityService.addContact(
        createFacilityUserDto,
        id,
      );

      return response.successCreate({
        message: CONSTANT.SUCCESS.ADDED_TO_CONTACTS(
          createFacilityUserDto.first_name +
            ' ' +
            createFacilityUserDto.last_name,
        ),
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Section(SECTIONS.facilities, SUB_SECTION.facilities)
  @Roles('admin', 'facility', 'facility_user')
  @Permission(PERMISSIONS.view)
  @FacilityContactPermission([FACILITY_CONTACT_PERMISSIONS.manage_team])
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('all-contacts/:id')
  async getAllFacilityContacts(
    @Param('id', UUIDValidationPipe) id: string,
    @Query() queryParamsDto: ContactFilterDto,
    @Req() req: IRequest,
  ) {
    try {
      const [list, count] =
        await this.facilityUserService.getAllFacilityContacts(
          id,
          queryParamsDto,
          req.user,
        );

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Facility Contact')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facility Contact'),
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

  @Section(SECTIONS.facilities, SUB_SECTION.facilities)
  @Roles('admin', 'facility', 'facility_user')
  @Permission(PERMISSIONS.view)
  @FacilityContactPermission([FACILITY_CONTACT_PERMISSIONS.manage_team])
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('billing-contacts/:id')
  async getAllBillingContacts(
    @Param('id', UUIDValidationPipe) id: string,
    @Query() queryParamsDto: ContactFilterDto,
    @Req() req: IRequest,
  ) {
    try {
      const [list, count] =
        await this.facilityUserService.getAllBillingContacts(
          id,
          queryParamsDto,
          req.user,
        );

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Billing Contact')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Billing Contact'),
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

  @Section(SECTIONS.facilities, SUB_SECTION.facilities)
  @Roles('admin', 'facility', 'facility_user')
  @Permission(PERMISSIONS.edit)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Patch('edit-contact/:id')
  async updateContactProfile(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() updateFacilityUserDto: UpdateFacilityUserDto,
  ) {
    try {
      const user = await this.facilityUserService.findOneWhere({
        where: { id: id },
      });

      if (!user) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Record'),
          data: {},
        });
      }

      const { permissions } = updateFacilityUserDto;
      delete updateFacilityUserDto.permissions;

      const where = [];
      if (updateFacilityUserDto?.email) {
        where.push({
          email: updateFacilityUserDto.email,
          id: Not(id),
        });
      }

      if (
        updateFacilityUserDto?.country_code &&
        updateFacilityUserDto.mobile_no
      ) {
        where.push({
          country_code: updateFacilityUserDto.country_code,
          mobile_no: updateFacilityUserDto.mobile_no,
          id: Not(id),
        });
      }

      const emailOrMobileExists = where.length
        ? await this.facilityUserService.findOneWhere({
            where: where,
          })
        : null;

      if (emailOrMobileExists) {
        return response.badRequest({
          message: CONSTANT.ERROR.EMAIL_OR_MOBILE_ALREADY_EXIST,
          data: {},
        });
      }

      const data = await this.facilityUserService.update(
        id,
        updateFacilityUserDto,
      );

      if (permissions) {
        const existingPermissions =
          await this.facilityUserService.getFacilityPermissions({
            select: { id: true },
          });

        const permissionIds = existingPermissions.length
          ? existingPermissions.map((permission) => permission.id)
          : [];
        const permissionsToRemove = permissionIds.filter(
          (permission: any) => !permissions.includes(permission),
        );
        await this.facilityUserService.removePermissions(
          id,
          permissionsToRemove,
        );

        await this.facilityUserService.addPermissions(user, permissions);
      }
      return response.successResponse({
        message: data.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Contact')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Contact'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Patch('complete-profile/:id')
  async completeProfile(
    @Param('id') id: string,
    @Body() completeProfileDto: CompleteProfileDto,
  ) {
    try {
      const userId = await this.encryptDecryptService.decrypt(id);
      const facility = await this.facilityService.findOneWhere({
        where: { id: userId },
      });

      const isInvitationExist = await this.facilityService.isInvitationExist(
        facility,
        TABLE.facility,
        LINK_TYPE.invitation,
      );

      const isInvitationExpired =
        await this.facilityService.isInvitationExpired(
          facility,
          TABLE.facility,
        );

      if (!isInvitationExist || isInvitationExpired) {
        return response.badRequest({
          message: CONSTANT.ERROR.URL_EXPIRED,
          data: {},
        });
      }
      await this.facilityService.acceptInvitation(facility, TABLE.facility);

      if (!facility) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility'),
          data: {},
        });
      }

      if (completeProfileDto.image) {
        Object.assign(completeProfileDto, {
          base_url: process.env.AWS_ASSETS_PATH,
        });
      }

      const data = await this.facilityService.update(
        facility.id,
        completeProfileDto,
      );

      return response.successResponse({
        message: data.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Facility')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facility'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Section(SECTIONS.facilities, SUB_SECTION.facilities)
  @Roles('admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post('add-facility')
  async addFacility(
    @Body() addFacilityDto: AddFacilityDto,
    @Req() req: IRequest,
  ) {
    try {
      addFacilityDto.is_master = addFacilityDto.master_facility_id
        ? false
        : true;

      if (
        addFacilityDto.latitude == 0 &&
        addFacilityDto.longitude == 0 &&
        addFacilityDto.city
      ) {
        const cityRecord = await this.facilityService.getCityByName(
          addFacilityDto.city,
        );
        addFacilityDto.latitude = cityRecord ? +cityRecord.latitude : 0;
        addFacilityDto.longitude = cityRecord ? +cityRecord.longitude : 0;
      }

      if (
        addFacilityDto.latitude &&
        addFacilityDto.longitude &&
        !addFacilityDto.timezone
      ) {
        addFacilityDto.timezone = getTimezone(
          addFacilityDto.latitude,
          addFacilityDto.longitude,
        );
      }

      const isExists = await this.facilityService.checkName(
        addFacilityDto.name,
        addFacilityDto.mobile_no,
        addFacilityDto.email,
        addFacilityDto.is_corporate_client,
      );
      const clientType = addFacilityDto.is_corporate_client
        ? CLIENT_TYPE.corporate_client
        : CLIENT_TYPE.facility;

      if (isExists) {
        const value =
          isExists.name === addFacilityDto.name
            ? clientType
            : isExists.mobile_no === addFacilityDto.mobile_no
              ? `${clientType} Mobile No`
              : `${clientType} Email`;
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS(value),
          data: {},
        });
      }

      addFacilityDto.base_url = addFacilityDto.base_url
        ? addFacilityDto.base_url
        : process.env.AWS_ASSETS_PATH;

      const facility = await this.facilityService.create(
        addFacilityDto,
        addFacilityDto.is_corporate_client,
      );
      if (clientType === CLIENT_TYPE.corporate_client) {
        await this.facilityService.facilityActivityLog(
          req,
          facility.id,
          ACTIVITY_TYPE.CORPORATE_CLIENT_ADDED,
          { name: addFacilityDto.name },
          ACTION_TABLES.CORPORATE_CLIENT,
        );
      }

      if (clientType === CLIENT_TYPE.facility) {
        await this.facilityService.facilityActivityLog(
          req,
          facility.id,
          ACTIVITY_TYPE.FACILITY_ADDED,
          {
            name: addFacilityDto.name,
          },
        );
      }

      delete facility.password;
      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_CREATED(clientType),
        data: facility,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Section(SECTIONS.facilities, SUB_SECTION.facilities)
  @Roles('admin')
  @Permission(PERMISSIONS.edit)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Patch('setup/:id')
  async setupFacility(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() setupFacility: SetupFacility,
  ) {
    try {
      const facility = await this.facilityService.findOneWhere({
        where: {
          id,
        },
        relations: {
          facility_portal_setting: true,
          time_entry_setting: true,
          floor_detail: true,
        },
      });

      if (!facility) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility'),
          data: {},
        });
      }

      await this.facilityService.setupFacility(setupFacility, facility);

      return response.successResponse({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Facility Setup'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Section(SECTIONS.facilities, SUB_SECTION.facilities)
  @Roles('admin')
  @Permission(PERMISSIONS.edit)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Patch('detail/:id')
  async editFacility(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() updateFacilityDto: UpdateFacilityDetailDto,
    @Req() req: IRequest,
  ) {
    try {
      const facility = await this.facilityService.findOneWhere({
        where: { id },
      });

      if (!facility) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility'),
          data: {},
        });
      }

      if (
        updateFacilityDto.latitude == 0 &&
        updateFacilityDto.longitude == 0 &&
        updateFacilityDto.city
      ) {
        const cityRecord = await this.facilityService.getCityByName(
          updateFacilityDto.city,
        );
        updateFacilityDto.latitude = cityRecord ? +cityRecord.latitude : 0;
        updateFacilityDto.longitude = cityRecord ? +cityRecord.longitude : 0;
      }

      if (
        updateFacilityDto.latitude &&
        updateFacilityDto.longitude &&
        !updateFacilityDto.timezone
      ) {
        updateFacilityDto.timezone = getTimezone(
          updateFacilityDto.latitude,
          updateFacilityDto.longitude,
        );
      }
      updateFacilityDto.base_url = updateFacilityDto.base_url
        ? updateFacilityDto.base_url
        : process.env.AWS_ASSETS_PATH;
      const result = await this.facilityService.update(id, updateFacilityDto);

      const statusActive = await this.statusSettingService.findOneWhere({
        where: { name: active, status_for: USER_TYPE.facility },
      });
      if (updateFacilityDto.status !== statusActive.id) {
        await this.facilityService.deleteOpenShifts(facility);
        await this.facilityService.logoutAllFacilityUsers(facility);
      }

      // fetch updated facility details
      const updatedFacility = await this.facilityService.findOneWhere({
        where: { id },
      });
      const clientType = facility.is_corporate_client
        ? CLIENT_TYPE.corporate_client
        : CLIENT_TYPE.facility;

      if (clientType === CLIENT_TYPE.corporate_client) {
        await this.facilityService.facilityActivityUpdateLog(
          req,
          facility.id,
          ACTIVITY_TYPE.CORPORATE_CLIENT_UPDATED,
          facility,
          updatedFacility,
          [...Object.keys(updateFacilityDto)],
          ACTION_TABLES.CORPORATE_CLIENT,
        );
      }

      if (clientType === CLIENT_TYPE.facility) {
        await this.facilityService.facilityActivityUpdateLog(
          req,
          facility.id,
          ACTIVITY_TYPE.FACILITY_DETAILS_UPDATED,
          facility,
          updatedFacility,
          [
            'name',
            'status',
            'country_code',
            'mobile_no',
            'email',
            'facility_type',
            'total_beds',
            'house_no',
            'street_address',
            'zip_code',
            'latitude',
            'longitude',
            'country',
            'city',
            'state',
            'timezone',
            'employee_id',
            'first_shift',
            'orientation',
            'shift_description',
            'breaks_instruction',
            'dress_code',
            'parking_instruction',
            'doors_locks',
            'timekeeping',
            'general_notes',
            'staff_note',
            'bill_notes',
            'website',
            'is_corporate_client',
          ].filter((key) => key in updateFacilityDto),
        );
      }

      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Facility Detail')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Facility'),
        data: {},
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('setting/:id')
  async getFacilitySetting(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const facility = await this.facilityService.findOneWhere({
        where: { id },
        relations: {
          facility_portal_setting: true,
          time_entry_setting: true,
          shift_setting: true,
        },
        select: {
          id: true,
          work_comp_code: true,
          latitude: true,
          longitude: true,
          street_address: true,
          house_no: true,
          state: true,
          city: true,
          zip_code: true,
          shift_setting: {
            id: true,
            start_time: true,
            end_time: true,
            name: true,
            is_default: true,
            status: true,
            shift_time_id: true,
          },
          time_entry_setting: {
            id: true,
            timecard_rounding: true,
            timecard_rounding_direction: true,
            default_lunch_duration: true,
            time_approval_method: true,
            allowed_entries: true,
            check_missed_meal_break: true,
            location: true,
          },
          facility_portal_setting: {
            id: true,
            allow_cancellation: true,
            cancellation_advance: true,
            scheduling_warnings: true,
            client_confirmation: true,
          },
        },
      });

      if (!facility) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility'),
          data: {},
        });
      }

      if (!facility.shift_setting.length) {
        const setting = await this.facilityService.getFacilityShiftSettings({
          where: [{ facility: { id } }, { is_default: true }],
        });
        facility.shift_setting = setting;
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Facility Setting'),
        data: facility,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Section(SECTIONS.facilities, SUB_SECTION.facilities)
  @Roles('admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('setting/v2/:id')
  async getFacilitySettingV2(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const facility = await this.facilityService.getFacilityShiftSettingV2(id);

      if (!facility) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility'),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Facility Setting'),
        data: facility,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Section(SECTIONS.facilities, SUB_SECTION.facilities)
  @Roles('admin')
  @Permission(PERMISSIONS.edit_settings)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Patch('setting/:id')
  async updateFacilitySetting(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() updateFacilitySettingDto: UpdateFacilitySettingDto,
    @Req() req: IRequest,
  ) {
    try {
      const facility = await this.facilityService.findOneWhere({
        where: { id },
      });

      if (!facility) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility'),
          data: {},
        });
      }

      const {
        time_entry_setting,
        facility_portal_setting,
        accounting_setting,
        shift_setting = [],
        ...dto
      } = updateFacilitySettingDto;

      // old setting
      const oldSetting =
        await this.facilityService.getFacilityShiftSettingV2(id);

      const result = await this.facilityService.updateWhere({ id }, dto);

      if (time_entry_setting) {
        time_entry_setting.facility = id;
        await this.facilityService.updateTimeEntrySettings(
          { facility: { id } },
          time_entry_setting,
        );
      }

      if (facility_portal_setting) {
        facility_portal_setting.facility = id;
        await this.facilityService.updateFacilityPortalSettings(
          { facility: { id } },
          facility_portal_setting,
        );
      }

      if (shift_setting.length) {
        shift_setting.forEach((setting) => {
          setting.facility = id;
        });
        await this.facilityService.updateShiftSettings(shift_setting);
      }

      if (accounting_setting) {
        accounting_setting.facility = id;
        await this.facilityService.updateAccountingSettings(
          { facility: { id } },
          accounting_setting,
        );
      }

      const updatedSetting =
        await this.facilityService.getFacilityShiftSettingV2(id);

      await this.facilityService.facilityActivityUpdateLog(
        req,
        facility.id,
        ACTIVITY_TYPE.FACILITY_SETTINGS_UPDATED,
        {
          name: oldSetting.name,
          is_floor: oldSetting.is_floor,
          floor_detail: oldSetting.floor_detail,
          orientation_enabled: oldSetting.orientation_enabled,
          orientation_process: oldSetting.orientation_process,
          work_comp_code: oldSetting.work_comp_code,
          certificate: oldSetting.certificate,
          speciality: oldSetting.speciality,
          time_entry_setting: oldSetting.time_entry_setting,
          facility_portal_setting: oldSetting.facility_portal_setting,
          accounting_setting: oldSetting.accounting_setting,
          shift_setting: oldSetting.shift_setting,
        },
        {
          name: updatedSetting.name,
          is_floor: updatedSetting.is_floor,
          floor_detail: updatedSetting.floor_detail,
          orientation_enabled: updatedSetting.orientation_enabled,
          orientation_process: updatedSetting.orientation_process,
          work_comp_code: updatedSetting.work_comp_code,
          certificate: updatedSetting.certificate,
          speciality: updatedSetting.speciality,
          time_entry_setting: updatedSetting.time_entry_setting,
          facility_portal_setting: updatedSetting.facility_portal_setting,
          accounting_setting: updatedSetting.accounting_setting,
          shift_setting: updatedSetting.shift_setting,
        },
        [
          'is_floor',
          'floor_detail',
          'orientation_enabled',
          'orientation_process',
          'work_comp_code',
          'certificate',
          'speciality',
          'time_entry_setting.*',
          'facility_portal_setting.*',
          'shift_setting.*',
          'accounting_setting.*',
        ], // keys passed exactly as required by your old logger
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Facility Setting')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Facility Setting'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('verification')
  async getAllVerification(@Query() filterFacilityDto: FilterFacilityDto) {
    try {
      const where = {
        status: {
          name: prospect,
        },
      };

      if (filterFacilityDto.search) {
        Object.assign(where, {
          name: ILike(`%${parseSearchKeyword(filterFacilityDto.search)}%`),
        });
      }

      if (filterFacilityDto.type) {
        Object.assign(where, {
          facility_type: {
            name: ILike(`%${parseSearchKeyword(filterFacilityDto.type)}%`),
          },
        });
      }
      const [list, count] = await this.facilityService.findAll({
        where: where,
        relations: {
          status: true,
          facility_type: true,
        },
        select: {
          id: true,
          name: true,
          country_code: true,
          mobile_no: true,
          street_address: true,
          house_no: true,
          state: true,
          city: true,
          country: true,
          facility_type: {
            id: true,
            name: true,
            work_comp_code: true,
          },
          total_beds: true,
          email: true,
          base_url: true,
          image: true,
          created_at: true,
          updated_at: true,
          status: {
            id: true,
            name: true,
            background_color: true,
            text_color: true,
          },
        },
        take: +filterFacilityDto.limit,
        skip: +filterFacilityDto.offset,
        order: filterFacilityDto.order,
      });

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Facility')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facility'),
        total: count,
        limit: +filterFacilityDto.limit,
        offset: +filterFacilityDto.offset,
        data: list,
      };

      return response.successResponseWithPagination(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch('approve/:id')
  async approveFacility(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const facility = await this.facilityService.findOneWhere({
        where: {
          id,
        },
      });

      if (!facility) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility'),
          data: {},
        });
      }

      if (
        !facility.orientation_process ||
        !facility.certificate ||
        !facility.speciality
      ) {
        return response.badRequest({
          message: CONSTANT.ERROR.FACILITY_ORIENTATION_PENDING,
          data: {},
        });
      }

      const setting = await this.statusSettingService.findOneWhere({
        where: {
          name: active,
        },
      });

      const result = await this.facilityService.updateWhere(
        { id },
        { status: setting.id },
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.SUCCESSFULLY('Facility Approved')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Facility'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch('reject/:id')
  async rejectFacility(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() rejectFacilityDto: RejectFacilityDto,
  ) {
    try {
      const facility = await this.facilityService.findOneWhere({
        where: {
          id,
        },
      });

      if (!facility) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility'),
          data: {},
        });
      }

      const setting = await this.statusSettingService.findOneWhere({
        where: {
          name: in_active,
        },
      });

      rejectFacilityDto.status = setting.id;

      const result = await this.facilityService.updateWhere(
        { id },
        { ...rejectFacilityDto },
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.SUCCESSFULLY('Facility Rejected')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Facility'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('sub-facilities/:id') // master facility id
  async getSubFacility(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const [list, count] = await this.facilityService.findAll({
        where: { master_facility_id: id },
        relations: {
          status: true,
          super_facility_user: true,
        },
        select: {
          id: true,
          name: true,
          street_address: true,
          house_no: true,
          state: true,
          city: true,
          country: true,
          email: true,
          base_url: true,
          image: true,
          is_master: true,
          master_facility_id: true,
          created_at: true,
          updated_at: true,
          super_facility_user: {
            id: true,
            first_name: true,
            last_name: true,
          },
          status: {
            id: true,
            name: true,
            background_color: true,
            text_color: true,
          },
        },
      });

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Sub Facility')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Sub Facility'),
        total: count,
        limit: 10,
        offset: 0,
        data: list,
      };

      return response.successResponseWithPagination(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get(':id/metrics')
  async getFacilityMetrics(
    @Param('id', UUIDValidationPipe) id: string,
    @Query() queryParamsDto: FilterFacilityDto,
  ) {
    try {
      const metrics = await this.facilityService.getMetrics(id, queryParamsDto);
      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Facility Metrics'),
        data: metrics,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
