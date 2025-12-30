import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProviderProfileSettingService } from './provider-profile-setting.service';
import {
  DEFAULT_STATUS,
  PERMISSIONS,
  SECTIONS,
  SUB_SECTION,
} from '@/shared/constants/enum';
import { CONSTANT } from '@/shared/constants/message';
import response from '@/shared/response';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { RoleGuard } from '@/shared/guard/role.guard';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Section(SECTIONS.staff_app_settings, SUB_SECTION.staff_profile)
@Controller('provider-profile-setting')
export class ProviderProfileSettingController {
  constructor(
    private readonly providerProfileSettingService: ProviderProfileSettingService,
  ) {}

  @Roles('admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get()
  async findAll() {
    try {
      const result = await this.providerProfileSettingService.findAll({
        where: {
          section: {
            status: DEFAULT_STATUS.active,
          },
        },
        select: {
          id: true,
          name: true,
        },
      });
      const data = {
        message: result
          ? CONSTANT.SUCCESS.RECORD_FOUND('Staff Profile Setting')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff Profile Setting'),
        data: result ? result : [],
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get(':id')
  async findOneSetting(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const result = await this.providerProfileSettingService.findOneWhere({
        where: {
          id: id,
        },
        relations: {
          section: {
            sub_section: true,
          },
        },
        order: {
          section: {
            order: 'ASC',
            sub_section: {
              order: 'ASC',
            },
          },
        },
        select: {
          id: true,
          name: true,
          section: {
            id: true,
            name: true,
            status: true,
            order: true,
            created_at: true,
            sub_section: {
              id: true,
              order: true,
              name: true,
              status: true,
              is_required: true,
              created_at: true,
            },
          },
        },
      });

      if (!result) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff Profile Setting'),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Staff Profile Setting'),
        data: result,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.edit)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Patch(':id')
  async updateSetting(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() updateSettingDto: UpdateSettingDto,
  ) {
    try {
      const section = await this.providerProfileSettingService.findOneWhere({
        where: {
          section: {
            sub_section: {
              id: id,
            },
          },
        },
      });

      if (!section) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Sub Section'),
          data: {},
        });
      }
      const data = await this.providerProfileSettingService.updateSubSection(
        id,
        updateSettingDto,
      );
      return response.successResponse({
        message: data.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Sub Section')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Sub Section'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('profile/form')
  async getProfileSettingData(@Query('name') name: string) {
    try {
      const result = await this.providerProfileSettingService.findOneWhere({
        where: {
          key: name,
          section: {
            sub_section: {
              status: DEFAULT_STATUS.active,
            },
          },
        },
        relations: {
          section: {
            sub_section: true,
          },
        },
        order: {
          section: {
            order: 'ASC',
            sub_section: {
              order: 'ASC',
            },
          },
        },
        select: {
          id: true,
          name: true,
          section: {
            id: true,
            name: true,
            order: true,
            created_at: true,
            sub_section: {
              id: true,
              name: true,
              key: true,
              order: true,
              status: true,
              type: true,
              is_required: true,
            },
          },
        },
      });
      const data = {
        message: result
          ? CONSTANT.SUCCESS.RECORD_FOUND('Staff Profile Setting')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff Profile Setting'),
        data: result ? result : {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
