import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { TestFaqsService } from './test-faqs.service';
import { TestFaqDto } from './dto/create-test-faq.dto';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { In } from 'typeorm';

@Controller('test-faqs')
export class TestFaqsController {
  constructor(private readonly testFaqsService: TestFaqsService) {}

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post()
  async create(@Body() createTestFaqDto: TestFaqDto) {
    try {
      const { delete_faqs = [] } = createTestFaqDto;

      if (delete_faqs.length) {
        delete createTestFaqDto.delete_faqs;
        await this.testFaqsService.remove(
          { id: In(delete_faqs) },
          {
            deleted_at_ip: createTestFaqDto.updated_at_ip,
          },
        );
      }

      if (createTestFaqDto?.faqs?.length) {
        await this.testFaqsService.create(createTestFaqDto.faqs);
      }

      return response.successCreate({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Test FAQs Saved'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get()
  async findAll() {
    try {
      const [list, count] = await this.testFaqsService.findAll({
        where: {
          status: DEFAULT_STATUS.active,
        },
        order: {
          order: 'ASC',
        },
        select: {
          id: true,
          question: true,
          answer: true,
          order: true,
          created_at: true,
        },
      });
      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Test FAQs')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Test FAQs'),
        data: list,
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
