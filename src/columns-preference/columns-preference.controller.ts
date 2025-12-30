import {
  Controller,
  Patch,
  Body,
  UseGuards,
  Req,
  Get,
  Query,
} from '@nestjs/common';
import { ColumnsPreferenceService } from './columns-preference.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { Roles } from '@/shared/decorator/role.decorator';
import { IRequest } from '@/shared/constants/types';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { UpdateColumnsPreferenceDto } from '@/columns-preference/dto/update-columns-preference.dto';
import { TableTypesColumns } from '@/shared/constants/default-column-preference';

@Controller('columns-preference')
export class ColumnsPreferenceController {
  constructor(
    private readonly columnsPreferenceService: ColumnsPreferenceService,
  ) {}

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get()
  async getColumnsPreference(
    @Req() req: IRequest,
    @Query('table_type') tableType: string,
  ) {
    try {
      const preference = await this.columnsPreferenceService.findOne({
        where: { user_id: req.user.id, table_type: tableType },
      });

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Columns Preference'),
        data: preference
          ? preference.columns_config
          : TableTypesColumns[tableType],
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch()
  async updateColumnsPreference(
    @Req() req: IRequest,
    @Body() updateDto: UpdateColumnsPreferenceDto,
  ) {
    try {
      const preference = await this.columnsPreferenceService.findOne({
        where: { user_id: req.user.id, table_type: updateDto.table_type },
      });

      if (!preference) {
        await this.columnsPreferenceService.create({
          user_id: req.user.id,
          table_type: updateDto.table_type,
          columns_config: updateDto.columns_config,
        });

        return response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Columns Preference'),
          data: updateDto.columns_config,
        });
      }
      const result = await this.columnsPreferenceService.update(
        preference.id,
        updateDto,
      );

      return response.successResponse({
        message: result
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Columns Preference')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Columns Preference'),
        data: result ? result.columns_config : {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
