import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CredentialsCategoryService } from './credentials-category.service';
import { CreateCredentialsCategoryDto } from './dto/create-credentials-category.dto';
import { UpdateCredentialsCategoryDto } from './dto/update-credentials-category.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { Roles } from '@/shared/decorator/role.decorator';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import { FilterCredentialsDto } from './dto/filter-credentials.dto';
import { PERMISSIONS, SECTIONS, SUB_SECTION } from '@/shared/constants/enum';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Section(SECTIONS.admin_portal_settings, SUB_SECTION.compliance_manager)
@Controller('credentials-category')
export class CredentialsCategoryController {
  constructor(
    private readonly credentialsCategoryService: CredentialsCategoryService,
  ) {}

  @Roles('admin')
  @Permission(PERMISSIONS.add)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post()
  async create(
    @Body() createCredentialsCategoryDto: CreateCredentialsCategoryDto,
  ) {
    try {
      const category = await this.credentialsCategoryService.checkName(
        createCredentialsCategoryDto.name,
      );

      if (category) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Credential Category'),
          data: {},
        });
      }

      const data = await this.credentialsCategoryService.create(
        createCredentialsCategoryDto,
      );

      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Credential Category'),
        data: data,
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
      const data = await this.credentialsCategoryService.findOneWhere({
        where: { id: id },
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Credential Category'),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Credential Category'),
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
  async findAll(@Query() filterCredentialsDto: FilterCredentialsDto) {
    try {
      const data =
        await this.credentialsCategoryService.findAll(filterCredentialsDto);

      return response.successResponse({
        message: data.length
          ? CONSTANT.SUCCESS.RECORD_FOUND('Credential Category')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Credential Category'),
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
    @Body() updateCredentialsCategoryDto: UpdateCredentialsCategoryDto,
  ) {
    try {
      const data = await this.credentialsCategoryService.findOneWhere({
        where: { id: id },
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Credential Category'),
          data: {},
        });
      }

      const alreadyExists = await this.credentialsCategoryService.checkName(
        updateCredentialsCategoryDto.name,
      );

      if (alreadyExists && alreadyExists.id !== id) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Credential Category'),
          data: {},
        });
      }

      const result = await this.credentialsCategoryService.update(
        id,
        updateCredentialsCategoryDto,
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Credential Category')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Credential Category'),
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
      const isExist =
        await this.credentialsCategoryService.checkRequirementExist(id);

      if (isExist) {
        return response.badRequest({
          message: CONSTANT.ERROR.CANNOT_DELETE('Category'),
          data: {},
        });
      }

      const result = await this.credentialsCategoryService.remove(
        id,
        deleteDto,
      );
      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Credential Category')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Credential Category'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
