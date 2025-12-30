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
import { AdminDocumentService } from './admin-document.service';
import { CreateAdminDocumentDto } from './dto/create-admin-document.dto';
import { UpdateAdminDocumentDto } from './dto/update-admin-document.dto';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import { DeleteDto } from '@/shared/dto/delete.dto';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { PERMISSIONS, SECTIONS, SUB_SECTION } from '@/shared/constants/enum';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Section(SECTIONS.admin_portal_settings, SUB_SECTION.document_categories)
@Controller('admin-document')
export class AdminDocumentController {
  constructor(private readonly adminDocumentService: AdminDocumentService) {}

  @Roles('admin')
  @Permission(PERMISSIONS.add)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post()
  async create(@Body() createAdminDocumentDto: CreateAdminDocumentDto) {
    try {
      const isExist = await this.adminDocumentService.checkName(
        createAdminDocumentDto.name,
        createAdminDocumentDto.category,
      );

      if (isExist) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Category'),
          data: {},
        });
      }

      const result = await this.adminDocumentService.create(
        createAdminDocumentDto,
      );

      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Category'),
        data: result,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get()
  async findAll() {
    try {
      const list = await this.adminDocumentService.findAll();

      return response.successResponse({
        message: list.length
          ? CONSTANT.SUCCESS.RECORD_FOUND('Category')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Category'),
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
    @Body() updateAdminDocumentDto: UpdateAdminDocumentDto,
  ) {
    try {
      const category = await this.adminDocumentService.findOneWhere({
        where: { id },
      });

      if (!category) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Category'),
          data: {},
        });
      }

      const name = updateAdminDocumentDto.name
        ? updateAdminDocumentDto.name
        : category.name;
      const docCategory = updateAdminDocumentDto.category
        ? updateAdminDocumentDto.category
        : category.category;

      const isExist = await this.adminDocumentService.checkName(
        name,
        docCategory,
        category.id,
      );

      if (isExist) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Category'),
          data: {},
        });
      }

      const result = await this.adminDocumentService.update(
        { id },
        updateAdminDocumentDto,
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Category')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Category'),
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
      const category = await this.adminDocumentService.findOneWhere({
        where: { id },
      });

      if (!category) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Category'),
          data: {},
        });
      }

      const isAlreadyInUse = await this.adminDocumentService.isAlreadyInUse(id);
      if (isAlreadyInUse) {
        return response.badRequest({
          message: CONSTANT.ERROR.CANNOT_DELETE('Category'),
          data: {},
        });
      }

      const result = await this.adminDocumentService.remove({ id }, deleteDto);

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Category')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Category'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
