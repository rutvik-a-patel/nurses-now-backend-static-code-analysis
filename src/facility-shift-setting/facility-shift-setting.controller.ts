import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FacilityShiftSettingService } from './facility-shift-setting.service';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { CreateFacilityShiftSettingDto } from './dto/create-facility-shift-setting.dto';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { TimingSettingDto } from './dto/facility-setting-filter.dto';
import { UpdateFacilityShiftSettingDto } from './dto/update-facility-shift-setting.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { PERMISSIONS, SECTIONS, SUB_SECTION } from '@/shared/constants/enum';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Section(SECTIONS.facility_portal_settings, SUB_SECTION.shifts)
@Controller('facility-shift-setting')
export class FacilityShiftSettingController {
  constructor(
    private readonly facilityShiftSettingService: FacilityShiftSettingService,
  ) {}

  @Roles('admin', 'facility', 'facility_user')
  @Permission(PERMISSIONS.add)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post()
  async createShiftSetting(
    @Body() createFacilityShiftSettingDto: CreateFacilityShiftSettingDto,
  ) {
    try {
      const isExist = await this.facilityShiftSettingService.checkName(
        createFacilityShiftSettingDto.name,
      );

      if (isExist) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Shift Timing'),
          data: {},
        });
      }

      const result = await this.facilityShiftSettingService.create(
        createFacilityShiftSettingDto,
      );
      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Shift Timing'),
        data: result,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get()
  async findAll(@Query() queryParamsDto: TimingSettingDto) {
    try {
      const [list, count] =
        await this.facilityShiftSettingService.findAllShiftTimeWithCode(
          queryParamsDto,
        );

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Shift Timing')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift Timing'),
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
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get(':id')
  async findOne(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const result = await this.facilityShiftSettingService.findOneWhere({
        where: { id },
      });
      if (!result) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift Timing'),
          data: {},
        });
      }
      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Shift Timing'),
        data: result,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @Permission(PERMISSIONS.edit)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Patch(':id')
  async update(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() updateFacilityShiftSettingDto: UpdateFacilityShiftSettingDto,
  ) {
    try {
      const setting = await this.facilityShiftSettingService.findOneWhere({
        where: { id },
      });

      if (!setting) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift Timing'),
          data: {},
        });
      }

      const name = updateFacilityShiftSettingDto.name
        ? updateFacilityShiftSettingDto.name
        : setting.name;

      const isExist = await this.facilityShiftSettingService.checkName(
        name,
        setting.id,
      );

      if (isExist) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Shift Timing'),
          data: {},
        });
      }

      const result = await this.facilityShiftSettingService.updateWhere(
        { id },
        updateFacilityShiftSettingDto,
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Shift Timing')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift Timing'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Delete(':id')
  async remove(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() deleteDto: DeleteDto,
  ) {
    try {
      const result = await this.facilityShiftSettingService.remove(
        id,
        deleteDto,
      );

      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Shift Timing')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift Timing'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
