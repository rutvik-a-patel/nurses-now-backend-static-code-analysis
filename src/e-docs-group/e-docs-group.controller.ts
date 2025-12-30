import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Delete,
  Query,
} from '@nestjs/common';
import { EDocsGroupService } from './e-docs-group.service';
import { CreateEDocsGroupDto } from './dto/create-e-docs-group.dto';
import { UpdateEDocsGroupDto } from './dto/update-e-docs-group.dto';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { ILike } from 'typeorm';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { PERMISSIONS, SECTIONS, SUB_SECTION } from '@/shared/constants/enum';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Section(SECTIONS.staff_app_settings, SUB_SECTION.edoc_settings)
@Controller('e-docs-group')
export class EDocsGroupController {
  constructor(private readonly eDocsGroupService: EDocsGroupService) {}

  @Roles('admin')
  @Permission(PERMISSIONS.add)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post()
  async create(@Body() createEDocsGroupDto: CreateEDocsGroupDto) {
    try {
      const alreadyExists = await this.eDocsGroupService.checkName(
        createEDocsGroupDto.name,
      );

      if (alreadyExists) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('E-Docs Group'),
          data: {},
        });
      }

      const data = await this.eDocsGroupService.create(createEDocsGroupDto);

      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('E-Docs Group'),
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get()
  async findAll(@Query() query: QueryParamsDto) {
    try {
      const list = await this.eDocsGroupService.findAll({
        relations: {
          document: true,
        },
        where: query.search
          ? [
              { name: ILike(`%${query.search.trim()}%`) },
              {
                document: { name: ILike(`%${query.search.trim()}%`) },
              },
            ]
          : {},
        order: {
          created_at: 'DESC',
          document: {
            created_at: 'DESC',
          },
        },
      });

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('E-Docs Group'),
        data: list,
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
    @Body() updateEDocsGroupDto: UpdateEDocsGroupDto,
  ) {
    try {
      const docGroup = await this.eDocsGroupService.findOneWhere({
        where: { id },
      });

      if (!docGroup) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('E-Docs Group'),
          data: {},
        });
      }

      const alreadyExists = await this.eDocsGroupService.checkName(
        updateEDocsGroupDto.name,
      );

      if (alreadyExists && alreadyExists.id !== id) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('E-Docs Group'),
          data: {},
        });
      }

      const result = await this.eDocsGroupService.updateWhere(
        { id },
        updateEDocsGroupDto,
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('E-Docs Group')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('E-Docs Group'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Delete(':id')
  async remove(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const docGroup = await this.eDocsGroupService.findOneWhere({
        where: { id },
      });

      if (!docGroup) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('E-Docs Group'),
          data: {},
        });
      }

      const isGroupUsed = await this.eDocsGroupService.isGroupUsed(id);

      if (isGroupUsed) {
        return response.badRequest({
          message: CONSTANT.ERROR.CANNOT_DELETE('E-Docs Group'),
          data: {},
        });
      }

      await this.eDocsGroupService.remove(id);

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_DELETED('E-Doc'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
