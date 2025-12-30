import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { Roles } from '@/shared/decorator/role.decorator';
import { RoleGuard } from '@/shared/guard/role.guard';
import { AuthGuard } from '@nestjs/passport';
import {
  BilledInvoiceFilterDto,
  UnbilledInvoiceFilterDto,
} from './dto/unbilled-invoice-filter.dto';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import { ShareInvoiceDto } from './dto/share-invoice.dto';
import {
  ACTIVITY_TYPE,
  INVOICE_STATE,
  PERMISSIONS,
  SECTIONS,
  SUB_SECTION,
} from '@/shared/constants/enum';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';
import { IRequest } from '@/shared/constants/types';

@Section(SECTIONS.invoices, SUB_SECTION.invoices)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Roles('admin', 'facility', 'facility_user')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('unbilled')
  async getAllUnbilledInvoices(@Query() filterDto: UnbilledInvoiceFilterDto) {
    try {
      const [invoices, count] =
        await this.invoicesService.getAllUnbilledInvoices(filterDto);

      return response.successResponseWithPagination({
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Unbilled invoices')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Unbilled invoices'),
        data: invoices,
        total: count,
        limit: +filterDto.limit,
        offset: +filterDto.offset,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('unbilled-summary')
  async getUnbilledInvoiceSummary() {
    try {
      const summary = await this.invoicesService.getUnbilledInvoiceSummary();

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Unbilled invoice summary'),
        data: summary,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('billed-summary')
  async getBilledInvoiceSummary() {
    try {
      const summary = await this.invoicesService.getBilledInvoiceSummary();

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Billed invoice summary'),
        data: summary,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('billed')
  async getAllBilledInvoices(@Query() filterDto: BilledInvoiceFilterDto) {
    try {
      const [invoices, count] =
        await this.invoicesService.getAllBilledInvoices(filterDto);

      return response.successResponseWithPagination({
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Billed invoices')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Billed invoices'),
        data: invoices,
        total: count,
        limit: +filterDto.limit,
        offset: +filterDto.offset,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('details/:id')
  async getBilledInvoiceDetails(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const invoice = await this.invoicesService.getBilledInvoiceDetails(id);

      if (!invoice) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Invoice'),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Invoice'),
        data: invoice,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('timecard/:id')
  async getInvoiceTimecard(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const timecard = await this.invoicesService.getInvoiceTimecard(id);

      if (!timecard) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Invoice'),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Invoice'),
        data: timecard,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.bill)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Patch('bill-now/:id')
  async billInvoice(
    @Param('id', UUIDValidationPipe) id: string,
    @Req() req: IRequest,
  ) {
    try {
      const invoice = await this.invoicesService.findOneWhere({
        where: { id },
        relations: { facility: true },
      });

      if (!invoice) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Invoice'),
          data: {},
        });
      }

      await this.invoicesService.billInvoice(
        invoice,
        req,
        ACTIVITY_TYPE.INVOICE_MANUALLY_BILLED,
      );

      return response.successResponse({
        message:
          invoice.status === INVOICE_STATE.generated
            ? CONSTANT.SUCCESS.SUCCESSFULLY('Invoice billed')
            : CONSTANT.SUCCESS.SUCCESSFULLY('Invoice sent'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.email)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Patch('resend/:id')
  async resendInvoice(
    @Param('id', UUIDValidationPipe) id: string,
    @Req() req: IRequest,
  ) {
    try {
      const invoice = await this.invoicesService.findOneWhere({
        where: { id },
        relations: { facility: true },
      });

      if (!invoice) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Invoice'),
          data: {},
        });
      }

      await this.invoicesService.billInvoice(
        invoice,
        req,
        ACTIVITY_TYPE.INVOICE_RE_SENT,
      );

      return response.successResponse({
        message:
          invoice.status === INVOICE_STATE.generated
            ? CONSTANT.SUCCESS.SUCCESSFULLY('Invoice billed')
            : CONSTANT.SUCCESS.SUCCESSFULLY('Invoice sent'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('all-timecards/:id')
  async getAllInvoiceTimecards(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const timecards = await this.invoicesService.getAllInvoiceTimecards(id);

      return response.successResponse({
        message: timecards.length
          ? CONSTANT.SUCCESS.RECORD_FOUND('Timecards')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Timecards'),
        data: timecards,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.email)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post('share-invoice')
  async shareInvoice(
    @Body() shareInvoiceDto: ShareInvoiceDto,
    @Req() req: IRequest,
  ) {
    try {
      const invoice = await this.invoicesService.findOneWhere({
        where: { id: shareInvoiceDto.id },
        relations: { facility: true },
      });

      if (!invoice) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Invoice'),
          data: {},
        });
      }

      await this.invoicesService.shareInvoice(shareInvoiceDto, req);

      return response.successResponse({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Invoice sent'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}
