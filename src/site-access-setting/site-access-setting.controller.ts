import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SiteAccessSettingService } from './site-access-setting.service';
import { CreateSiteAccessSettingDto } from './dto/create-site-access-setting.dto';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { Roles } from '@/shared/decorator/role.decorator';
import s3DeleteFile from '@/shared/helpers/s3-delete-file';

@Controller('site-access-setting')
export class SiteAccessSettingController {
  constructor(
    private readonly siteAccessSettingService: SiteAccessSettingService,
  ) {}

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post()
  async create(@Body() createSiteAccessSettingDto: CreateSiteAccessSettingDto) {
    try {
      const setting = await this.siteAccessSettingService.findOneWhere({
        where: {},
      });

      if (setting) {
        Object.assign(createSiteAccessSettingDto, { id: setting.id });
      }

      if (createSiteAccessSettingDto?.image) {
        Object.assign(createSiteAccessSettingDto, {
          base_url: process.env.AWS_ASSETS_PATH,
        });
        if (
          setting?.image &&
          setting.image !== createSiteAccessSettingDto.image
        ) {
          await s3DeleteFile(setting.image);
        }
      }

      await this.siteAccessSettingService.create(createSiteAccessSettingDto);

      return response.successResponse({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Site Setting Saved'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get()
  async findOne() {
    try {
      const data = await this.siteAccessSettingService.findOneWhere({
        where: {},
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Site Setting'),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Site Setting'),
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
