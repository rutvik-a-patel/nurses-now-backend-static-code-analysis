import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StatusSettingService } from './status-setting.service';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { CreateStatusSettingDto } from './dto/create-status-setting.dto';
import { FilterStatusSettingDto } from './dto/filter-status-setting.dto';
import { ILike, In } from 'typeorm';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { UpdateStatusSettingDto } from './dto/update-status-setting.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { PERMISSIONS, SECTIONS, SUB_SECTION } from '@/shared/constants/enum';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Section(SECTIONS.admin_portal_settings, SUB_SECTION.status_options)
@Controller('status-setting')
export class StatusSettingController {
  constructor(private readonly statusSettingService: StatusSettingService) {}

  @Roles('admin')
  @Permission(PERMISSIONS.add)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post()
  async create(@Body() createStatusSettingDto: CreateStatusSettingDto) {
    try {
      const statusSetting = await this.statusSettingService.checkName(
        createStatusSettingDto.name,
        createStatusSettingDto.status_for,
      );

      if (statusSetting) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Status Option'),
          data: {},
        });
      }

      const data = await this.statusSettingService.create(
        createStatusSettingDto,
      );
      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Status Option'),
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
      const data = await this.statusSettingService.findOneWhere({
        where: {
          id: id,
        },
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Status Option'),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Status Option'),
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
  async findAll(@Query() filterStatusSettingDto: FilterStatusSettingDto) {
    try {
      const where = {
        where: {
          status_for: filterStatusSettingDto.status_for,
        },
        order: filterStatusSettingDto.order,
        take: +filterStatusSettingDto.limit,
        skip: +filterStatusSettingDto.offset,
      };

      if (filterStatusSettingDto?.search) {
        Object.assign(where.where, {
          name: ILike(`%${parseSearchKeyword(filterStatusSettingDto.search)}%`),
        });
      }
      if (
        filterStatusSettingDto?.status &&
        filterStatusSettingDto.status.length
      ) {
        Object.assign(where.where, {
          status: In(filterStatusSettingDto.status),
        });
      }

      const [list, count] = await this.statusSettingService.findAll({
        ...where,
      });

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Status Options')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Status Options'),
        total: count,
        limit: +filterStatusSettingDto.limit,
        offset: +filterStatusSettingDto.offset,
        data: list,
      };

      return response.successResponseWithPagination(data);
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
    @Body() updateStatusSettingDto: UpdateStatusSettingDto,
  ) {
    try {
      const data = await this.statusSettingService.findOneWhere({
        where: {
          id: id,
        },
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Status Option'),
          data: {},
        });
      }

      const alreadyExists = await this.statusSettingService.checkName(
        updateStatusSettingDto.name,
        updateStatusSettingDto.status_for,
      );

      if (alreadyExists && alreadyExists.id !== id) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Status Option'),
          data: {},
        });
      }

      const result = await this.statusSettingService.update(
        id,
        updateStatusSettingDto,
      );
      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Status Option')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Status Option'),
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
      const data = await this.statusSettingService.findOneWhere({
        where: {
          id: id,
        },
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Status Option'),
          data: {},
        });
      }

      const isAlreadyUsed = await this.statusSettingService.isAlreadyUsed(id);
      if (isAlreadyUsed) {
        return response.badRequest({
          message: CONSTANT.ERROR.CANNOT_DELETE(`'Status Option'`),
          data: {},
        });
      }
      const result = await this.statusSettingService.remove(id, deleteDto);

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Status Option')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Status Option'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
