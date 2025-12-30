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
import { CertificateService } from './certificate.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { Roles } from '@/shared/decorator/role.decorator';
import { RoleGuard } from '@/shared/guard/role.guard';
import { CertSpecFilterQueryDto } from './dto/certificate-filter.dto';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { PERMISSIONS, SECTIONS, SUB_SECTION } from '@/shared/constants/enum';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Section(SECTIONS.admin_portal_settings, SUB_SECTION.license)
@Controller('certificate')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Roles('admin')
  @Permission(PERMISSIONS.add)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post()
  async createCertificate(@Body() createCertificateDto: CreateCertificateDto) {
    try {
      const certificate =
        await this.certificateService.checkName(createCertificateDto);

      if (certificate) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('License or Abbreviation'),
          data: {},
        });
      }

      const data = await this.certificateService.create(createCertificateDto);
      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('License'),
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.edit)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Patch('/:id')
  async updateCertificate(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() updateCertificateDto: UpdateCertificateDto,
  ) {
    try {
      const certificate = await this.certificateService.findOneWhere({
        where: {
          id: id,
        },
      });

      if (!certificate) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('License'),
          data: {},
        });
      }

      const alreadyExists =
        await this.certificateService.checkName(updateCertificateDto);

      if (alreadyExists && alreadyExists.id !== id) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('License or Abbreviation'),
          data: {},
        });
      }

      const data = await this.certificateService.update(
        id,
        updateCertificateDto,
      );
      return response.successResponse({
        message: data.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('License')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('License'),
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
      const certificate =
        await this.certificateService.getCertificateDetails(id);

      if (!certificate) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('License'),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('License'),
        data: certificate,
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
        await this.certificateService.findAll(queryParamsDto);

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('License')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('License'),
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
      const isCertificateUsed =
        await this.certificateService.isCertificateUsed(id);

      if (isCertificateUsed) {
        return response.badRequest({
          message: CONSTANT.ERROR.CANNOT_DELETE('License'),
          data: {},
        });
      }

      const result = await this.certificateService.remove(id, deleteDto);
      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('License')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('License'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
