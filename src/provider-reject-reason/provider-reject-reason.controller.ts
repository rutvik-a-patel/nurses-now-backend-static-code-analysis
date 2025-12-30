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
import { ProviderRejectReasonService } from './provider-reject-reason.service';
import { CreateProviderRejectReasonDto } from './dto/create-provider-reject-reason.dto';
import { UpdateProviderRejectReasonDto } from './dto/update-provider-reject-reason.dto';
import { CONSTANT } from '@/shared/constants/message';
import { Roles } from '@/shared/decorator/role.decorator';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { RoleGuard } from '@/shared/guard/role.guard';
import { AuthGuard } from '@nestjs/passport';
import response from '@/shared/response';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { ILike, In } from 'typeorm';
import { MultiSelectQueryParamsDto } from '@/shared/dto/query-params.dto';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { PERMISSIONS, SECTIONS, SUB_SECTION } from '@/shared/constants/enum';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Section(SECTIONS.admin_portal_settings, SUB_SECTION.staff_reject_reasons)
@Controller('provider-reject-reason')
export class ProviderRejectReasonController {
  constructor(
    private readonly providerRejectReasonService: ProviderRejectReasonService,
  ) {}

  @Roles('admin')
  @Permission(PERMISSIONS.add)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post()
  async create(
    @Body() createProviderRejectReasonDto: CreateProviderRejectReasonDto,
  ) {
    try {
      const isExist = await this.providerRejectReasonService.checkName(
        createProviderRejectReasonDto.reason,
      );

      if (isExist) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Staff Rejection Reason'),
          data: {},
        });
      }

      const data = await this.providerRejectReasonService.create(
        createProviderRejectReasonDto,
      );

      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Staff Rejection Reason'),
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

      const [list, count] = await this.providerRejectReasonService.findAll({
        where: where,
        order: queryParamsDto.order,
        take: +queryParamsDto.limit,
        skip: +queryParamsDto.offset,
      });

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Staff Rejection Reason')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff Rejection Reason'),
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
      const result = await this.providerRejectReasonService.findOneWhere({
        where: { id },
      });

      if (!result) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff Rejection Reason'),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Staff Rejection Reason'),
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
    @Body() updateProviderRejectReasonDto: UpdateProviderRejectReasonDto,
  ) {
    try {
      const reason = await this.providerRejectReasonService.findOneWhere({
        where: { id },
      });

      if (!reason) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff Rejection Reason'),
          data: {},
        });
      }
      const rejectReason = updateProviderRejectReasonDto.reason
        ? updateProviderRejectReasonDto.reason
        : reason.reason;

      const isExist = await this.providerRejectReasonService.checkName(
        rejectReason,
        reason.id,
      );

      if (isExist) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Staff Rejection Reason'),
          data: {},
        });
      }

      const result = await this.providerRejectReasonService.update(
        id,
        updateProviderRejectReasonDto,
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Staff Rejection Reason')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff Rejection Reason'),
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
      const reason = await this.providerRejectReasonService.findOneWhere({
        where: { id },
      });

      if (!reason) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff Rejection Reason'),
          data: {},
        });
      }

      const isAlreadyInUse =
        await this.providerRejectReasonService.isAlreadyInUse(id);
      if (isAlreadyInUse) {
        return response.badRequest({
          message: CONSTANT.ERROR.CANNOT_DELETE('Reason'),
          data: {},
        });
      }

      const result = await this.providerRejectReasonService.remove(
        id,
        deleteDto,
      );
      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Staff Rejection Reason')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff Rejection Reason'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
