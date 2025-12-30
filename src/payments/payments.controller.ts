import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '@/shared/decorator/role.decorator';
import { RoleGuard } from '@/shared/guard/role.guard';
import response from '@/shared/response';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CONSTANT } from '@/shared/constants/message';
import { FilterPaymentDto } from './dto/filter-payment.dto';
import { PERMISSIONS, SECTIONS, SUB_SECTION } from '@/shared/constants/enum';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';
import { IRequest } from '@/shared/constants/types';

@Section(SECTIONS.invoices, SUB_SECTION.invoices)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Roles('admin')
  @Permission(PERMISSIONS.add_payment)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post()
  async addPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @Req() req: IRequest,
  ) {
    try {
      const payment = await this.paymentsService.addPayment(
        createPaymentDto,
        req,
      );

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_ADDED('Payment'),
        data: payment,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get()
  async getAllPayments(@Query() filterDto: FilterPaymentDto) {
    try {
      const [payments, count] =
        await this.paymentsService.getAllPayments(filterDto);

      return response.successResponseWithPagination({
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Payments')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Payments'),
        total: count,
        limit: +filterDto.limit,
        offset: +filterDto.offset,
        data: payments,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
