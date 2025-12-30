import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProviderEvaluationsService } from './provider-evaluations.service';
import { Roles } from '@/shared/decorator/role.decorator';
import response from '@/shared/response';
import { CreateEvaluationResponseDto } from './dto/create-provider-evaluation.dto';
import { CONSTANT } from '@/shared/constants/message';
import { IRequest } from '@/shared/constants/types';
import { AuthGuard } from '@nestjs/passport';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import { FilterEvaluationDto } from './dto/filter.evaluation.dto';
import { RoleGuard } from '@/shared/guard/role.guard';
import { FacilityContactPermission } from '@/shared/decorator/access-control.decorator';
import { FACILITY_CONTACT_PERMISSIONS } from '@/shared/constants/enum';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';
import { UpdateEvaluationResponseDto } from './dto/update-provider-evaluation.dto';

@Controller('provider-evaluations')
export class ProviderEvaluationsController {
  constructor(
    private readonly providerEvaluationsService: ProviderEvaluationsService,
  ) {}

  @Roles('admin', 'facility', 'facility_user')
  @FacilityContactPermission([FACILITY_CONTACT_PERMISSIONS.can_evaluate_staff])
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post()
  async createEvaluation(
    @Body() evaluationDto: CreateEvaluationResponseDto,
    @Req() req: IRequest,
  ) {
    try {
      const { user } = req;

      await this.providerEvaluationsService.createEvaluation(
        evaluationDto,
        user,
      );

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_ADDED('Evaluation'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch(':id')
  async updateEvaluation(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() evaluationDto: UpdateEvaluationResponseDto,
  ) {
    try {
      const data = await this.providerEvaluationsService.updateEvaluation(
        id,
        evaluationDto,
      );

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_UPDATED('Evaluation'),
        data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'))
  @Get('evaluations/:id')
  async getEvaluations(
    @Param('id', UUIDValidationPipe) id: string,
    @Query() query: FilterEvaluationDto,
  ) {
    try {
      const [evaluations, count] =
        await this.providerEvaluationsService.getEvaluations(id, query);

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Evaluations')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Evaluations'),
        total: count,
        limit: +query.limit,
        offset: +query.offset,
        data: evaluations,
      };
      return response.successResponseWithPagination(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'))
  @Get('evaluations/admin/:id')
  async getEvaluationsOfStaff(
    @Param('id', UUIDValidationPipe) id: string,
    @Query() query: FilterEvaluationDto,
  ) {
    try {
      const [evaluations, count] =
        await this.providerEvaluationsService.getEvaluationsOfStaff(id, query);

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Evaluations')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Evaluations'),
        total: count,
        limit: +query.limit,
        offset: +query.offset,
        data: evaluations,
      };
      return response.successResponseWithPagination(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
