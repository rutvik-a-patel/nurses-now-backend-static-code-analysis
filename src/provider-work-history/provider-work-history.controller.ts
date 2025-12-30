import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProviderWorkHistoryService } from './provider-work-history.service';
import { CreateProviderWorkHistoryDto } from './dto/create-provider-work-history.dto';
import { UpdateProviderWorkHistoryDto } from './dto/update-provider-work-history.dto';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { IRequest } from '@/shared/constants/types';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { IsNull } from 'typeorm';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';

@Controller('provider-work-history')
export class ProviderWorkHistoryController {
  constructor(
    private readonly providerWorkHistoryService: ProviderWorkHistoryService,
  ) {}
  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post()
  async create(
    @Body()
    createProviderWorkHistoryDto: CreateProviderWorkHistoryDto,
    @Req() req: IRequest,
  ) {
    try {
      createProviderWorkHistoryDto.provider = req.user;
      const data = await this.providerWorkHistoryService.create(
        createProviderWorkHistoryDto,
      );
      delete data.provider;
      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Work History'),
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get()
  async findAll(@Req() req: IRequest) {
    try {
      const [list, count] = await this.providerWorkHistoryService.findAll({
        where: {
          provider: {
            id: req.user.id,
          },
        },
        order: { created_at: 'DESC' },
      });

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Work History')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Work History'),
        data: list,
      };

      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get(':id')
  async findOne(
    @Param('id', UUIDValidationPipe) id: string,
    @Req() req: IRequest,
  ) {
    try {
      const result = await this.providerWorkHistoryService.findOneWhere({
        where: {
          id: id,
          provider: {
            id: req.user.id,
          },
        },
        select: {
          id: true,
          created_at: true,
          location: true,
          employer_name: true,
          supervisors_name: true,
          supervisors_title: true,
          work_phone_country_code: true,
          work_phone: true,
          is_teaching_facility: true,
          charge_experience: true,
          can_contact_employer: true,
          start_date: true,
          end_date: true,
          is_current: true,
        },
      });

      if (!result) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Work History'),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Work History'),
        data: result,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch(':id')
  async update(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() updateProviderWorkHistoryDto: UpdateProviderWorkHistoryDto,
    @Req() req: IRequest,
  ) {
    try {
      const history = await this.providerWorkHistoryService.findOneWhere({
        where: {
          id: id,
          provider: {
            id: req.user.id,
          },
        },
      });

      if (!history) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Work History'),
          data: {},
        });
      }

      const data = await this.providerWorkHistoryService.update(
        id,
        updateProviderWorkHistoryDto,
      );
      return response.successResponse({
        message: data.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Work History')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Work History'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Delete(':id')
  async remove(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() deleteDto: DeleteDto,
    @Req() req: IRequest,
  ) {
    try {
      const result = await this.providerWorkHistoryService.remove(
        {
          id: id,
          provider: {
            id: req.user.id,
          },
          deleted_at: IsNull(),
        },
        deleteDto,
      );
      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Work History')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Work History'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
