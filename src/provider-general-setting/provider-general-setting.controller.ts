import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProviderGeneralSettingService } from './provider-general-setting.service';
import {
  DEFAULT_STATUS,
  PERMISSIONS,
  SECTIONS,
  SUB_SECTION,
} from '@/shared/constants/enum';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '@/shared/decorator/role.decorator';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { RoleGuard } from '@/shared/guard/role.guard';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Section(SECTIONS.staff_app_settings, SUB_SECTION.general_settings)
@Controller('provider-general-setting')
export class ProviderGeneralSettingController {
  constructor(
    private readonly providerGeneralSettingService: ProviderGeneralSettingService,
  ) {}

  @Roles('provider')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('heard-places')
  async getHeardPlaces() {
    try {
      const result =
        await this.providerGeneralSettingService.findOneSectionWhere({
          where: {
            key: 'heard_about_us',
            sub_section: {
              status: DEFAULT_STATUS.active,
            },
          },
          relations: {
            sub_section: true,
          },
          select: {
            id: true,
            name: true,
            sub_section: {
              id: true,
              name: true,
              has_remark: true,
              status: true,
            },
          },
        });

      const data = {
        message: result
          ? CONSTANT.SUCCESS.RECORD_FOUND('Heard places')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Heard places'),
        data: result ? result : {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('acknowledgement')
  async getAcknowledgeMentQuestion() {
    try {
      const result =
        await this.providerGeneralSettingService.findOneSectionWhere({
          where: {
            key: 'acknowledgement_question',
            sub_section: {
              status: DEFAULT_STATUS.active,
            },
          },
          relations: {
            sub_section: true,
          },
          order: {
            sub_section: {
              order: 'ASC',
            },
          },
          select: {
            id: true,
            name: true,
            sub_section: {
              id: true,
              name: true,
              order: true,
              has_remark: true,
              status: true,
              placeholder: true,
              instruction: true,
            },
          },
        });

      const data = {
        message: result
          ? CONSTANT.SUCCESS.RECORD_FOUND('Acknowledgement Question')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Acknowledgement Question'),
        data: result ? result : {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('all')
  async getAllGeneralSetting() {
    try {
      const result =
        await this.providerGeneralSettingService.findAllSectionWhere({
          relations: {
            sub_section: true,
          },
          order: {
            order: 'ASC',
            sub_section: {
              order: 'ASC',
            },
          },
          select: {
            id: true,
            name: true,
            order: true,
            sub_section: {
              id: true,
              name: true,
              order: true,
              placeholder: true,
              has_remark: true,
              status: true,
              type: true,
              created_at: true,
            },
          },
        });

      const data = {
        message: result
          ? CONSTANT.SUCCESS.RECORD_FOUND('General Setting')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('General Setting'),
        data: result ? result : [],
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.add)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post('create-source')
  async createSource(@Body() createSourceDto: CreateSourceDto) {
    try {
      createSourceDto.key = createSourceDto.name
        .toLowerCase()
        .replaceAll(/\s+/g, '_');

      const section =
        await this.providerGeneralSettingService.findOneSourceName(
          createSourceDto.name,
        );

      if (section) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Source'),
          data: {},
        });
      }
      const sources =
        await this.providerGeneralSettingService.findOneSectionWhere({
          where: {
            key: 'heard_about_us',
          },
          relations: {
            sub_section: true,
          },
          select: {
            id: true,
            name: true,
            sub_section: {
              id: true,
              name: true,
              has_remark: true,
              status: true,
            },
          },
        });

      createSourceDto.order = sources.sub_section.length + 1;

      const result =
        await this.providerGeneralSettingService.createSource(createSourceDto);

      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Source Name'),
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
      const section =
        await this.providerGeneralSettingService.findOneSubSection({
          where: {
            id: id,
          },
        });

      if (!section) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Sub Section'),
          data: {},
        });
      }
      const data = await this.providerGeneralSettingService.updateSubSection(
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
}
