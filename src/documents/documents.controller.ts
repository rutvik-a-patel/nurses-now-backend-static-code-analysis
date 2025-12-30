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
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import { IRequest } from '@/shared/constants/types';
import { DocumentFilter } from './dto/document-filter.dto';
import { ACTION_TABLES, ACTIVITY_TYPE } from '@/shared/constants/enum';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Roles('admin', 'facility', 'facility_user', 'provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post()
  async create(
    @Body() createDocumentDto: CreateDocumentDto,
    @Req() req: IRequest,
  ) {
    try {
      createDocumentDto.name = createDocumentDto.name
        ? createDocumentDto.name
        : createDocumentDto.original_filename;
      createDocumentDto.base_url = createDocumentDto.base_url
        ? createDocumentDto.base_url
        : process.env.AWS_ASSETS_PATH;
      createDocumentDto.uploaded_by_id = req.user.id;
      createDocumentDto.uploaded_by_type = req.user.role;
      createDocumentDto.uploaded_at = new Date();

      const data = await this.documentsService.create(createDocumentDto);

      const document = await this.documentsService.findOneWhere({
        where: { id: data.id },
        relations: { facility: true },
      });

      if (document) {
        await this.documentsService.documentsActivityLog(
          req,
          document.id,
          ACTIVITY_TYPE.FACILITY_DOCUMENT_ADDED,
          {
            document_id: document.id,
            document_name: document.name,
            facility_name: document.facility?.name,
          },
          ACTION_TABLES.DOCUMENTS,
        );
      }

      return response.successCreate({
        message: CONSTANT.SUCCESS.FILE_UPLOADED('Document'),
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user', 'provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get()
  async findAll(@Query() queryParamsDto: DocumentFilter) {
    try {
      const [list, count] =
        await this.documentsService.fetchAllDocumentsByFilter(queryParamsDto);
      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Document')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Document'),
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
  @Get(':id')
  async findOne(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const data = await this.documentsService.findOneWhere({
        where: {
          id: id,
        },
      });
      return response.successResponse({
        message: data
          ? CONSTANT.SUCCESS.RECORD_FOUND('Document')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Document'),
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
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    try {
      const type = await this.documentsService.findOneWhere({
        where: {
          id: id,
        },
      });

      if (!type) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Document'),
          data: {},
        });
      }

      const data = await this.documentsService.update(id, updateDocumentDto);
      return response.successResponse({
        message: data.affected
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
  @Delete(':id')
  async remove(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const result = await this.documentsService.remove(id);
      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Document')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Document'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
