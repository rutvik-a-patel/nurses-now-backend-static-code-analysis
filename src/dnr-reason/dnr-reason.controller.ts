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
import { DnrReasonService } from './dnr-reason.service';
import { CreateDnrReasonDto } from './dto/create-dnr-reason.dto';
import { UpdateDnrReasonDto } from './dto/update-dnr-reason.dto';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { Roles } from '@/shared/decorator/role.decorator';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { ILike, In } from 'typeorm';
import { DnrReasonFilterDto } from './dto/dnr-reason-filter.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { PERMISSIONS, SECTIONS, SUB_SECTION } from '@/shared/constants/enum';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Section(SECTIONS.facility_portal_settings, SUB_SECTION.staff_dnr_settings)
@Controller('dnr-reason')
export class DnrReasonController {
  constructor(private readonly dnrReasonService: DnrReasonService) {}

  @Roles('admin')
  @Permission(PERMISSIONS.add)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post()
  async create(@Body() createDnrReasonDto: CreateDnrReasonDto) {
    try {
      const dnrReason = await this.dnrReasonService.checkName(
        createDnrReasonDto.reason,
        createDnrReasonDto.reason_type,
      );

      if (dnrReason) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('DNR Reason'),
          data: {},
        });
      }

      const data = await this.dnrReasonService.create(createDnrReasonDto);

      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('DNR Reason'),
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get()
  async findAll(@Query() dnrReasonFilterDto: DnrReasonFilterDto) {
    try {
      const where = dnrReasonFilterDto?.search
        ? {
            reason: ILike(`%${parseSearchKeyword(dnrReasonFilterDto.search)}%`),
            ...(dnrReasonFilterDto.status
              ? { status: In(dnrReasonFilterDto.status) }
              : {}),
          }
        : {
            ...(dnrReasonFilterDto.status
              ? { status: In(dnrReasonFilterDto.status) }
              : {}),
          };

      if (dnrReasonFilterDto?.reason_type) {
        Object.assign(where, {
          reason_type: dnrReasonFilterDto.reason_type,
        });
      }

      const [list, count] = await this.dnrReasonService.findAll({
        where: where,
        order: dnrReasonFilterDto.order,
        take: +dnrReasonFilterDto.limit,
        skip: +dnrReasonFilterDto.offset,
      });

      return response.successResponseWithPagination({
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('DNR Reason')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('DNR Reason'),
        total: count,
        limit: +dnrReasonFilterDto.limit,
        offset: +dnrReasonFilterDto.offset,
        data: list,
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
      const data = await this.dnrReasonService.findOneWhere({
        where: { id: id },
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('DNR Reason'),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('DNR Reason'),
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
    @Body() updateDnrReasonDto: UpdateDnrReasonDto,
  ) {
    try {
      const data = await this.dnrReasonService.findOneWhere({
        where: { id: id },
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('DNR Reason'),
          data: {},
        });
      }

      const alreadyExists = await this.dnrReasonService.checkName(
        updateDnrReasonDto.reason,
        data.reason_type,
      );

      if (alreadyExists && alreadyExists.id !== id) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('DNR Reason'),
          data: {},
        });
      }

      const result = await this.dnrReasonService.updateWhere(
        { id },
        updateDnrReasonDto,
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('DNR Reason')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('DNR Reason'),
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
      const data = await this.dnrReasonService.findOneWhere({
        where: { id: id },
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('DNR Reason'),
          data: {},
        });
      }

      const result = await this.dnrReasonService.remove(id, deleteDto);

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('DNR Reason')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('DNR Reason'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
