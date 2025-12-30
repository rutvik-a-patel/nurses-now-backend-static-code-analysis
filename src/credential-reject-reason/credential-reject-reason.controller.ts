import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CredentialRejectReasonService } from './credential-reject-reason.service';
import { CreateCredentialRejectReasonDto } from './dto/create-credential-reject-reason.dto';
import { UpdateCredentialRejectReasonDto } from './dto/update-credential-reject-reason.dto';
import { CONSTANT } from '@/shared/constants/message';
import { Roles } from '@/shared/decorator/role.decorator';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { MultiSelectQueryParamsDto } from '@/shared/dto/query-params.dto';
import { RoleGuard } from '@/shared/guard/role.guard';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import { AuthGuard } from '@nestjs/passport';
import { ILike, In } from 'typeorm';
import response from '@/shared/response';
import { PERMISSIONS, SECTIONS, SUB_SECTION } from '@/shared/constants/enum';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Section(SECTIONS.admin_portal_settings, SUB_SECTION.credential_reject_reasons)
@Controller('credential-reject-reason')
export class CredentialRejectReasonController {
  constructor(
    private readonly credentialRejectReasonService: CredentialRejectReasonService,
  ) {}

  @Roles('admin')
  @Permission(PERMISSIONS.add)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post()
  async create(
    @Body() createCredentialRejectReasonDto: CreateCredentialRejectReasonDto,
  ) {
    try {
      const isExist = await this.credentialRejectReasonService.checkName(
        createCredentialRejectReasonDto.reason,
      );

      if (isExist) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Credential Rejection Reason'),
          data: {},
        });
      }

      const data = await this.credentialRejectReasonService.create(
        createCredentialRejectReasonDto,
      );

      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Credential Rejection Reason'),
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
  async findAll(@Query() queryParamsDto: MultiSelectQueryParamsDto) {
    try {
      const where = {};
      if (queryParamsDto.search) {
        Object.assign(where, {
          reason: ILike(`%${parseSearchKeyword(queryParamsDto.search)}%`),
          ...(queryParamsDto.status
            ? { status: In(queryParamsDto.status) }
            : {}),
        });
      }

      if (queryParamsDto.status) {
        Object.assign(where, {
          status: In(queryParamsDto.status),
        });
      }

      const [list, count] = await this.credentialRejectReasonService.findAll({
        where: where,
        order: queryParamsDto.order,
        take: +queryParamsDto.limit,
        skip: +queryParamsDto.offset,
      });

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Credential Rejection Reason')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Credential Rejection Reason'),
        total: count,
        limit: +queryParamsDto.limit,
        offset: +queryParamsDto.offset,
        data: count ? list : [],
      };

      return response.successResponseWithPagination(data);
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
      const result = await this.credentialRejectReasonService.findOneWhere({
        where: { id },
      });

      if (!result) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND(
            'Credential Rejection Reason',
          ),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Credential Rejection Reason'),
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
  async update(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() updateCredentialRejectReasonDto: UpdateCredentialRejectReasonDto,
  ) {
    try {
      const reason = await this.credentialRejectReasonService.findOneWhere({
        where: { id },
      });

      if (!reason) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND(
            'Credential Rejection Reason',
          ),
          data: {},
        });
      }
      const rejectReason = updateCredentialRejectReasonDto.reason
        ? updateCredentialRejectReasonDto.reason
        : reason.reason;

      const isExist = await this.credentialRejectReasonService.checkName(
        rejectReason,
        reason.id,
      );

      if (isExist) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Credential Rejection Reason'),
          data: {},
        });
      }

      const result = await this.credentialRejectReasonService.update(
        id,
        updateCredentialRejectReasonDto,
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Credential Rejection Reason')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Credential Rejection Reason'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.delete)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Delete(':id')
  async remove(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() deleteDto: DeleteDto,
  ) {
    try {
      const reason = await this.credentialRejectReasonService.findOneWhere({
        where: { id },
      });

      if (!reason) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND(
            'Credential Rejection Reason',
          ),
          data: {},
        });
      }

      const isAlreadyInUse =
        await this.credentialRejectReasonService.isAlreadyInUse(id);
      if (isAlreadyInUse) {
        return response.badRequest({
          message: CONSTANT.ERROR.CANNOT_DELETE('Reason'),
          data: {},
        });
      }

      const result = await this.credentialRejectReasonService.remove(
        id,
        deleteDto,
      );
      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Credential Rejection Reason')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Credential Rejection Reason'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
