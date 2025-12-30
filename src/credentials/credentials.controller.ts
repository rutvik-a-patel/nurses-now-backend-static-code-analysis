import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
import response from '@/shared/response';
import { Roles } from '@/shared/decorator/role.decorator';
import { RoleGuard } from '@/shared/guard/role.guard';
import { AuthGuard } from '@nestjs/passport';
import { IRequest } from '@/shared/constants/types';
import { CONSTANT } from '@/shared/constants/message';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import { DeleteDto } from '@/shared/dto/delete.dto';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { PERMISSIONS, SECTIONS, SUB_SECTION } from '@/shared/constants/enum';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Section(SECTIONS.admin_portal_settings, SUB_SECTION.compliance_manager)
@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Roles('admin')
  @Permission(PERMISSIONS.add)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post()
  create(
    @Body() createCredentialDto: CreateCredentialDto,
    @Req() req: IRequest,
  ) {
    try {
      const data = this.credentialsService.create(createCredentialDto, req);
      return response.successCreate({
        message: 'Credential created successfully',
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
      const data = await this.credentialsService.findOneWhere({
        where: { id },
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Credential'),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Credential'),
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
    @Body() updateCredentialDto: UpdateCredentialDto,
    @Req() req: IRequest,
  ) {
    try {
      const credential = await this.credentialsService.findOneWhere({
        where: { id },
      });

      if (!credential) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Credential'),
          data: {},
        });
      }

      updateCredentialDto.updated_by = req.user.id;
      await this.credentialsService.update(id, updateCredentialDto);

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_UPDATED('Credential'),
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
      const isExist = await this.credentialsService.isCredentialInUse(id);

      if (isExist) {
        return response.badRequest({
          message: CONSTANT.ERROR.CANNOT_DELETE('Credential'),
          data: {},
        });
      }

      const result = await this.credentialsService.remove(id, deleteDto);
      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Credential')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Credential'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
