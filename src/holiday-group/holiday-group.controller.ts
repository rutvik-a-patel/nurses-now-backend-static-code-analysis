import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  Delete,
} from '@nestjs/common';
import { HolidayGroupService } from './holiday-group.service';
import { CreateHolidayGroupDto } from './dto/create-holiday-group.dto';
import { UpdateHolidayGroupDto } from './dto/update-holiday-group.dto';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { CONSTANT } from '@/shared/constants/message';
import response from '@/shared/response';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { ILike, In } from 'typeorm';
import {
  GetHolidayGroupDto,
  GetHolidayGroupQueryParamsDto,
} from './dto/get-holiday-group.dto';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { PERMISSIONS, SECTIONS, SUB_SECTION } from '@/shared/constants/enum';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Section(SECTIONS.admin_portal_settings, SUB_SECTION.holiday_groups)
@Controller('holiday-group')
export class HolidayGroupController {
  constructor(private readonly holidayGroupService: HolidayGroupService) {}

  @Roles('admin')
  @Permission(PERMISSIONS.add)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post()
  async create(@Body() createHolidayGroupDto: CreateHolidayGroupDto) {
    try {
      const existingHolidayGroup =
        await this.holidayGroupService.doesNameExists(
          createHolidayGroupDto.name,
        );

      if (existingHolidayGroup) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Holiday group'),
          data: {},
        });
      }
      const result = await this.holidayGroupService.create(
        createHolidayGroupDto,
      );
      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Holiday group'),
        data: result,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('all/facility-holiday')
  async findAllForFacilityHoliday(
    @Query() queryParamsDto: GetHolidayGroupQueryParamsDto,
  ) {
    try {
      const list =
        await this.holidayGroupService.findAvailableHolidayGroups(
          queryParamsDto,
        );
      const data = {
        message: list.length
          ? CONSTANT.SUCCESS.RECORD_FOUND('Holiday groups')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Holiday groups'),
        data: list.length ? list : [],
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('all')
  async findAll(@Query() queryParamsDto: GetHolidayGroupDto) {
    try {
      const where = {};
      if (queryParamsDto?.search) {
        Object.assign(where, {
          name: ILike(`%${parseSearchKeyword(queryParamsDto.search)}%`),
        });
      }
      if (queryParamsDto?.status && queryParamsDto.status.length) {
        Object.assign(where, { status: In(queryParamsDto.status) });
      }
      const list = await this.holidayGroupService.findAll({
        where,
        select: {
          id: true,
          name: true,
          status: true,
          created_at: true,
          start_date: true,
          end_date: true,
          start_time: true,
          end_time: true,
        },
        order: queryParamsDto.order,
      });

      const data = {
        message: list.length
          ? CONSTANT.SUCCESS.RECORD_FOUND('Holiday groups')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Holiday groups'),
        data: list.length ? list : [],
      };
      return response.successResponse(data);
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
      const holidayGroup = await this.holidayGroupService.findOneWhere({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
          status: true,
          start_date: true,
          end_date: true,
          start_time: true,
          end_time: true,
        },
      });
      if (!holidayGroup) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Holiday group'),
          data: {},
        });
      }
      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Holiday group'),
        data: holidayGroup,
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
    @Body() updateHolidayGroupDto: UpdateHolidayGroupDto,
  ) {
    const holidayGroup = await this.holidayGroupService.findOneWhere({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!holidayGroup) {
      return response.badRequest({
        message: CONSTANT.ERROR.RECORD_NOT_FOUND('Holiday group'),
        data: {},
      });
    }

    if (updateHolidayGroupDto.name) {
      const existingHolidayGroup =
        await this.holidayGroupService.doesNameExists(
          updateHolidayGroupDto.name,
          id,
        );
      if (existingHolidayGroup) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Holiday group'),
          data: {},
        });
      }
      // for updating the name if the admin have updated the name of holiday group
      await this.holidayGroupService.updateFacilityHolidayDetails(
        'update',
        id,
        updateHolidayGroupDto.name,
      );
    }
    const result = await this.holidayGroupService.update(
      {
        id,
      },
      updateHolidayGroupDto,
    );

    return response.successResponse({
      message: result.affected
        ? CONSTANT.SUCCESS.RECORD_UPDATED('Holiday group')
        : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Holiday group'),
      data: {},
    });
  }

  @Roles('admin')
  @Permission(PERMISSIONS.delete)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Delete(':id')
  async remove(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const holidayGroup = await this.holidayGroupService.findOneWhere({
        where: {
          id,
        },
        select: {
          id: true,
        },
      });

      if (!holidayGroup) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Holiday group'),
          data: {},
        });
      }
      await this.holidayGroupService.updateFacilityHolidayDetails('delete', id);
      const result = await this.holidayGroupService.remove({ id });

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Holiday group')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Holiday group'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
