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
import { FacilityDocumentService } from './facility-document.service';
import { CreateFacilityDocumentDto } from './dto/create-facility-document.dto';
import { UpdateFacilityDocumentDto } from './dto/update-facility-document.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { Roles } from '@/shared/decorator/role.decorator';
import response from '@/shared/response';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import { CreateFacilityDocumentCategoryDto } from './dto/create-facility-document-category.dto';
import { CONSTANT } from '@/shared/constants/message';
import { UpdateFacilityDocumentCategoryDto } from './dto/update-facility-document-category.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';

@Controller('facility-document')
export class FacilityDocumentController {
  constructor(
    private readonly facilityDocumentService: FacilityDocumentService,
  ) {}

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post('category')
  async createCategory(
    @Body()
    createFacilityDocumentCategoryDto: CreateFacilityDocumentCategoryDto,
  ) {
    try {
      const category = await this.facilityDocumentService.checkCategoryName(
        createFacilityDocumentCategoryDto.name,
      );

      if (category) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Category'),
          data: {},
        });
      }

      const data = await this.facilityDocumentService.createCategory(
        createFacilityDocumentCategoryDto,
      );
      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Document Category'),
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post()
  async create(@Body() createFacilityDocumentDto: CreateFacilityDocumentDto) {
    try {
      const document = await this.facilityDocumentService.checkName(
        createFacilityDocumentDto.name,
        createFacilityDocumentDto.facility_document_category,
      );

      if (document) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Document'),
          data: {},
        });
      }

      const data = await this.facilityDocumentService.create(
        createFacilityDocumentDto,
      );

      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Document'),
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
      const list = await this.facilityDocumentService.findAll({
        relations: {
          facility_document: true,
        },
        select: {
          id: true,
          name: true,
          created_at: true,
          facility_document: {
            id: true,
            name: true,
            is_required: true,
            created_at: true,
          },
        },
      });

      return response.successResponse({
        message: list.length
          ? CONSTANT.SUCCESS.RECORD_FOUND('Documents')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Documents'),
        data: list.length ? list : [],
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch('category/:id')
  async updateCategory(
    @Param('id', UUIDValidationPipe) id: string,
    @Body()
    updateFacilityDocumentCategoryDto: UpdateFacilityDocumentCategoryDto,
  ) {
    try {
      const category = await this.facilityDocumentService.findOneCategory({
        where: { id },
      });

      if (!category) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Category'),
          data: {},
        });
      }

      const data = await this.facilityDocumentService.checkCategoryName(
        updateFacilityDocumentCategoryDto.name,
      );

      if (data && data.id !== id) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Category'),
          data: {},
        });
      }

      const result = await this.facilityDocumentService.updateCategory(
        { id },
        updateFacilityDocumentCategoryDto,
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Category')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Category'),
        data: {},
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
    @Body() updateFacilityDocumentDto: UpdateFacilityDocumentDto,
  ) {
    try {
      const document = await this.facilityDocumentService.findOneDocument({
        where: { id },
      });

      if (!document) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Document'),
          data: {},
        });
      }

      const data = await this.facilityDocumentService.checkName(
        updateFacilityDocumentDto.name,
        updateFacilityDocumentDto.facility_document_category,
      );

      if (data && data.id !== id) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Document'),
          data: {},
        });
      }

      const result = await this.facilityDocumentService.updateDocument(
        { id },
        updateFacilityDocumentDto,
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Document')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Document'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Delete('category/:id')
  async removeCategory(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() deleteDto: DeleteDto,
  ) {
    try {
      const category = await this.facilityDocumentService.findOneCategory({
        where: { id },
      });

      if (!category) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Category'),
          data: {},
        });
      }

      const result = await this.facilityDocumentService.removeCategory(
        { id },
        deleteDto,
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Category')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Category'),
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
      const document = await this.facilityDocumentService.findOneDocument({
        where: { id },
      });

      if (!document) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Document'),
          data: {},
        });
      }

      const result = await this.facilityDocumentService.removeDocument(
        { id },
        deleteDto,
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Document')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Document'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
