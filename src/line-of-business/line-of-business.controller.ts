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
import { LineOfBusinessService } from './line-of-business.service';
import { CreateLineOfBusinessDto } from './dto/create-line-of-business.dto';
import { UpdateLineOfBusinessDto } from './dto/update-line-of-business.dto';
import response from '@/shared/response';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { CONSTANT } from '@/shared/constants/message';
import { MultiSelectQueryParamsDto } from '@/shared/dto/query-params.dto';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { ILike, In } from 'typeorm';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { PERMISSIONS, SECTIONS, SUB_SECTION } from '@/shared/constants/enum';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Section(SECTIONS.admin_portal_settings, SUB_SECTION.facility_type)
@Controller('line-of-business')
export class LineOfBusinessController {
  constructor(private readonly lineOfBusinessService: LineOfBusinessService) {}

  @Roles('admin')
  @Permission(PERMISSIONS.add)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post()
  async create(@Body() createLineOfBusinessDto: CreateLineOfBusinessDto) {
    try {
      const type = await this.lineOfBusinessService.checkName(
        createLineOfBusinessDto.name,
        createLineOfBusinessDto.work_comp_code,
      );

      if (type) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS(
            'Facility Type or Work Comp Code',
          ),
          data:
            type.name === createLineOfBusinessDto.name
              ? { name: true }
              : { work_comp_code: true },
        });
      }

      const data = await this.lineOfBusinessService.create(
        createLineOfBusinessDto,
      );

      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Facility Type'),
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
      const where = queryParamsDto?.search
        ? [
            {
              name: ILike(`%${parseSearchKeyword(queryParamsDto.search)}%`),
              ...(queryParamsDto.status
                ? { status: In(queryParamsDto.status) }
                : {}),
            },
            {
              work_comp_code: ILike(
                `%${parseSearchKeyword(queryParamsDto.search)}%`,
              ),
              ...(queryParamsDto.status
                ? { status: In(queryParamsDto.status) }
                : {}),
            },
          ]
        : {
            ...(queryParamsDto.status
              ? { status: In(queryParamsDto.status) }
              : {}),
          };
      const [list, count] = await this.lineOfBusinessService.findAll({
        where,
        order: queryParamsDto.order,
        take: +queryParamsDto.limit,
        skip: +queryParamsDto.offset,
      });

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Facility Type')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facility Type'),
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
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get(':id')
  async findOne(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const data = await this.lineOfBusinessService.findOneWhere({
        where: {
          id: id,
        },
      });
      return response.successResponse({
        message: data
          ? CONSTANT.SUCCESS.RECORD_FOUND('Facility Type')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facility Type'),
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
    @Body() updateLineOfBusinessDto: UpdateLineOfBusinessDto,
  ) {
    try {
      const type = await this.lineOfBusinessService.findOneWhere({
        where: {
          id: id,
        },
      });

      if (!type) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility Type'),
          data: {},
        });
      }

      const typeAlreadyExists = await this.lineOfBusinessService.checkName(
        updateLineOfBusinessDto.name,
        updateLineOfBusinessDto.work_comp_code,
      );

      if (typeAlreadyExists && typeAlreadyExists.id !== id) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Facility Type'),
          data:
            typeAlreadyExists.name === updateLineOfBusinessDto.name
              ? { name: true }
              : { work_comp_code: true },
        });
      }

      const data = await this.lineOfBusinessService.update(
        id,
        updateLineOfBusinessDto,
      );
      return response.successResponse({
        message: data.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Facility Type')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Facility Type'),
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
      const isAlreadyUsed = await this.lineOfBusinessService.isAlreadyUsed(id);

      if (isAlreadyUsed) {
        return response.badRequest({
          message: CONSTANT.ERROR.CANNOT_DELETE(`'Facility Type'`),
          data: {},
        });
      }
      const result = await this.lineOfBusinessService.remove(id, deleteDto);
      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Facility Type')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facility Type'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
