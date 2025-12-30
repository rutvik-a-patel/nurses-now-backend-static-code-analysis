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
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import response from '@/shared/response';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { CONSTANT } from '@/shared/constants/message';
import { MultiSelectQueryParamsDto } from '@/shared/dto/query-params.dto';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import {
  DEFAULT_STATUS,
  PERMISSIONS,
  SECTIONS,
  SUB_SECTION,
} from '@/shared/constants/enum';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Section(SECTIONS.admin_portal_settings, SUB_SECTION.tag_settings)
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Roles('admin')
  @Permission(PERMISSIONS.add)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post()
  async create(@Body() createTagDto: CreateTagDto) {
    try {
      const checkTag = await this.tagsService.checkName(createTagDto.name);

      if (checkTag) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Tag'),
          data: { name: true },
        });
      }

      const data = await this.tagsService.create(createTagDto);
      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Tag'),
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
      const [list, count] =
        await this.tagsService.fetchAllByFilter(queryParamsDto);
      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Tag')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Tag'),
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
      const data = await this.tagsService.findOneWhere({
        where: {
          id: id,
        },
      });
      return response.successResponse({
        message: data
          ? CONSTANT.SUCCESS.RECORD_FOUND('Tag')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Tag'),
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
    @Body() updateTagDto: UpdateTagDto,
  ) {
    try {
      const type = await this.tagsService.findOneWhere({
        where: {
          id: id,
        },
      });

      if (!type) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Tag'),
          data: {},
        });
      }

      const typeAlreadyExists = await this.tagsService.checkName(
        updateTagDto.name,
      );

      if (typeAlreadyExists && typeAlreadyExists.id !== id) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Tag'),
          data: { name: true },
        });
      }

      if (updateTagDto.status === DEFAULT_STATUS.in_active) {
        const isAlreadyUsed = await this.tagsService.isAlreadyUsed(id);
        if (isAlreadyUsed) {
          return response.badRequest({
            message: CONSTANT.ERROR.CANNOT_UPDATE_INUSE_RECORD(`'Tag'`),
            data: {},
          });
        }
      }

      const data = await this.tagsService.update(id, updateTagDto);
      return response.successResponse({
        message: data.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Tag')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Tag'),
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
  async remove(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const isAlreadyUsed = await this.tagsService.isAlreadyUsed(id);

      if (isAlreadyUsed) {
        return response.badRequest({
          message: CONSTANT.ERROR.CANNOT_DELETE(`'Tag'`),
          data: {},
        });
      }
      const result = await this.tagsService.remove(id);
      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Tag')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Tag'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
