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
import { ProfessionalReferenceRejectReasonService } from './professional-reference-reject-reason.service';
import { CreateProfessionalReferenceRejectReasonDto } from './dto/create-professional-reference-reject-reason.dto';
import { UpdateProfessionalReferenceRejectReasonDto } from './dto/update-professional-reference-reject-reason.dto';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { RoleGuard } from '@/shared/guard/role.guard';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
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

@Section(
  SECTIONS.admin_portal_settings,
  SUB_SECTION.professional_reference_reasons,
)
@Controller('professional-reference-reject-reason')
export class ProfessionalReferenceRejectReasonController {
  constructor(
    private readonly professionalReferenceRejectReasonService: ProfessionalReferenceRejectReasonService,
  ) {}

  @Roles('admin')
  @Permission(PERMISSIONS.add)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post()
  async create(
    @Body()
    createProfessionalReferenceRejectReasonDto: CreateProfessionalReferenceRejectReasonDto,
  ) {
    try {
      const isExist =
        await this.professionalReferenceRejectReasonService.checkName(
          createProfessionalReferenceRejectReasonDto.reason,
        );

      if (isExist) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS(
            'Professional Reference Reject Reason',
          ),
          data: {},
        });
      }

      const data = await this.professionalReferenceRejectReasonService.create(
        createProfessionalReferenceRejectReasonDto,
      );

      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED(
          'Professional Reference Reject Reason',
        ),
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

      const [list, count] =
        await this.professionalReferenceRejectReasonService.findAll({
          where: where,
          order: queryParamsDto.order,
          take: +queryParamsDto.limit,
          skip: +queryParamsDto.offset,
        });

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND(
              'Professional Reference Reject Reason',
            )
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND(
              'Professional Reference Reject Reason',
            ),
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
      const result =
        await this.professionalReferenceRejectReasonService.findOneWhere({
          where: { id },
        });

      if (!result) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND(
            'Professional Reference Reject Reason',
          ),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND(
          'Professional Reference Reject Reason',
        ),
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
    @Body()
    updateProfessionalReferenceRejectReasonDto: UpdateProfessionalReferenceRejectReasonDto,
  ) {
    try {
      const reason =
        await this.professionalReferenceRejectReasonService.findOneWhere({
          where: { id },
        });

      if (!reason) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND(
            'Professional Reference Reject Reason',
          ),
          data: {},
        });
      }
      const rejectReason = updateProfessionalReferenceRejectReasonDto.reason
        ? updateProfessionalReferenceRejectReasonDto.reason
        : reason.reason;

      const isExist =
        await this.professionalReferenceRejectReasonService.checkName(
          rejectReason,
          reason.id,
        );

      if (isExist) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS(
            'Professional Reference Reject Reason',
          ),
          data: {},
        });
      }

      const result = await this.professionalReferenceRejectReasonService.update(
        id,
        updateProfessionalReferenceRejectReasonDto,
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED(
              'Professional Reference Reject Reason',
            )
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND(
              'Professional Reference Reject Reason',
            ),
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
      const reason =
        await this.professionalReferenceRejectReasonService.findOneWhere({
          where: { id },
        });

      if (!reason) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND(
            'Professional Reference Reject Reason',
          ),
          data: {},
        });
      }

      const isAlreadyInUse =
        await this.professionalReferenceRejectReasonService.isAlreadyInUse(id);
      if (isAlreadyInUse) {
        return response.badRequest({
          message: CONSTANT.ERROR.CANNOT_DELETE('Reason'),
          data: {},
        });
      }

      const result = await this.professionalReferenceRejectReasonService.remove(
        id,
        deleteDto,
      );
      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED(
              'Professional Reference Reject Reason',
            )
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND(
              'Professional Reference Reject Reason',
            ),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
