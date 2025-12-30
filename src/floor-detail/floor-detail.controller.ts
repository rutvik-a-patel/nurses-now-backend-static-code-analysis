import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FloorDetailService } from './floor-detail.service';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { CreateFloorDetailDto } from './dto/create-floor-detail.dto';
import { UpdateFloorDetailDto } from './dto/update-floor-detail.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import { IRequest } from '@/shared/constants/types';
import { ACTIVITY_TYPE } from '@/shared/constants/enum';

@Controller('floor-detail')
export class FloorDetailController {
  constructor(private readonly floorDetailService: FloorDetailService) {}

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post()
  async create(
    @Body() createFloorDetailDto: CreateFloorDetailDto,
    @Req() req: IRequest,
  ) {
    try {
      const result = await this.floorDetailService.create(createFloorDetailDto);

      const floor = await this.floorDetailService.findOneWithQueryBuilder(
        result.id,
      );
      await this.floorDetailService.floorActivityUpdateLog(
        req,
        ACTIVITY_TYPE.FACILITY_SETTINGS_UPDATED,
        null,
        floor,
        ['floor_name', 'floor_description'],
      );
      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Floor'),
        data: result,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get(':id')
  async findOne(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const floor = await this.floorDetailService.findOneWhere({
        where: { id },
        relations: {
          speciality: true,
          client_contact: true,
          default_order_contact: true,
        },
        select: {
          id: true,
          name: true,
          beds: true,
          po_number: true,
          cost_center: true,
          phone_number: true,
          description: true,
          created_at: true,
          speciality: {
            id: true,
            name: true,
            abbreviation: true,
            background_color: true,
            text_color: true,
            created_at: true,
          },
          default_order_contact: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            base_url: true,
            image: true,
          },
          client_contact: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            base_url: true,
            image: true,
          },
        },
      });

      if (!floor) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Floor Details'),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Floor Details'),
        data: floor,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('all/:id')
  async getAllFloor(
    @Param('id', UUIDValidationPipe) id: string,
    @Query() queryParamsDto: QueryParamsDto,
  ) {
    try {
      const [list, count] = await this.floorDetailService.findAll({
        where: {
          facility: {
            id,
          },
        },
        relations: {
          speciality: true,
          client_contact: true,
          default_order_contact: true,
        },
        select: {
          id: true,
          name: true,
          beds: true,
          po_number: true,
          cost_center: true,
          phone_number: true,
          description: true,
          created_at: true,
          speciality: {
            id: true,
            name: true,
            abbreviation: true,
            background_color: true,
            text_color: true,
            created_at: true,
          },
          default_order_contact: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            base_url: true,
            image: true,
          },
          client_contact: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            base_url: true,
            image: true,
          },
        },
        order: queryParamsDto.order,
        take: +queryParamsDto.limit,
        skip: +queryParamsDto.offset,
      });

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Floor')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Floor'),
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
  @Patch(':id')
  async update(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() updateFloorDetailDto: UpdateFloorDetailDto,
    @Req() req: IRequest,
  ) {
    try {
      const floor = await this.floorDetailService.findOneWithQueryBuilder(id);

      if (!floor) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Floor'),
          data: {},
        });
      }

      const result = await this.floorDetailService.update(
        { id },
        updateFloorDetailDto,
      );
      const updateFloorDetails =
        await this.floorDetailService.findOneWithQueryBuilder(id);

      await this.floorDetailService.floorActivityUpdateLog(
        req,
        id,
        ACTIVITY_TYPE.FACILITY_SETTINGS_UPDATED,
        floor,
        updateFloorDetails,
        ['floor_name', 'floor_description', 'name'],
      );
      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Floor Detail')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Floor'),
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
    deleteDto: DeleteDto,
  ) {
    try {
      const floor = await this.floorDetailService.findOneWhere({
        where: { id },
      });

      if (!floor) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Floor'),
          data: {},
        });
      }

      const result = await this.floorDetailService.remove({ id }, deleteDto);
      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Floor')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Floor'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
