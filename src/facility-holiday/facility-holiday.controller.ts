import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Delete,
  Query,
} from '@nestjs/common';
import { FacilityHolidayService } from './facility-holiday.service';
import { FacilityHolidayItemDto } from './dto/create-facility-holiday.dto';
import { UpdateFacilityHolidayDto } from './dto/update-facility-holiday.dto';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { GetFacilityHolidayDto } from './dto/get-facility-holiday.dto';

@Controller('facility-holiday')
export class FacilityHolidayController {
  constructor(
    private readonly facilityHolidayService: FacilityHolidayService,
  ) {}

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post()
  async create(@Body() createFacilityHolidayDto: FacilityHolidayItemDto[]) {
    try {
      await this.facilityHolidayService.createOrUpdateBulk(
        createFacilityHolidayDto,
      );

      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Facility holiday'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('all/:id')
  async findAll(
    @Param('id', UUIDValidationPipe) id: string,
    @Query() query: GetFacilityHolidayDto,
  ) {
    try {
      const [list, count] = await this.facilityHolidayService.findAll({
        where: { facility: { id }, status: DEFAULT_STATUS.active },
        relations: { facility: true, holiday_group: true },
        select: {
          facility: { id: true, name: true },
          holiday_group: {
            id: true,
            name: true,
            start_date: true,
            end_date: true,
            start_time: true,
            end_time: true,
          },
        },
        order: query.order,
      });

      const data = {
        message:
          count > 0
            ? CONSTANT.SUCCESS.RECORD_FOUND('Facility holidays')
            : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facility holidays'),
        data: list.length ? list : [],
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get(':id')
  async findOne(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const facilityHoliday = await this.facilityHolidayService.findOneWhere({
        where: {
          id,
        },
      });
      if (!facilityHoliday) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility holiday'),
          data: {},
        });
      }
      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Facility holiday'),
        data: facilityHoliday,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch()
  async update(@Body() updateFacilityHolidayDto: UpdateFacilityHolidayDto[]) {
    try {
      await this.facilityHolidayService.createOrUpdateBulk(
        updateFacilityHolidayDto,
      );

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_UPDATED('Facility holiday'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Delete(':id')
  async remove(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const facilityHoliday = await this.facilityHolidayService.findOneWhere({
        where: {
          id,
        },
        select: {
          id: true,
        },
      });

      if (!facilityHoliday) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility holiday'),
          data: {},
        });
      }

      const result = await this.facilityHolidayService.remove({
        id,
      });

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Facility holiday')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facility holiday'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
