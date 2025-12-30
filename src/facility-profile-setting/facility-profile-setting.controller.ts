import { Controller, Get, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { FacilityProfileSettingService } from './facility-profile-setting.service';
import { UpdateFacilityProfileSettingDto } from './dto/update-facility-profile-setting.dto';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { Roles } from '@/shared/decorator/role.decorator';
import { RoleGuard } from '@/shared/guard/role.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('facility-profile-setting')
export class FacilityProfileSettingController {
  constructor(
    private readonly facilityProfileSettingService: FacilityProfileSettingService,
  ) {}

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get()
  async findAll() {
    try {
      const data = await this.facilityProfileSettingService.findAll();

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Facility Profile Setting'),
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch(':id')
  async update(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() updateFacilityProfileSettingDto: UpdateFacilityProfileSettingDto,
  ) {
    try {
      const data = await this.facilityProfileSettingService.findOneWhere({
        where: { id },
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility Profile Setting'),
          data: {},
        });
      }

      const result = await this.facilityProfileSettingService.update(
        { id },
        updateFacilityProfileSettingDto,
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Facility Profile Setting')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facility Profile Setting'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
