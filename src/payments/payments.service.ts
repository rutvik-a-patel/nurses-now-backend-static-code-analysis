import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { In, Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Invoice } from '@/invoices/entities/invoice.entity';
import { plainToInstance } from 'class-transformer';
import {
  ACTION_TABLES,
  ACTIVITY_TYPE,
  INVOICE_STATE,
  INVOICE_STATUS,
  PAYMENT_TYPE,
  TABLE,
  TIMECARD_PAYMENT_STATUS,
} from '@/shared/constants/enum';
import { FilterPaymentDto } from './dto/filter-payment.dto';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { Timecard } from '@/timecards/entities/timecard.entity';
import { Activity } from '@/activity/entities/activity.entity';
import { IRequest } from '@/shared/constants/types';
import { getUpdatedFields } from '@/shared/helpers/get-updated-fields';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Timecard)
    private readonly timecardRepository: Repository<Timecard>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  async getInvoices(invoiceIds: string[]): Promise<Invoice[]> {
    const invoices = await this.invoiceRepository.find({
      where: { id: In(invoiceIds) },
      relations: { facility: true },
      select: { facility: { id: true, name: true } },
    });
    return plainToInstance(Invoice, invoices);
  }

  async getInvoiceTimecardIds(
    invoiceIds: string[],
  ): Promise<Record<string, string[]>> {
    const invoices = await this.invoiceRepository.find({
      where: { id: In(invoiceIds) },
      relations: {
        invoice_timecards: { timecard: true },
      },
    });

    const timecardIds: Record<string, string[]> = {};

    for (const invoice of invoices) {
      timecardIds[invoice.id] =
        invoice.invoice_timecards?.map((it) => it.timecard.id) ?? [];
    }

    return timecardIds;
  }

  async createPayment(createPaymentDto: CreatePaymentDto) {
    const { payment_invoices, filename } = createPaymentDto;
    createPaymentDto.base_url = filename
      ? process.env.AWS_ASSETS_PATH
      : undefined;
    const paymentInvoices = payment_invoices.map((pi) => ({
      invoice: { id: pi.id },
    }));

    const payment = await this.paymentRepository.save(
      plainToInstance(Payment, {
        ...createPaymentDto,
        payment_invoices: paymentInvoices,
      }),
    );
    return {
      id: payment.id,
      payment_id: payment.payment_id,
      amount: payment.amount,
      payment_date: payment.payment_date,
    };
  }

  async addPayment(
    createPaymentDto: CreatePaymentDto,
    req: IRequest,
  ): Promise<Payment> {
    const { payment_invoices, payment_type } = createPaymentDto;
    const invoiceIds = payment_invoices.map((pi) => pi.id);
    const invoices = await this.getInvoices(invoiceIds);
    const timecardIds = await this.getInvoiceTimecardIds(invoiceIds);
    let totalOutstanding = 0;

    invoices.map(async (invoice: Invoice) => {
      const invoiceData = payment_invoices.find((pi) => pi.id === invoice.id);
      if (!invoiceData) return invoice;
      invoice.received =
        Number(invoice.received ?? 0) + Number(invoiceData.received);
      invoice.outstanding = Number(invoice.total) - invoice.received;
      totalOutstanding += invoice.outstanding;
      let paymentStatus =
        payment_type === PAYMENT_TYPE.adjustment
          ? INVOICE_STATUS.paid
          : INVOICE_STATUS.partially_paid;
      paymentStatus =
        invoice.outstanding > 0
          ? INVOICE_STATUS.partially_paid
          : INVOICE_STATUS.paid;
      invoice.invoice_status = paymentStatus;
      invoice.status = INVOICE_STATE.received;

      if (paymentStatus === INVOICE_STATUS.paid) {
        invoice.aging = await this.getInvoiceAgingInDays(invoice.id);
      }

      await this.timecardRepository.update(
        { id: In(timecardIds[invoice.id] || []) },
        { payment_status: TIMECARD_PAYMENT_STATUS.paid },
      );

      // payment activity log for partial invoice
      if (paymentStatus === INVOICE_STATUS.partially_paid) {
        await this.paymentActivityLog(
          req,
          invoice.id,
          ACTIVITY_TYPE.PAYMENT_PARTIALLY_ALLOCATED,
          {
            amount: createPaymentDto.amount,
            invoice_number: invoice.invoice_number,
            outstanding: invoice.outstanding,
            payer_name: invoice.facility.name,
            unallocated_amount: createPaymentDto.unallocated_amount,
            type: createPaymentDto.payment_type,
            transaction_number: createPaymentDto.transaction_number,
          },
          ACTION_TABLES.PAYMENTS,
        );
      }

      // payment activity log for partial invoice
      if (paymentStatus === INVOICE_STATUS.paid) {
        await this.paymentActivityLog(
          req,
          invoice.id,
          ACTIVITY_TYPE.PAYMENT_RECORDED,
          {
            amount: createPaymentDto.amount,
            invoice_number: invoice.invoice_number,
            outstanding: invoice.outstanding,
            payer_name: invoice.facility.name,
            unallocated_amount: createPaymentDto.unallocated_amount,
            type: createPaymentDto.payment_type,
            transaction_number: createPaymentDto.transaction_number,
          },
          ACTION_TABLES.PAYMENTS,
        );
      }

      return invoice;
    });
    await this.invoiceRepository.save(invoices);
    createPaymentDto.outstanding = totalOutstanding;
    const payment = await this.createPayment(createPaymentDto);
    return plainToInstance(Payment, payment);
  }

  async getAllPayments(
    filterDto: FilterPaymentDto,
  ): Promise<[Payment[], number]> {
    const {
      start_date,
      end_date,
      order,
      search,
      limit,
      offset,
      facility = [],
    } = filterDto;

    let query = `SELECT * from payment_list`;
    let countQuery = `SELECT COUNT(*) FROM payment_list`;
    const parsedSearch = search ? parseSearchKeyword(search) : null;
    const and = [];

    if (start_date) {
      and.push(`created_at::date >= '${start_date}'`);
    }

    if (end_date) {
      and.push(`created_at::date <= '${end_date}'`);
    }

    if (parsedSearch) {
      and.push(
        `payment_id ILIKE '%${parsedSearch}%' OR facility ILIKE '%${parsedSearch}%'`,
      );
    }

    if (facility.length) {
      and.push(`facility_id IN (${facility.map((id) => `'${id}'`).join(',')})`);
    }

    if (and.length) {
      query += ` WHERE ${and.join(' AND ')}`;
      countQuery += ` WHERE ${and.join(' AND ')}`;
    }

    Object.keys(order).forEach((key) => {
      query += ` ORDER BY ${key} ${order[key]}`;
    });

    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const payments = await this.paymentRepository.query(query);
    const countData = await this.paymentRepository.query(countQuery);
    const count = Number(countData[0]?.count ?? 0);

    return [payments, count];
  }

  async getInvoiceAgingInDays(invoiceId: string) {
    const data = await this.invoiceRepository
      .createQueryBuilder('i')
      .select([`current_date - i.billed_date::date AS aging`])
      .where('i.id = :invoiceId', { invoiceId })
      .getRawOne();

    return data.aging;
  }

  // Tracking the activity
  async paymentActivityLog(
    req: IRequest,
    entity_id: string,
    activity_type: ACTIVITY_TYPE,
    message: Record<string, any>,
    action_for: ACTION_TABLES = ACTION_TABLES.PAYMENTS,
  ) {
    const action_by_type: TABLE = req?.user?.role;
    const action_by_id: string = req?.user?.id;

    const activity = this.activityRepository.create({
      action_by_type,
      entity_id,
      [action_by_type]: action_by_id,
      activity_type,
      message: {
        [action_by_type]:
          `${req?.user?.first_name} ${req?.user?.last_name}` || 'System',
        image:
          req?.user?.base_url +
          (req?.user.role === TABLE.provider
            ? req?.user?.profile_image
            : req?.user?.image),
        ...message,
      },
      action_for,
    });
    await this.activityRepository.save(activity);
  }

  // role update activity
  async paymentActivityUpdateLog(
    req: IRequest,
    entity_id: string,
    activity_type: ACTIVITY_TYPE,
    oldData: Record<string, any>,
    newData: Record<string, any>,
    includedKeys?: string[],
    action_for?: ACTION_TABLES,
  ) {
    const changes = getUpdatedFields(
      oldData,
      newData,
      includedKeys, // include keys to track
      true,
    ) as string[];

    const changesList = changes as string[] | undefined;
    if (!changesList || changesList.length === 0) return;

    await this.paymentActivityLog(
      req,
      entity_id,
      activity_type,
      {
        facility_name: newData.name,
        changes: changesList,
      },
      action_for,
    );
  }
}
