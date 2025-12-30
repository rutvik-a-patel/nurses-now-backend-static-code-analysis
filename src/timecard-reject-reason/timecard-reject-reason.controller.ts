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
import { TimecardRejectReasonService } from './timecard-reject-reason.service';
import { CreateTimecardRejectReasonDto } from './dto/create-timecard-reject-reason.dto';
import { UpdateTimecardRejectReasonDto } from './dto/update-timecard-reject-reason.dto';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { MultiSelectQueryParamsDto } from '@/shared/dto/query-params.dto';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { ILike, In } from 'typeorm';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { PERMISSIONS, SECTIONS, SUB_SECTION } from '@/shared/constants/enum';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Section(
  SECTIONS.facility_portal_settings,
  SUB_SECTION.dispute_timecard_reasons,
)
@Controller('timecard-reject-reason')
export class TimecardRejectReasonController {
  constructor(
    private readonly timecardRejectReasonService: TimecardRejectReasonService,
  ) {}

  @Roles('admin')
  @Permission(PERMISSIONS.add)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post()
  async create(
    @Body() createTimecardRejectReasonDto: CreateTimecardRejectReasonDto,
  ) {
    try {
      const isExist = await this.timecardRejectReasonService.checkName(
        createTimecardRejectReasonDto.reason,
      );

      if (isExist) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Dispute Timecard Reason'),
          data: {},
        });
      }

      const data = await this.timecardRejectReasonService.create(
        createTimecardRejectReasonDto,
      );

      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Dispute Timecard Reason'),
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
  async findAll(@Query() queryParamsDto: MultiSelectQueryParamsDto) {
    try {
      const where = queryParamsDto?.search
        ? {
            where: {
              reason: ILike(`%${parseSearchKeyword(queryParamsDto.search)}%`),
              ...(queryParamsDto.status
                ? { status: In(queryParamsDto.status) }
                : {}),
            },
          }
        : {
            where: {
              ...(queryParamsDto.status
                ? { status: In(queryParamsDto.status) }
                : {}),
            },
          };

      const [list, count] = await this.timecardRejectReasonService.findAll({
        ...where,
        order: queryParamsDto.order,
        take: +queryParamsDto.limit,
        skip: +queryParamsDto.offset,
      });

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Dispute Timecard Reason')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Dispute Timecard Reason'),
        total: count,
        limit: +queryParamsDto.limit,
        offset: +queryParamsDto.offset,
        data: list,
      };

      return response.successResponseWithPagination(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get(':id')
  async findOne(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const data = await this.timecardRejectReasonService.findOneWhere({
        where: { id: id },
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Dispute Timecard Reason'),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Dispute Timecard Reason'),
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
    @Body() updateTimecardRejectReasonDto: UpdateTimecardRejectReasonDto,
  ) {
    try {
      const data = await this.timecardRejectReasonService.findOneWhere({
        where: { id: id },
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Dispute Timecard Reason'),
          data: {},
        });
      }

      const reason = updateTimecardRejectReasonDto.reason
        ? updateTimecardRejectReasonDto.reason
        : data.reason;

      const isExist = await this.timecardRejectReasonService.checkName(
        reason,
        data.id,
      );

      if (isExist) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Dispute Timecard Reason'),
          data: {},
        });
      }

      const result = await this.timecardRejectReasonService.update(
        id,
        updateTimecardRejectReasonDto,
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Dispute Timecard Reason')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Dispute Timecard Reason'),
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
      const isAlreadyInUse =
        await this.timecardRejectReasonService.isAlreadyInUse(id);

      if (isAlreadyInUse) {
        return response.badRequest({
          message: CONSTANT.ERROR.CANNOT_DELETE('Dispute Timecard Reason'),
          data: {},
        });
      }

      const result = await this.timecardRejectReasonService.remove(
        id,
        deleteDto,
      );
      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Dispute Timecard Reason')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Dispute Timecard Reason'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
