import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOneOptions,
  FindOptionsWhere,
  In,
  LessThan,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { Timecard } from '@/timecards/entities/timecard.entity';
import {
  ACTION_TABLES,
  ACTIVITY_TYPE,
  EJS_FILES,
  INVOICE_STATE,
  INVOICE_STATUS,
  MEDIA_FOLDER,
  TABLE,
  TIMECARD_STATUS,
} from '@/shared/constants/enum';
import { plainToInstance } from 'class-transformer';
import { InvoiceTimecards } from './entities/invoice-timecards.entity';
import { Facility } from '@/facility/entities/facility.entity';
import * as moment from 'moment';
import {
  BilledInvoiceFilterDto,
  UnbilledInvoiceFilterDto,
} from './dto/unbilled-invoice-filter.dto';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { AccountingSetting } from '@/facility/entities/accounting-setting.entity';
import sendEmailHelper from '@/shared/helpers/send-email-helper';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { CONSTANT } from '@/shared/constants/message';
import { ShareInvoiceDto } from './dto/share-invoice.dto';
import * as ejs from 'ejs';
import puppeteer from 'puppeteer';
import * as path from 'path';
import * as fs from 'fs';
import { PaymentInvoice } from '@/payments/entities/payment-invoice.entity';
import { Payment } from '@/payments/entities/payment.entity';
import { IRequest } from '@/shared/constants/types';
import { getUpdatedFields } from '@/shared/helpers/get-updated-fields';
import { Activity } from '@/activity/entities/activity.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Timecard)
    private readonly timecardRepository: Repository<Timecard>,
    @InjectRepository(InvoiceTimecards)
    private readonly invoiceTimecardsRepository: Repository<InvoiceTimecards>,
    @InjectRepository(AccountingSetting)
    private readonly accountingSettingsRepository: Repository<AccountingSetting>,
    @InjectRepository(FacilityUser)
    private readonly facilityUserRepository: Repository<FacilityUser>,
    @InjectRepository(PaymentInvoice)
    private readonly paymentInvoiceRepository: Repository<PaymentInvoice>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  async findOneWhere(options: FindOneOptions<Invoice>): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne(options);
    return plainToInstance(Invoice, invoice);
  }

  async updateWhere(
    options: FindOptionsWhere<Invoice>,
    data: Partial<Invoice>,
  ) {
    const result = await this.invoiceRepository.update(options, data);
    return result;
  }

  getCycleStartDate(facility: Facility) {
    const cycleStartDate = facility.last_billing_date
      ? moment(facility.last_billing_date).add(1, 'days')
      : moment(facility.active_date);

    return cycleStartDate.toDate();
  }

  async getGeneratedTimecards(facility: Facility) {
    const timecards = await this.timecardRepository.find({
      relations: { shift: true },
      where: {
        status: TIMECARD_STATUS.approved,
        shift: {
          facility: { id: facility.id },
        },
      },
    });

    return timecards;
  }

  async removeGeneratedTimecards(timecards: Timecard[]) {
    const timecardIds = timecards.map((tc) => tc.id);

    const result = await this.invoiceTimecardsRepository.find({
      relations: { timecard: true, invoice: true },
      where: { timecard: { id: In(timecardIds) } },
      select: { invoice: { id: true }, timecard: { id: true } },
    });

    const newTimecards = timecards.filter(
      (tc) => !result.find((r) => r.timecard.id === tc.id),
    );

    const existingTimecards = timecards.filter((tc) =>
      result.find((r) => r.timecard.id === tc.id),
    );

    await this.timecardRepository.update(
      { id: In(existingTimecards.map((tc) => tc.id)) },
      { status: TIMECARD_STATUS.invoiced },
    );

    return newTimecards;
  }

  async generateInvoiceForFacility(
    facility: Facility,
    cycleStartDate: Date,
    lastBillingDate: Date,
  ) {
    let timecards = await this.getGeneratedTimecards(facility);
    timecards = await this.removeGeneratedTimecards(timecards);

    if (!timecards.length) return;

    let invoice = await this.invoiceRepository.findOne({
      where: {
        facility: { id: facility.id },
        status: INVOICE_STATE.generated,
        billing_cycle_start_date: MoreThanOrEqual(cycleStartDate),
        billing_cycle_end_date: LessThanOrEqual(lastBillingDate),
      },
    });

    if (!invoice) {
      invoice = await this.invoiceRepository.save({
        facility: { id: facility.id },
        status: INVOICE_STATE.generated,
        billing_cycle_start_date: cycleStartDate,
        billing_cycle_end_date: lastBillingDate,
      });
    }

    let totalAmount = 0;
    totalAmount += Number(invoice.total || 0);

    timecards.map((tc) => {
      totalAmount += Number(tc.shift.total_billable_amount);
    });

    this.invoiceRepository.update(invoice.id, {
      total: totalAmount,
      outstanding: totalAmount,
    });

    const timecardIds = timecards.map((tc) => tc.id);

    const invoiceTimecards = timecardIds.map((id) => ({
      invoice: { id: invoice.id },
      timecard: { id },
    }));

    await this.invoiceTimecardsRepository.save(
      plainToInstance(InvoiceTimecards, invoiceTimecards),
    );

    await this.timecardRepository.update(
      { id: In(timecardIds) },
      { status: TIMECARD_STATUS.invoiced },
    );

    const data = await this.getBilledInvoiceDetails(invoice.id);
    // log activity for invoice auto generated
    const emails = await this.getBillingContactEmails(data.facility_id);
    this.invoiceActivityLog(
      null,
      invoice.id,
      ACTIVITY_TYPE.INVOICE_AUTO_GENERATED,
      {
        invoice_number: data.invoice_number,
        facility_name: data.facility_name,
        billing_emails: emails,
      },
    );
  }

  async getAllUnbilledInvoices(filterDto: UnbilledInvoiceFilterDto) {
    const {
      start_date,
      end_date,
      facility = [],
      search,
      limit,
      offset,
      order,
    } = filterDto;

    let query = `SELECT * FROM unbilled_invoice`;
    let countQuery = `SELECT COUNT(*)::INTEGER FROM unbilled_invoice`;

    const and = [];
    const orderArr = [];
    const parsedSearch = search ? parseSearchKeyword(search) : null;

    if (start_date) {
      and.push(`created_at::date >= '${start_date}'`);
    }

    if (end_date) {
      and.push(`created_at::date <= '${end_date}'`);
    }

    if (facility.length) {
      and.push(`facility_id IN (${facility.map((f) => `'${f}'`).join(', ')})`);
    }

    if (parsedSearch) {
      and.push(
        `(facility_name ILIKE '%${parsedSearch}%' OR invoice_number ILIKE '%${parsedSearch}%')`,
      );
    }

    if (and.length > 0) {
      query += ` WHERE ${and.join(' AND ')}`;
      countQuery += ` WHERE ${and.join(' AND ')}`;
    }

    Object.keys(order).forEach((key) => {
      if (order[key]) {
        orderArr.push(`${key} ${order[key]}`);
      }
    });

    query += ` ORDER BY ${orderArr.join(', ')} LIMIT ${limit} OFFSET ${offset};`;
    const invoices = await this.invoiceRepository.query(query);
    const countData = await this.invoiceRepository.query(countQuery);
    const count = countData[0]?.count || 0;

    return [invoices, count];
  }

  async getUnbilledInvoiceSummary() {
    const data = await this.invoiceRepository
      .createQueryBuilder('i')
      .select([
        'COUNT(DISTINCT i.facility_id)::INTEGER AS facility_count',
        'ROUND(COALESCE(SUM(i.total), 0), 2)::DOUBLE PRECISION AS total_sum',
        `(
          SELECT
            COUNT(it.id)::INTEGER
          FROM
            invoice_timecards it
            LEFT JOIN invoices inv ON it.invoice_id = inv.id
          WHERE
            inv.status = 'generated'
        ) AS timecard_count`,
      ])
      .where('i.status = :status', { status: INVOICE_STATE.generated })
      .getRawOne();

    return data;
  }

  async getBilledInvoiceSummary() {
    const data = await this.invoiceRepository
      .createQueryBuilder('i')
      .select([
        `COUNT(*)::INTEGER AS invoice_count`,
        `ROUND(COALESCE(SUM(total - received), 0), 2)::DOUBLE PRECISION AS total_outstanding`,
        `ROUND(COALESCE(SUM(CASE WHEN current_date::date - billed_date::date < 30 THEN total - received ELSE 0 END), 0), 2)::DOUBLE PRECISION AS outstanding_lt_30`,
        `ROUND(COALESCE(SUM(CASE WHEN current_date::date - billed_date::date BETWEEN 30 AND 60 THEN total - received ELSE 0 END), 0), 2)::DOUBLE PRECISION AS outstanding_30_60`,
        `ROUND(COALESCE(SUM(CASE WHEN current_date::date - billed_date::date > 60 THEN total - received ELSE 0 END), 0), 2)::DOUBLE PRECISION AS outstanding_gt_60`,
      ])
      .where(`invoice_status IN (:...invoice_status)`, {
        invoice_status: [INVOICE_STATUS.unpaid, INVOICE_STATUS.partially_paid],
      })
      .andWhere('i.status IN (:...status)', {
        status: [INVOICE_STATE.billed, INVOICE_STATE.received],
      })
      .getRawOne();

    return data;
  }

  async getAllBilledInvoices(filterDto: BilledInvoiceFilterDto) {
    const {
      start_date,
      end_date,
      facility = [],
      invoice_status = [],
      aging,
      invoice_number,
      total,
      outstanding,
      search,
      limit,
      offset,
      order,
    } = filterDto;

    let query = `SELECT * FROM billed_invoices`;
    let countQuery = `SELECT COUNT(*)::INTEGER FROM billed_invoices`;

    const and = [];
    const orderArr = [];
    const parsedSearch = search ? parseSearchKeyword(search) : null;

    if (start_date) {
      and.push(`billed_date::date >= '${start_date}'`);
    }

    if (end_date) {
      and.push(`billed_date::date <= '${end_date}'`);
    }

    if (facility.length) {
      and.push(`facility_id IN (${facility.map((f) => `'${f}'`).join(', ')})`);
    }

    if (invoice_status.length) {
      and.push(
        `invoice_status IN (${invoice_status.map((s) => `'${s}'`).join(', ')})`,
      );
    }

    if (parsedSearch) {
      and.push(
        `(facility_name ILIKE '%${parsedSearch}%' OR invoice_number ILIKE '%${parsedSearch}%')`,
      );
    }

    if (invoice_number) {
      and.push(`invoice_number ILIKE '%${invoice_number}%'`);
    }

    if (total) {
      and.push(`total = ${total}`);
    }

    if (outstanding) {
      and.push(`outstanding = ${outstanding}`);
    }

    if (aging) {
      and.push(`aging = ${aging}`);
    }

    if (and.length > 0) {
      query += ` WHERE ${and.join(' AND ')}`;
      countQuery += ` WHERE ${and.join(' AND ')}`;
    }

    Object.keys(order).forEach((key) => {
      if (order[key]) {
        orderArr.push(`${key} ${order[key]}`);
      }
    });

    query += ` ORDER BY ${orderArr.join(', ')} LIMIT ${limit} OFFSET ${offset};`;
    const invoices = await this.invoiceRepository.query(query);
    const countData = await this.invoiceRepository.query(countQuery);
    const count = countData[0]?.count || 0;

    return [invoices, count];
  }

  async getBilledInvoiceDetails(id: string) {
    const invoice = await this.findOneWhere({
      relations: { facility: true },
      where: { id },
    });

    if (!invoice) return null;

    const dueDate = await this.getDueDateForInvoice(invoice);

    const [invoiceDetails] = await this.invoiceRepository.query(
      `SELECT * FROM invoice_details WHERE id = $1`,
      [id],
    );

    Object.assign(invoiceDetails, {
      due_date: dueDate,
    });
    return invoiceDetails;
  }

  async getInvoiceTimecard(id: string) {
    const invoice = await this.findOneWhere({
      relations: { facility: true },
      where: { id },
      select: {
        id: true,
        invoice_status: true,
        invoice_number: true,
        total: true,
        billed_date: true,
        created_at: true,
        billing_cycle_end_date: true,
        billing_cycle_start_date: true,
        outstanding: true,
        facility: { id: true, name: true },
      },
    });

    if (!invoice) return null;

    const dueDate = await this.getDueDateForInvoice(invoice);
    const agingInDays =
      invoice.status == INVOICE_STATE.received
        ? invoice.aging
        : await this.getInvoiceAgingInDays(invoice.id);

    const paymentInvoice = await this.paymentInvoiceRepository.findOne({
      where: { invoice: { id: invoice.id } },
      relations: { payment: true },
      order: { created_at: 'DESC' },
    });

    Object.assign(invoice, {
      due_date: dueDate,
      aging: agingInDays,
      payment: plainToInstance(Payment, paymentInvoice?.payment),
    });

    return invoice;
  }

  async getDueDateForInvoice(invoice: Invoice) {
    const accountingSettings = await this.accountingSettingsRepository.findOne({
      where: { facility: { id: invoice.facility.id } },
    });

    const dueDate = moment(invoice.billed_date)
      .add(accountingSettings.invoice_due, 'days')
      .toDate();

    return dueDate;
  }

  async getInvoiceAgingInDays(invoiceId: string) {
    const data = await this.invoiceRepository
      .createQueryBuilder('i')
      .select([
        `CASE
            WHEN i.status = 'received' THEN i.aging
            ELSE current_date - i.billed_date::date
          END AS aging`,
      ])
      .where('i.id = :invoiceId', { invoiceId })
      .getRawOne();

    return data.aging;
  }

  async billGeneratedInvoices() {
    const currentDate = new Date();
    const invoices = await this.invoiceRepository.find({
      relations: { facility: true },
      where: {
        status: INVOICE_STATE.generated,
        billing_cycle_end_date: LessThan(currentDate),
      },
      select: { id: true },
    });

    if (!invoices.length) return;

    await Promise.all(
      invoices.map(async ({ id, facility }) => {
        const timecards = await this.getGeneratedTimecards(facility);

        await this.updateWhere(
          { id },
          { status: INVOICE_STATE.billed, billed_date: currentDate },
        );

        const timecardIds = timecards.map((tc) => tc.id);

        await this.timecardRepository.update(
          { id: In(timecardIds) },
          { status: TIMECARD_STATUS.invoiced },
        );

        const data = await this.getBilledInvoiceDetails(id);
        if (!data) return;

        const emails = await this.getBillingContactEmails(data.facility_id);
        await this.invoiceActivityLog(
          null,
          data.id,
          ACTIVITY_TYPE.INVOICE_AUTO_BILLED,
          {
            invoice_number: data.invoice_number,
            facility_name: data.facility_name,
            billing_emails: emails,
            billing_cycle_start_date: data.billing_cycle_start_date,
            billing_cycle_end_date: data.billing_cycle_end_date,
          },
        );
        await this.sendBillingEmail(data);
      }),
    );
  }

  async sendBillingEmail(data: any) {
    const emails = await this.getBillingContactEmails(data.facility_id);
    const billingPeriod = this.getBillingPeriod(data);

    if (!emails.length) return;

    await this.sendEmail(data, emails, billingPeriod);
  }

  async sendEmail(data: any, emails: string[], billingPeriod: string) {
    const fileBuffer = await this.generateInvoicePdf(data);

    await Promise.all(
      emails.map((email) =>
        sendEmailHelper({
          email,
          authority: 'Nurses Now',
          email_type: EJS_FILES.invoice,
          supportEmail: process.env.SUPPORT_EMAIL,
          subject: CONSTANT.EMAIL.INVOICE_GENERATED(billingPeriod),
          data,
          attachments: [
            {
              filename: 'invoice.pdf',
              content: Buffer.from(fileBuffer),
              folder: MEDIA_FOLDER.credential,
              contentType: 'application/pdf',
            },
          ],
        }),
      ),
    );
  }

  async getBillingContactEmails(facilityId: string): Promise<string[]> {
    // First, try to get emails of users with billing permissions for the facility
    const billingUsers = await this.facilityUserRepository
      .createQueryBuilder('u')
      .select('u.email')
      .innerJoin('facility_user_permission', 'up', 'up.facility_user_id = u.id')
      .innerJoin(
        'facility_permission',
        'p',
        'p.id = up.facility_permission_id AND p.name IN (:...names)',
        { names: ['can_see_billing_summary', 'can_manage_billing'] },
      )
      .where('u.facility_id @> :facilityId', { facilityId: [facilityId] })
      .groupBy('u.email')
      .getRawMany();

    let emails = billingUsers.map((u) => u.u_email);

    // If none found, fallback to primary facility user
    if (!emails.length) {
      const primaryUser = await this.facilityUserRepository
        .createQueryBuilder('u')
        .select('u.email')
        .where('u.primary_facility_id = :facilityId', { facilityId })
        .getRawOne();
      if (primaryUser?.u_email) emails = [primaryUser.u_email];
      else if (primaryUser?.email) emails = [primaryUser.email];
    }

    return emails;
  }

  async billInvoice(
    invoice: Invoice,
    req: IRequest,
    activity_type: ACTIVITY_TYPE,
  ) {
    if (invoice.status === INVOICE_STATE.generated) {
      await this.updateWhere(
        { id: invoice.id },
        { status: INVOICE_STATE.billed, billed_date: new Date() },
      );
    }

    const data = await this.getBilledInvoiceDetails(invoice.id);

    if (!data) return;

    await this.sendBillingEmail(data);
    // log activity for invoice
    const emails = await this.getBillingContactEmails(data.facility_id);
    this.invoiceActivityLog(req, invoice.id, activity_type, {
      invoice_number: data.invoice_number,
      facility_name: data.facility_name,
      billing_emails: emails,
    });
  }

  async shareInvoice(shareInvoiceDto: ShareInvoiceDto, req: IRequest) {
    const { id, emails } = shareInvoiceDto;

    const data = await this.getBilledInvoiceDetails(id);

    if (!data) return;

    const billingPeriod = this.getBillingPeriod(data);

    // log activity for invoice sent
    await this.sendEmail(data, emails, billingPeriod);
    this.invoiceActivityLog(req, id, ACTIVITY_TYPE.INVOICE_SENT, {
      invoice_number: data.invoice_number,
      facility_name: data.facility_name,
      billing_emails: emails,
    });
  }

  getBillingPeriod(data: any) {
    return `${new Date(data.billing_cycle_start_date).toLocaleDateString('en-US')} - ${new Date(data.billing_cycle_end_date).toLocaleDateString('en-US')}`;
  }

  async getAllInvoiceTimecards(id: string) {
    const invoice = await this.invoiceTimecardsRepository.find({
      relations: { timecard: true },
      where: { invoice: { id } },
      select: { timecard: { id: true } },
    });

    const timecardIds = invoice.map((inv) => inv.timecard.id);

    if (!timecardIds.length) return [];

    const timecards = await this.timecardRepository.query(
      `SELECT * FROM invoice_timecards_view WHERE id IN (${timecardIds.map((id) => `'${id}'`).join(', ')});`,
    );

    return timecards;
  }

  async generateInvoicePdf(data: any) {
    const pdfPath = 'public/document/invoice.pdf';
    const templatePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'src/shared/ejs-templates/',
      'invoice-pdf.ejs',
    );
    const html = await ejs.renderFile(templatePath, { data });

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();

    // prevent navigation timeout when rendering complex EJS templates
    page.setDefaultNavigationTimeout(0);
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 0 });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
    });

    await browser.close();

    fs.writeFileSync(pdfPath, pdfBuffer);
    return pdfBuffer;
  }
  // Tracking the activity
  async invoiceActivityLog(
    req: IRequest,
    entity_id: string,
    activity_type: ACTIVITY_TYPE,
    message: Record<string, any>,
    action_for: ACTION_TABLES = ACTION_TABLES.INVOICES,
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
  async invoiceActivityUpdateLog(
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

    await this.invoiceActivityLog(
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
