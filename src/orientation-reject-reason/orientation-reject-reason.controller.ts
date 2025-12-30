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
import { OrientationRejectReasonService } from './orientation-reject-reason.service';
import { CreateOrientationRejectReasonDto } from './dto/create-orientation-reject-reason.dto';
import { UpdateOrientationRejectReasonDto } from './dto/update-orientation-reject-reason.dto';
import { CONSTANT } from '@/shared/constants/message';
import { Roles } from '@/shared/decorator/role.decorator';
import { MultiSelectQueryParamsDto } from '@/shared/dto/query-params.dto';
import { RoleGuard } from '@/shared/guard/role.guard';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import { AuthGuard } from '@nestjs/passport';
import response from '@/shared/response';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { PERMISSIONS, SECTIONS, SUB_SECTION } from '@/shared/constants/enum';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Section(
  SECTIONS.facility_portal_settings,
  SUB_SECTION.orientation_reject_reasons,
)
@Controller('orientation-reject-reason')
export class OrientationRejectReasonController {
  constructor(
    private readonly orientationRejectReasonService: OrientationRejectReasonService,
  ) {}

  @Roles('admin')
  @Permission(PERMISSIONS.add)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post()
  async create(
    @Body() createOrientationRejectReasonDto: CreateOrientationRejectReasonDto,
  ) {
    try {
      const checkReason = await this.orientationRejectReasonService.checkName(
        createOrientationRejectReasonDto.reason,
      );

      if (checkReason) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Orientation Reject Reason'),
          data: { name: true },
        });
      }

      const data = await this.orientationRejectReasonService.create(
        createOrientationRejectReasonDto,
      );
      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Orientation Reject Reason'),
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
        await this.orientationRejectReasonService.fetchAllByFilter(
          queryParamsDto,
        );
      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Orientation Reject Reason')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Orientation Reject Reason'),
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
      const data = await this.orientationRejectReasonService.findOneWhere({
        where: {
          id: id,
        },
      });
      return response.successResponse({
        message: data
          ? CONSTANT.SUCCESS.RECORD_FOUND('Orientation Reject Reason')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Orientation Reject Reason'),
        data: data || {},
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
    @Body() updateOrientationRejectReasonDto: UpdateOrientationRejectReasonDto,
  ) {
    try {
      const type = await this.orientationRejectReasonService.findOneWhere({
        where: {
          id: id,
        },
      });

      if (!type) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Orientation Reject Reason'),
          data: {},
        });
      }

      const typeAlreadyExists =
        await this.orientationRejectReasonService.checkName(
          updateOrientationRejectReasonDto.reason,
        );

      if (typeAlreadyExists && typeAlreadyExists.id !== id) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Orientation Reject Reason'),
          data: { name: true },
        });
      }

      const data = await this.orientationRejectReasonService.update(
        id,
        updateOrientationRejectReasonDto,
      );
      return response.successResponse({
        message: data.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Orientation Reject Reason')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Orientation Reject Reason'),
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
      const isAlreadyUsed =
        await this.orientationRejectReasonService.isAlreadyUsed(id);

      if (isAlreadyUsed) {
        return response.badRequest({
          message: CONSTANT.ERROR.CANNOT_DELETE(`'Orientation Reject Reason'`),
          data: {},
        });
      }
      const result = await this.orientationRejectReasonService.remove(id);
      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Orientation Reject Reason')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Orientation Reject Reason'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
