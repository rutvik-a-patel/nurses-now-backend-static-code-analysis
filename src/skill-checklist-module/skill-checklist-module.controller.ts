import { IRequest } from '@/shared/constants/types';
import response from '@/shared/response';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SkillChecklistModuleService } from './skill-checklist-module.service';
import { AuthGuard } from '@nestjs/passport';
import { CONSTANT } from '@/shared/constants/message';
import { RoleGuard } from '@/shared/guard/role.guard';
import { Roles } from '@/shared/decorator/role.decorator';
import { SkillChecklistResponseDto } from './dto/skill-checklist-response.dto';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';

@Controller('skill-checklist-module')
export class SkillChecklistModuleController {
  constructor(
    private readonly skillChecklistModuleService: SkillChecklistModuleService,
  ) {}

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('topics')
  async getSkillChecklistTopics(@Req() req: IRequest) {
    try {
      const { user } = req;

      if (!user?.certificate) {
        return response.badRequest({
          message: CONSTANT.ERROR.INCOMPLETE_PROFILE,
          data: {},
        });
      }

      const checklistResponse =
        await this.skillChecklistModuleService.getSkillChecklistResponse({
          where: { provider: { id: user.id } },
        });

      if (!checklistResponse) {
        const data =
          await this.skillChecklistModuleService.getSkillChecklistTemplate(
            user,
          );

        if (data) {
          await this.skillChecklistModuleService.saveSkillChecklist(data, user);
        }
      }

      const checklist =
        await this.skillChecklistModuleService.getAssignedChecklist(user);

      return response.successResponse({
        message: checklist
          ? CONSTANT.SUCCESS.RECORD_FOUND('Skill Checklist Module')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Skill Checklist Module'),
        data: checklist ? checklist : {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post('response/:id')
  async saveProviderSkillChecklistResponse(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() skillChecklistResponseDto: SkillChecklistResponseDto[],
  ) {
    try {
      const checklistResponse =
        await this.skillChecklistModuleService.getSkillChecklistResponse({
          where: { id },
        });

      if (!checklistResponse) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Skill Checklist Module'),
          data: {},
        });
      }

      const data =
        await this.skillChecklistModuleService.saveSkillChecklistAnswer(
          skillChecklistResponseDto,
        );

      return response.successCreate({
        message: CONSTANT.SUCCESS.SUCCESSFULLY(
          'Skill Checklist Response Submitted',
        ),
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
