import {
  Controller,
  Post,
  Body,
  UseGuards,
  Delete,
  Param,
  Patch,
  Get,
  Query,
} from '@nestjs/common';
import { ReferenceFormDesignService } from './reference-form-design.service';
import { CreateReferenceFormDto } from './dto/create-reference-form-design.dto';
import response from '@/shared/response';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { Roles } from '@/shared/decorator/role.decorator';
import { CONSTANT } from '@/shared/constants/message';
import { UpdateReferenceFormDto } from './dto/update-reference-form-design.dto';
import { MultiSelectQueryParamsDto } from '@/shared/dto/query-params.dto';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import {
  DEFAULT_STATUS,
  PERMISSIONS,
  SECTIONS,
  SUB_SECTION,
} from '@/shared/constants/enum';
import { ILike, Not } from 'typeorm';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Section(SECTIONS.admin_portal_settings, SUB_SECTION.reference_form_settings)
@Controller('reference-form-design')
export class ReferenceFormDesignController {
  constructor(
    private readonly referenceFormDesignService: ReferenceFormDesignService,
  ) {}

  @Roles('admin')
  @Permission(PERMISSIONS.add)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post()
  async create(@Body() createReferenceFormDto: CreateReferenceFormDto) {
    try {
      const { reference_form } = createReferenceFormDto;
      const isExist = await this.referenceFormDesignService.findOneWhere({
        where: { name: ILike(`${createReferenceFormDto.name}`) },
      });
      if (isExist) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Reference Form'),
          data: { name: true },
        });
      }

      if (createReferenceFormDto.status === DEFAULT_STATUS.active) {
        const activeReferenceForm =
          await this.referenceFormDesignService.findOneWhere({
            where: { status: DEFAULT_STATUS.active },
          });
        if (activeReferenceForm) {
          await this.referenceFormDesignService.update(
            { id: activeReferenceForm.id },
            {
              status: DEFAULT_STATUS.in_active,
            },
          );
        }
      }
      const data = await this.referenceFormDesignService.createReferenceForm(
        createReferenceFormDto,
      );

      await this.referenceFormDesignService.createReferenceFormDesign(
        data,
        reference_form,
      );

      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Reference Form'),
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
  async updateReferenceForm(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() updateReferenceFormDto: UpdateReferenceFormDto,
  ) {
    try {
      const referenceForm = await this.referenceFormDesignService.findOneWhere({
        where: { id: id },
      });

      if (!referenceForm) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Reference Form'),
          data: {},
        });
      }

      const isExist = await this.referenceFormDesignService.findOneWhere({
        where: { id: Not(id), name: ILike(`${updateReferenceFormDto.name}`) },
      });

      if (isExist) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Reference Form'),
          data: { name: true },
        });
      }
      if (updateReferenceFormDto.status === DEFAULT_STATUS.active) {
        const activeReferenceForm =
          await this.referenceFormDesignService.findOneWhere({
            where: { status: DEFAULT_STATUS.active },
          });
        if (activeReferenceForm) {
          await this.referenceFormDesignService.update(
            { id: activeReferenceForm.id },
            {
              status: DEFAULT_STATUS.in_active,
            },
          );
        }
      }

      await this.referenceFormDesignService.updateReferenceForm(
        referenceForm,
        updateReferenceFormDto,
      );

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_UPDATED('Reference Form'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get(':id')
  async findOne(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const referenceForm = await this.referenceFormDesignService.findOneWhere({
        relations: {
          reference_form_design: {
            reference_form_option: true,
          },
        },
        where: { id: id },
      });

      if (!referenceForm) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Reference Form'),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Reference Form'),
        data: referenceForm,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get()
  async findAll(@Query() queryParamsDto: MultiSelectQueryParamsDto) {
    try {
      const [list, count] =
        await this.referenceFormDesignService.findAll(queryParamsDto);

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Reference Form')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Reference Form'),
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
  async deleteReferenceForm(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const referenceForm = await this.referenceFormDesignService.findOneWhere({
        relations: {
          reference_form_design: {
            reference_form_option: true,
          },
        },
        where: { id: id },
      });

      if (!referenceForm) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Reference Form'),
          data: {},
        });
      }

      if (referenceForm.status === DEFAULT_STATUS.active) {
        return response.badRequest({
          message: CONSTANT.ERROR.CANNOT_DELETE_ACTIVE_RECORD('reference form'),
          data: {},
        });
      }
      await this.referenceFormDesignService.remove(referenceForm);

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_DELETED('Reference Form'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
