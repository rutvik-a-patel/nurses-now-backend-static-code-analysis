import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EDocsService } from './e-docs.service';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { CreateEDocDto } from './dto/create-e-doc.dto';
import { CONSTANT } from '@/shared/constants/message';
import response from '@/shared/response';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import { UpdateEDocDto } from './dto/update-e-doc.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { PERMISSIONS, SECTIONS, SUB_SECTION } from '@/shared/constants/enum';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Section(SECTIONS.staff_app_settings, SUB_SECTION.edoc_settings)
@Controller('e-docs')
export class EDocsController {
  constructor(private readonly eDocsService: EDocsService) {}

  @Roles('admin')
  @Permission(PERMISSIONS.add)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post()
  async create(@Body() createEDocDto: CreateEDocDto) {
    try {
      const alreadyExists = await this.eDocsService.checkName(
        createEDocDto.name,
        createEDocDto.document_group,
      );

      if (alreadyExists) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('E-Doc'),
          data: {},
        });
      }

      Object.assign(createEDocDto, { base_url: process.env.AWS_ASSETS_PATH });

      const data = await this.eDocsService.create(createEDocDto);

      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('E-Doc'),
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
    @Body() updateEDocDto: UpdateEDocDto,
  ) {
    try {
      const docGroup = await this.eDocsService.findOneWhere({
        where: { id },
      });

      if (!docGroup) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('E-Doc'),
          data: {},
        });
      }

      const alreadyExists = await this.eDocsService.checkName(
        updateEDocDto.name,
        updateEDocDto.document_group,
      );

      if (alreadyExists && alreadyExists.id !== id) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('E-Doc'),
          data: {},
        });
      }

      Object.assign(updateEDocDto, { base_url: process.env.AWS_ASSETS_PATH });
      const result = await this.eDocsService.updateWhere({ id }, updateEDocDto);

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('E-Doc')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('E-Doc'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get(':id')
  async findOne(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const docGroup = await this.eDocsService.findOneWhere({
        where: { id },
      });

      if (!docGroup) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('E-Doc'),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('E-Doc'),
        data: docGroup,
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
      const data = await this.eDocsService.findOneWhere({
        where: { id: id },
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('E-Doc'),
          data: {},
        });
      }

      const isEDocUsed = await this.eDocsService.isEDocUsed(id);

      if (isEDocUsed) {
        return response.badRequest({
          message: CONSTANT.ERROR.CANNOT_DELETE('E-Doc'),
          data: {},
        });
      }

      const result = await this.eDocsService.remove(id, deleteDto);

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('E-Doc')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('E-Doc'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
