import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ProviderAcknowledgementService } from './provider-acknowledgement.service';
import { CreateProviderAcknowledgementDto } from './dto/create-provider-acknowledgement.dto';
import response from '@/shared/response';
import { ProviderService } from '@/provider/provider.service';
import { IsNull, Not } from 'typeorm';
import { CONSTANT } from '@/shared/constants/message';
import { SubAcknowledgement } from './entities/sub-acknowledgement.entity';
import { AuthGuard } from '@nestjs/passport';
import { IRequest } from '@/shared/constants/types';
import { Roles } from '@/shared/decorator/role.decorator';
import { RoleGuard } from '@/shared/guard/role.guard';

@Controller('provider-acknowledgement')
export class ProviderAcknowledgementController {
  constructor(
    private readonly providerAcknowledgementService: ProviderAcknowledgementService,
    private readonly providerService: ProviderService,
  ) {}

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post()
  async setAcknowledgement(
    @Req() req: IRequest,
    @Body() createProviderAcknowledgementDto: CreateProviderAcknowledgementDto,
  ) {
    try {
      const providerData = await this.providerService.findOneWhere({
        where: { id: req.user.id, provider_acknowledgement: Not(IsNull()) },
      });

      if (providerData) {
        return response.badRequest({
          message: CONSTANT.ERROR.ACKNOWLEDGEMENT_ALREADY_SUBMITTED,
          data: {},
        });
      }

      const acknowledgementQuestions: SubAcknowledgement[] = [];

      for (const acknowledgement of createProviderAcknowledgementDto.acknowledgementQuestions) {
        const acknowledgementResponse =
          await this.providerAcknowledgementService.createAcknowledgementResponse(
            acknowledgement,
          );
        acknowledgementQuestions.push(acknowledgementResponse);
      }
      delete createProviderAcknowledgementDto.acknowledgementQuestions;
      const provider = await this.providerService.findOneWhere({
        where: { id: req.user.id },
      });
      const reqBody = {
        ...createProviderAcknowledgementDto,
        subAcknowledgement: acknowledgementQuestions,
        base_url: process.env.AWS_ASSETS_PATH,
        provider,
      };

      const result =
        await this.providerAcknowledgementService.createProviderAcknowledgement(
          reqBody,
        );

      return response.successCreate({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Acknowledgement submitted'),
        data: result,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
