import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SpecialityService } from './speciality.service';
import { AuthGuard } from '@nestjs/passport';
import { CONSTANT } from '@/shared/constants/message';
import response from '@/shared/response';
import { CreateSpecialityDto } from './dto/create-speciality.dto';
import { UpdateSpecialityDto } from './dto/update-speciality.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { Roles } from '@/shared/decorator/role.decorator';
import { RoleGuard } from '@/shared/guard/role.guard';
import { CertSpecFilterQueryDto } from '@/certificate/dto/certificate-filter.dto';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { PERMISSIONS, SECTIONS, SUB_SECTION } from '@/shared/constants/enum';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Section(SECTIONS.admin_portal_settings, SUB_SECTION.specialities)
@Controller('speciality')
export class SpecialityController {
  constructor(private readonly specialityService: SpecialityService) {}

  @Roles('admin')
  @Permission(PERMISSIONS.add)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post()
  async createSpeciality(@Body() createSpecialityDto: CreateSpecialityDto) {
    try {
      const speciality =
        await this.specialityService.checkName(createSpecialityDto);

      if (speciality) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Specialty or Abbreviation'),
          data: {},
        });
      }

      const data = await this.specialityService.create(createSpecialityDto);
      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Specialty'),
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.edit)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Patch(':id')
  async updateSpeciality(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() updateSpecialityDto: UpdateSpecialityDto,
  ) {
    try {
      const speciality = await this.specialityService.findOneWhere({
        where: {
          id: id,
        },
      });

      if (!speciality) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Specialty'),
          data: {},
        });
      }

      const alreadyExists =
        await this.specialityService.checkName(updateSpecialityDto);

      if (alreadyExists && alreadyExists.id !== id) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Specialty or Abbreviation'),
          data: {},
        });
      }

      const data = await this.specialityService.update(id, updateSpecialityDto);
      return response.successResponse({
        message: data.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Specialty')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Specialty'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('/:id')
  async findOne(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const speciality = await this.specialityService.getSpecialityDetails(id);

      if (!speciality) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Specialty'),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Specialty'),
        data: speciality,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get()
  async findAll(@Query() queryParamsDto: CertSpecFilterQueryDto) {
    try {
      const [list, count] =
        await this.specialityService.findAll(queryParamsDto);

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Specialty')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Specialty'),
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
  @Permission(PERMISSIONS.delete)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Delete(':id')
  async remove(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() deleteDto: DeleteDto,
  ) {
    try {
      const isSpecialityUsed =
        await this.specialityService.isSpecialityUsed(id);

      if (isSpecialityUsed) {
        return response.badRequest({
          message: CONSTANT.ERROR.CANNOT_DELETE('Specialty'),
          data: {},
        });
      }

      const result = await this.specialityService.remove(id, deleteDto);
      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Specialty')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Specialty'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
