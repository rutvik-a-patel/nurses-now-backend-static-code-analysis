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
import { ShiftCancelReasonService } from './shift-cancel-reason.service';
import { CreateShiftCancelReasonDto } from './dto/create-shift-cancel-reason.dto';
import { UpdateShiftCancelReasonDto } from './dto/update-shift-cancel-reason.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { Roles } from '@/shared/decorator/role.decorator';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { ILike, In } from 'typeorm';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { FilterShiftCancelReasonDto } from './dto/filter-shift-cancel-reason.dto';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { PERMISSIONS, SECTIONS, SUB_SECTION } from '@/shared/constants/enum';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Section(SECTIONS.staff_app_settings, SUB_SECTION.shift_cancel_reasons)
@Controller('shift-cancel-reason')
export class ShiftCancelReasonController {
  constructor(
    private readonly shiftCancelReasonService: ShiftCancelReasonService,
  ) {}

  @Roles('admin')
  @Permission(PERMISSIONS.add)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post()
  async create(@Body() createShiftCancelReasonDto: CreateShiftCancelReasonDto) {
    try {
      const isExist = await this.shiftCancelReasonService.checkName(
        createShiftCancelReasonDto.reason,
        createShiftCancelReasonDto.user_type,
      );

      if (isExist) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Shift Cancel Reason'),
          data: {},
        });
      }

      const data = await this.shiftCancelReasonService.create(
        createShiftCancelReasonDto,
      );

      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Shift Cancel Reason'),
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
  async findAll(
    @Query() filterShiftCancelReasonDto: FilterShiftCancelReasonDto,
  ) {
    try {
      const where = filterShiftCancelReasonDto.search
        ? {
            where: [
              {
                reason: ILike(
                  `%${parseSearchKeyword(filterShiftCancelReasonDto.search)}%`,
                ),
                user_type: filterShiftCancelReasonDto.user_type,
                ...(filterShiftCancelReasonDto.status && {
                  status: In(filterShiftCancelReasonDto.status),
                }),
              },
            ],
          }
        : {
            where: {
              user_type: filterShiftCancelReasonDto.user_type,
              ...(filterShiftCancelReasonDto.status && {
                status: In(filterShiftCancelReasonDto.status),
              }),
            },
          };
      const [list, count] = await this.shiftCancelReasonService.findAll({
        ...where,
        order: filterShiftCancelReasonDto.order,
        take: +filterShiftCancelReasonDto.limit,
        skip: +filterShiftCancelReasonDto.offset,
      });

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Shift Cancel Reason')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift Cancel Reason'),
        total: count,
        limit: +filterShiftCancelReasonDto.limit,
        offset: +filterShiftCancelReasonDto.offset,
        data: list,
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
      const data = await this.shiftCancelReasonService.findOneWhere({
        where: { id: id },
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift Cancel Reason'),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Shift Cancel Reason'),
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
    @Body() updateShiftCancelReasonDto: UpdateShiftCancelReasonDto,
  ) {
    try {
      const data = await this.shiftCancelReasonService.findOneWhere({
        where: { id: id },
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift Cancel Reason'),
          data: {},
        });
      }

      const reason = updateShiftCancelReasonDto.reason
        ? updateShiftCancelReasonDto.reason
        : data.reason;
      const user_type = updateShiftCancelReasonDto.user_type
        ? updateShiftCancelReasonDto.user_type
        : data.user_type;

      const isExist = await this.shiftCancelReasonService.checkName(
        reason,
        user_type,
        data.id,
      );

      if (isExist) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Shift Cancel Reason'),
          data: {},
        });
      }

      const result = await this.shiftCancelReasonService.updateWhere(
        { id: id },
        updateShiftCancelReasonDto,
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Shift Cancel Reason')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift Cancel Reason'),
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
      const isUsed = await this.shiftCancelReasonService.isAlreadyUsed(id);
      if (isUsed) {
        return response.badRequest({
          message: CONSTANT.ERROR.CANNOT_DELETE('Shift Cancel Reason'),
          data: {},
        });
      }
      const result = await this.shiftCancelReasonService.remove(id, deleteDto);
      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Shift Cancel Reason')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift Cancel Reason'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
