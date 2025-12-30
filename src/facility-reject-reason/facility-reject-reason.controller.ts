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
import { FacilityRejectReasonService } from './facility-reject-reason.service';
import { CreateFacilityRejectReasonDto } from './dto/create-facility-reject-reason.dto';
import { UpdateFacilityRejectReasonDto } from './dto/update-facility-reject-reason.dto';
import { CONSTANT } from '@/shared/constants/message';
import { Roles } from '@/shared/decorator/role.decorator';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { RoleGuard } from '@/shared/guard/role.guard';
import { AuthGuard } from '@nestjs/passport';
import response from '@/shared/response';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { ILike } from 'typeorm';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';

@Controller('facility-reject-reason')
export class FacilityRejectReasonController {
  constructor(
    private readonly facilityRejectReasonService: FacilityRejectReasonService,
  ) {}

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post()
  async create(
    @Body() createFacilityRejectReasonDto: CreateFacilityRejectReasonDto,
  ) {
    try {
      const isExist = await this.facilityRejectReasonService.checkName(
        createFacilityRejectReasonDto.reason,
      );

      if (isExist) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Verification Reject Reason'),
          data: {},
        });
      }

      const data = await this.facilityRejectReasonService.create(
        createFacilityRejectReasonDto,
      );

      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Verification Reject Reason'),
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
      const where = {};
      if (queryParamsDto.search) {
        Object.assign(where, {
          reason: ILike(`%${parseSearchKeyword(queryParamsDto.search)}%`),
        });
      }

      const [list, count] = await this.facilityRejectReasonService.findAll({
        where: where,
        order: queryParamsDto.order,
        take: +queryParamsDto.limit,
        skip: +queryParamsDto.offset,
      });

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Verification Reject Reason')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Verification Reject Reason'),
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
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get(':id')
  async findOne(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const result = await this.facilityRejectReasonService.findOneWhere({
        where: { id },
      });
      return response.successResponse({
        message: result
          ? CONSTANT.SUCCESS.RECORD_FOUND('Verification Reject Reason')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Verification Reject Reason'),
        data: result ? result : {},
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
    @Body() updateFacilityRejectReasonDto: UpdateFacilityRejectReasonDto,
  ) {
    try {
      const data = await this.facilityRejectReasonService.findOneWhere({
        where: { id },
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND(
            'Verification Reject Reason',
          ),
          data: {},
        });
      }

      const reason = updateFacilityRejectReasonDto.reason
        ? updateFacilityRejectReasonDto.reason
        : data.reason;

      const isExist = await this.facilityRejectReasonService.checkName(
        reason,
        data.id,
      );

      if (isExist) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Verification Reject Reason'),
          data: {},
        });
      }

      const result = await this.facilityRejectReasonService.update(
        id,
        updateFacilityRejectReasonDto,
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Verification Reject Reason')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Verification Reject Reason'),
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
      const result = await this.facilityRejectReasonService.remove(
        id,
        deleteDto,
      );
      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Verification Reject Reason')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Verification Reject Reason'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
