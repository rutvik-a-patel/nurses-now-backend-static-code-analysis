import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReferenceFormGlobalSettingService } from './reference-form-global-setting.service';
import { CreateReferenceFormGlobalSettingDto } from './dto/create-reference-form-global-setting.dto';
import { UpdateReferenceFormGlobalSettingDto } from './dto/update-reference-form-global-setting.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { CONSTANT } from '@/shared/constants/message';
import { Roles } from '@/shared/decorator/role.decorator';
import { RoleGuard } from '@/shared/guard/role.guard';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import response from '@/shared/response';

@Controller('reference-form-global-setting')
export class ReferenceFormGlobalSettingController {
  constructor(
    private readonly referenceFormGlobalSettingService: ReferenceFormGlobalSettingService,
  ) {}

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post()
  async create(
    @Body()
    createReferenceFormGlobalSettingDto: CreateReferenceFormGlobalSettingDto,
  ) {
    try {
      const result = await this.referenceFormGlobalSettingService.create(
        createReferenceFormGlobalSettingDto,
      );
      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_CREATED(
          'Reference Form Global Setting',
        ),
        data: result,
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
      const result = await this.referenceFormGlobalSettingService.findOne({
        where: {},
      });

      return response.successResponse({
        message: result
          ? CONSTANT.SUCCESS.RECORD_FOUND('Reference Form Global Setting')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Setting'),
        data: result,
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
    @Body()
    updateReferenceFormGlobalSettingDto: UpdateReferenceFormGlobalSettingDto,
  ) {
    try {
      const setting = await this.referenceFormGlobalSettingService.findOneWhere(
        {
          where: { id },
        },
      );

      await this.referenceFormGlobalSettingService.update(
        id,
        updateReferenceFormGlobalSettingDto,
      );

      return response.successResponse({
        message: setting
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Reference Form Global Setting')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Reference Form Global Setting'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Delete(':id')
  async remove(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() deleteDto: DeleteDto,
  ) {
    try {
      const setting = await this.referenceFormGlobalSettingService.findOneWhere(
        {
          where: { id },
        },
      );

      if (!setting) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND(
            'Reference Form Global Setting',
          ),
          data: {},
        });
      }

      const result = await this.referenceFormGlobalSettingService.remove(
        id,
        deleteDto,
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Reference Form Global Setting')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Reference Form Global Setting'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
