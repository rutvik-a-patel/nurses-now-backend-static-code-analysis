import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Param,
  Patch,
} from '@nestjs/common';
import { EDocResponseService } from './e-doc-response.service';
import { CreateEDocResponseDto } from './dto/create-e-doc-response.dto';
import response from '@/shared/response';
import { IRequest } from '@/shared/constants/types';
import { CONSTANT } from '@/shared/constants/message';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import { UpdateEDocResponseDto } from './dto/update-e-doc-response.dto';
import s3DeleteFile from '@/shared/helpers/s3-delete-file';
import { ProviderCredentialsService } from '@/provider-credentials/provider-credentials.service';
import { Provider } from '@/provider/entities/provider.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('e-doc-response')
export class EDocResponseController {
  constructor(
    private readonly eDocResponseService: EDocResponseService,
    private readonly providerCredentialsService: ProviderCredentialsService,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
  ) {}

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post()
  async create(
    @Body() createEDocResponseDto: CreateEDocResponseDto,
    @Req() req: IRequest,
  ) {
    try {
      createEDocResponseDto.provider = req.user.id;
      createEDocResponseDto.base_url = process.env.AWS_ASSETS_PATH;
      const data = await this.eDocResponseService.create(createEDocResponseDto);

      const credentialsProgress =
        await this.providerCredentialsService.getCredentialsProgress(req.user);

      await this.providerRepository.update(req.user.id, {
        credentials_completion_ratio: credentialsProgress,
      });

      return response.successCreate({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('E Doc Uploaded'),
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch(':id')
  async update(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() updateEDocResponseDto: UpdateEDocResponseDto,
  ) {
    try {
      const data = await this.eDocResponseService.findOneWhere({
        where: { id },
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('E Doc Response'),
          data: {},
        });
      }

      await s3DeleteFile(data.document);

      const result = await this.eDocResponseService.updateWhere(
        { id },
        updateEDocResponseDto,
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.SUCCESSFULLY('E Doc Uploaded')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('E Doc Response'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
