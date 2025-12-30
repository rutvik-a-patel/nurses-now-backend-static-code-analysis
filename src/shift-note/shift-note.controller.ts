import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  Req,
  Patch,
  Delete,
} from '@nestjs/common';
import { ShiftNoteService } from './shift-note.service';
import { CreateShiftNoteDto } from './dto/create-shift-note.dto';
import { UpdateShiftNoteDto } from './dto/update-shift-note.dto';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { Roles } from '@/shared/decorator/role.decorator';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { IRequest } from '@/shared/constants/types';
import { DeleteDto } from '@/shared/dto/delete.dto';

@Controller('shift-note')
export class ShiftNoteController {
  constructor(private readonly shiftNoteService: ShiftNoteService) {}

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post()
  async create(
    @Body() createShiftNoteDto: CreateShiftNoteDto,
    @Req() req: IRequest,
  ) {
    try {
      await this.shiftNoteService.create(createShiftNoteDto, req.user.id);
      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Note'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get(':shift_id')
  async findByShiftId(
    @Param('shift_id', UUIDValidationPipe) shiftId: string,
    @Query() queryParamsDto: QueryParamsDto,
  ) {
    try {
      const [notes, total] = await this.shiftNoteService.findByShiftId(
        shiftId,
        +queryParamsDto.limit,
        +queryParamsDto.offset,
      );

      return response.successResponseWithPagination({
        message: total
          ? CONSTANT.SUCCESS.RECORD_FOUND('Notes')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Notes'),
        total,
        limit: +queryParamsDto.limit,
        offset: +queryParamsDto.offset,
        data: notes,
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
    @Body() updateShiftNoteDto: UpdateShiftNoteDto,
  ) {
    try {
      const note = await this.shiftNoteService.findOne(id);

      if (!note) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Note'),
          data: {},
        });
      }

      const result = await this.shiftNoteService.update(id, updateShiftNoteDto);
      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Note')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Note'),
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
      const note = await this.shiftNoteService.findOne(id);

      if (!note) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Note'),
          data: {},
        });
      }

      const result = await this.shiftNoteService.remove(id, deleteDto);
      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Note')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Note'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
