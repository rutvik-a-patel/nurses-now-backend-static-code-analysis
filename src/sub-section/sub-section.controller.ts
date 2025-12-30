import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SubSectionService } from './sub-section.service';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';

@Controller('sub-section')
export class SubSectionController {
  constructor(private readonly subSectionService: SubSectionService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('/:id')
  async getAllSections(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const data = await this.subSectionService.findAll({
        where: { section: { id: id } },
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Sub Section'),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Section'),
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
