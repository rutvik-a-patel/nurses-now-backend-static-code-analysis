import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ShiftTypeService } from './shift-type.service';
import { CreateShiftTypeDto } from './dto/create-shift-type.dto';
import { UpdateShiftTypeDto } from './dto/update-shift-type.dto';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { CONSTANT } from '@/shared/constants/message';
import response from '@/shared/response';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';

@Controller('shift-type')
export class ShiftTypeController {
  constructor(private readonly shiftTypeService: ShiftTypeService) {}

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post()
  async create(@Body() createShiftTypeDto: CreateShiftTypeDto) {
    try {
      const data = await this.shiftTypeService.create(createShiftTypeDto);

      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Shift Type'),
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get()
  async findAll() {
    try {
      const [list, count] = await this.shiftTypeService.findAll({
        order: { created_at: 'DESC' },
      });

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Shift Type')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift Type'),
        data: list,
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
      const data = await this.shiftTypeService.findOneWhere({
        where: { id: id },
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift Type'),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Shift Type'),
        data: data,
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
    @Body() updateShiftTypeDto: UpdateShiftTypeDto,
  ) {
    try {
      const data = await this.shiftTypeService.findOneWhere({
        where: { id: id },
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Record'),
          data: {},
        });
      }

      const result = await this.shiftTypeService.updateWhere(
        { id: id },
        updateShiftTypeDto,
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Shift Type')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift Type'),
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
      const result = await this.shiftTypeService.remove(id, deleteDto);
      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Shift Type')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift Type'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
