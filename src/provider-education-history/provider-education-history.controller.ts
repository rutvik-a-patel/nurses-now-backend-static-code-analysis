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
import { ProviderEducationHistoryService } from './provider-education-history.service';
import { CreateProviderEducationHistoryDto } from './dto/create-provider-education-history.dto';
import { UpdateProviderEducationHistoryDto } from './dto/update-provider-education-history.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { Roles } from '@/shared/decorator/role.decorator';
import response from '@/shared/response';
import { IRequest } from '@/shared/constants/types';
import { CONSTANT } from '@/shared/constants/message';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { IsNull } from 'typeorm';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';

@Controller('provider-education-history')
export class ProviderEducationHistoryController {
  constructor(
    private readonly providerEducationHistoryService: ProviderEducationHistoryService,
  ) {}

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post()
  async create(
    @Body()
    createProviderEducationHistoryDto: CreateProviderEducationHistoryDto,
    @Req() req: IRequest,
  ) {
    try {
      createProviderEducationHistoryDto.provider = req.user;
      const data = await this.providerEducationHistoryService.create(
        createProviderEducationHistoryDto,
      );
      delete data.provider;
      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Education History'),
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
      const [list, count] = await this.providerEducationHistoryService.findAll({
        where: {
          provider: {
            id: req.user.id,
          },
        },
        order: { created_at: 'DESC' },
      });

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Education History')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Education History'),
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
      const result = await this.providerEducationHistoryService.findOneWhere({
        where: {
          id: id,
          provider: {
            id: req.user.id,
          },
        },
      });

      if (!result) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Education History'),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Education History'),
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
    @Body()
    updateProviderEducationHistoryDto: UpdateProviderEducationHistoryDto,
    @Req() req: IRequest,
  ) {
    try {
      const history = await this.providerEducationHistoryService.findOneWhere({
        where: {
          id: id,
          provider: {
            id: req.user.id,
          },
        },
      });

      if (!history) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Education History'),
          data: {},
        });
      }

      const data = await this.providerEducationHistoryService.update(
        id,
        updateProviderEducationHistoryDto,
      );
      return response.successResponse({
        message: data.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Education History')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Education History'),
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
      const result = await this.providerEducationHistoryService.remove(
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
          ? CONSTANT.SUCCESS.RECORD_DELETED('Education History')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Education History'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
