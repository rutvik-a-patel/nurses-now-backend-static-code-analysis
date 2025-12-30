import { Controller, Get, UseGuards } from '@nestjs/common';
import { SectionService } from './section.service';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { AuthGuard } from '@nestjs/passport';

@Controller('section')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAllSections() {
    try {
      const data = await this.sectionService.findAll({});
      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Section'),
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
