import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FacilityGeneralSettingService } from './facility-general-setting.service';
import { UpdateFacilityGeneralSettingDto } from './dto/update-facility-general-setting.dto';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import response from '@/shared/response';
import {
  FACILITY_GENERAL_SETTING_TYPE,
  PERMISSIONS,
  SECTIONS,
  SUB_SECTION,
} from '@/shared/constants/enum';
import { CONSTANT } from '@/shared/constants/message';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Section(
  SECTIONS.facility_portal_settings,
  SUB_SECTION.facility_general_settings,
)
@Controller('facility-general-setting')
export class FacilityGeneralSettingController {
  constructor(
    private readonly facilityGeneralSettingService: FacilityGeneralSettingService,
  ) {}

  @Roles('admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get()
  async findAll(@Query('type') type: FACILITY_GENERAL_SETTING_TYPE) {
    try {
      const data = await this.facilityGeneralSettingService.findAll({
        where: { type },
        order: { created_at: 'ASC' },
      });

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Facility General Settings'),
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
  async update(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() updateFacilityGeneralSettingDto: UpdateFacilityGeneralSettingDto,
  ) {
    try {
      const data = await this.facilityGeneralSettingService.findOneWhere({
        where: { id },
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility General Settings'),
          data: data,
        });
      }

      const result = await this.facilityGeneralSettingService.update(
        { id },
        updateFacilityGeneralSettingDto,
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Facility General Settings')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Facility General Settings'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
