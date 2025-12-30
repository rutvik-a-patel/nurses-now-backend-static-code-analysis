import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AssignedCredentialsService } from './assigned-credentials.service';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import response from '@/shared/response';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import { CreateAssignedCredentialDto } from './dto/create-assigned-credential.dto';
import { CONSTANT } from '@/shared/constants/message';
import { IRequest } from '@/shared/constants/types';
import { ACTIVITY_TYPE } from '@/shared/constants/enum';

@Controller('assigned-credentials')
export class AssignedCredentialsController {
  constructor(
    private readonly assignedCredentialsService: AssignedCredentialsService,
  ) {}

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post(':id')
  async assignCredential(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() createAssignedCredentialDto: CreateAssignedCredentialDto,
    @Req() req: IRequest,
  ) {
    try {
      const provider =
        await this.assignedCredentialsService.findOneProviderWhere({
          where: { id },
        });

      if (!provider) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        });
      }

      await this.assignedCredentialsService.create(
        createAssignedCredentialDto,
        provider.id,
      );

      // Activity Log
      await this.assignedCredentialsService.assignCredentialActivityLog(
        req,
        provider.id,
        ACTIVITY_TYPE.STAFF_CREDENTIAL_ASSIGNED,
        {
          provider_name: `${provider.first_name} ${provider.last_name}`,
        },
      );

      return response.successCreate({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Credential Assigned'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
