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
  Req,
} from '@nestjs/common';
import { FacilityNoteService } from './facility-note.service';
import { CreateFacilityNoteDto } from './dto/create-facility-note.dto';
import { UpdateFacilityNoteDto } from './dto/update-facility-note.dto';
import response from '@/shared/response';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { CONSTANT } from '@/shared/constants/message';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { IRequest } from '@/shared/constants/types';
import { FacilityNoteFilterDto } from './dto/queryFilter.dto';
import { ACTIVITY_TYPE, TABLE } from '@/shared/constants/enum';

@Controller('facility-note')
export class FacilityNoteController {
  constructor(private readonly facilityNoteService: FacilityNoteService) {}

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post()
  async create(
    @Body() createFacilityNoteDto: CreateFacilityNoteDto,
    @Req() req: IRequest,
  ) {
    try {
      createFacilityNoteDto.created_by_id = req.user.id;

      const data = await this.facilityNoteService.create(createFacilityNoteDto);
      const notesDetails = await this.facilityNoteService.getNoteWithRelations(
        data.id,
      );
      const related = {
        facilities: notesDetails.facilities.map((facility) => facility.name),
        facility_users: notesDetails.facilityUsers.map(
          (facilityUser) =>
            `${facilityUser.first_name} ${facilityUser.last_name}`,
        ),
        providers: notesDetails.providers.map(
          (provider) => `${provider.first_name} ${provider.last_name}`,
        ),
      };

      await this.facilityNoteService.facilityNoteActivityLog(
        req,
        data.id,
        ACTIVITY_TYPE.FACILITY_NOTE_ADDED,
        {
          related,
          note: notesDetails.description,
        },
      );
      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Facility Note'),
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get()
  async findAll(@Query() facilityNoteFilterDto: FacilityNoteFilterDto) {
    try {
      const [data, count] = await this.facilityNoteService.detailedList(
        facilityNoteFilterDto,
      );

      return response.successResponseWithPagination({
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Facility Note')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facility Note'),
        total: count,
        limit: +facilityNoteFilterDto.limit,
        offset: +facilityNoteFilterDto.offset,
        data: data || [],
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
  @Roles('admin', 'facility', 'facility_user', 'provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('relates_to/:table')
  async relatesTo(
    @Param('table') table: TABLE,
    @Query() facilityNoteFilterDto: FacilityNoteFilterDto,
    @Req() req: IRequest,
  ) {
    try {
      const [data, count] = await this.facilityNoteService.relatesToList(
        req.user.id,
        facilityNoteFilterDto,
      );

      return response.successResponseWithPagination({
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Facility Note')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facility Note'),
        total: count,
        limit: +facilityNoteFilterDto.limit,
        offset: +facilityNoteFilterDto.offset,
        data: data || [],
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
      const data = await this.facilityNoteService.findOneWhere({
        where: {
          id: id,
        },
      });
      return response.successResponse({
        message: data
          ? CONSTANT.SUCCESS.RECORD_FOUND('Facility Note')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facility Note'),
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
    @Body() updateFacilityNoteDto: UpdateFacilityNoteDto,
    @Req() req: IRequest,
  ) {
    try {
      const note = await this.facilityNoteService.findOneWhere({
        where: {
          id: id,
        },
        select: { id: true, created_by_id: true },
        relations: { created_by_id: true },
      });
      if (!note) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility Note'),
          data: {},
        });
      }

      if (note.created_by_id.id !== req.user.id) {
        return response.badRequest({
          message: CONSTANT.ERROR.NOT_ALLOWED_TO('update Facility Note'),
          data: {},
        });
      }

      const data = await this.facilityNoteService.update(
        id,
        updateFacilityNoteDto,
      );
      return response.successResponse({
        message: data.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Facility Note')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Facility Note'),
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
    @Req() req: IRequest,
  ) {
    try {
      const note = await this.facilityNoteService.findOneWhere({
        where: {
          id: id,
        },
        select: { id: true, created_by_id: true },
        relations: { created_by_id: true },
      });
      if (!note) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility Note'),
          data: {},
        });
      }
      if (note.created_by_id.id !== req.user.id) {
        return response.badRequest({
          message: CONSTANT.ERROR.NOT_ALLOWED_TO('delete Facility Note'),
          data: {},
        });
      }
      const notesDetails = await this.facilityNoteService.getNoteWithRelations(
        note.id,
      );
      const result = await this.facilityNoteService.remove(id, deleteDto);
      const related = {
        facilities: notesDetails.facilities.map((facility) => facility.name),
        facility_users: notesDetails.facilityUsers.map(
          (facilityUser) =>
            `${facilityUser.first_name} ${facilityUser.last_name}`,
        ),
        providers: notesDetails.providers.map(
          (provider) => `${provider.first_name} ${provider.last_name}`,
        ),
      };

      await this.facilityNoteService.facilityNoteActivityLog(
        req,
        id,
        ACTIVITY_TYPE.FACILITY_NOTE_DELETED,
        {
          related,
        },
      );
      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Facility Note')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facility Note'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
