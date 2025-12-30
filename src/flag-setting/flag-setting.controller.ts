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
import { FlagSettingService } from './flag-setting.service';
import { CreateFlagSettingDto } from './dto/create-flag-setting.dto';
import { UpdateFlagSettingDto } from './dto/update-flag-setting.dto';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import response from '@/shared/response';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import { CONSTANT } from '@/shared/constants/message';
import { ILike } from 'typeorm';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { DeleteDto } from '@/shared/dto/delete.dto';

@Controller('flag-setting')
export class FlagSettingController {
  constructor(private readonly flagSettingService: FlagSettingService) {}

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post()
  async create(@Body() createFlagSettingDto: CreateFlagSettingDto) {
    try {
      const flag = await this.flagSettingService.checkName(
        createFlagSettingDto.name,
      );

      if (flag) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Flag'),
          data: {},
        });
      }

      const data = await this.flagSettingService.create(createFlagSettingDto);

      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Flag'),
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get()
  async findAll(@Query() queryParamsDto: QueryParamsDto) {
    try {
      const where = queryParamsDto?.search
        ? {
            where: {
              name: ILike(`%${parseSearchKeyword(queryParamsDto.search)}%`),
            },
          }
        : {};
      const [list, count] = await this.flagSettingService.findAll({
        ...where,
        order: queryParamsDto.order,
        take: +queryParamsDto.limit,
        skip: +queryParamsDto.offset,
      });

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Flags')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Flags'),
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

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get(':id')
  async findOne(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const data = await this.flagSettingService.findOneWhere({
        where: {
          id: id,
        },
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Flag'),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Flag'),
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch(':id')
  async update(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() updateFlagSettingDto: UpdateFlagSettingDto,
  ) {
    try {
      const flag = await this.flagSettingService.findOneWhere({
        where: {
          id: id,
        },
      });

      if (!flag) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Flag'),
          data: {},
        });
      }

      const alreadyExists = await this.flagSettingService.checkName(
        updateFlagSettingDto.name,
      );

      if (alreadyExists && alreadyExists.id !== id) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Flag'),
          data: {},
        });
      }

      const data = await this.flagSettingService.update(
        id,
        updateFlagSettingDto,
      );
      return response.successResponse({
        message: data.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Flag')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Flag'),
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
      const flag = await this.flagSettingService.findOneWhere({
        where: {
          id: id,
        },
      });

      if (!flag) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Flag'),
          data: {},
        });
      }

      const result = await this.flagSettingService.remove(id, deleteDto);

      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Flag')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Flag'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
