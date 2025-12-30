import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Timecard } from './entities/timecard.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterTimecardDto } from '@/shift/dto/filter-timecard.dto';
import { TIMECARD_FILTER_TYPE, TIMECARD_STATUS } from '@/shared/constants/enum';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';

@Injectable()
export class TimecardsService {
  constructor(
    @InjectRepository(Timecard)
    private readonly timecardsRepository: Repository<Timecard>,
  ) {}

  async getAllTimecards(
    filterTimecardDto: FilterTimecardDto,
  ): Promise<[Timecard[], number]> {
    const {
      status,
      shift_start_date,
      shift_end_date,
      limit,
      offset,
      order,
      search,
      shift_id,
      timecard_status = [],
      facility = [],
      provider = [],
    } = filterTimecardDto;

    const and: string[] = [];
    const orderArr: string[] = [];
    let query = `SELECT * FROM timecard_list_view`;
    let countQuery = `SELECT COUNT(*)::INTEGER FROM timecard_list_view`;

    if (status) {
      const andStatus =
        status != TIMECARD_FILTER_TYPE.today
          ? `timecard_status = '${status}'`
          : `timecard_date::date = CURRENT_DATE::date`;
      and.push(andStatus);
    }

    if (timecard_status.length > 0) {
      and.push(
        `timecard_status IN (${timecard_status.map((s) => `'${s}'`).join(', ')})`,
      );
    }

    if (shift_start_date) {
      and.push(`start_date >= '${shift_start_date}'`);
    }
    if (shift_end_date) {
      and.push(`end_date <= '${shift_end_date}'`);
    }
    if (facility.length > 0) {
      and.push(`facility_id IN (${facility.map((f) => `'${f}'`).join(', ')})`);
    }
    if (provider.length > 0) {
      and.push(`provider_id IN (${provider.map((p) => `'${p}'`).join(', ')})`);
    }
    if (search) {
      const parsedSearch = parseSearchKeyword(search);
      and.push(
        `(name ILIKE '%${parsedSearch}%' OR facility ILIKE '%${parsedSearch}%') OR shift_number::TEXT ILIKE '%${parsedSearch}%'`,
      );
    }

    if (shift_id) {
      and.push(`shift_number = '${shift_id}'`);
    }

    if (and.length > 0) {
      query += ` WHERE ${and.join(' AND ')}`;
      countQuery += ` WHERE ${and.join(' AND ')}`;
    }

    Object.keys(order).forEach((key) => {
      if (order[key]) {
        if (key == 'created_at') {
          orderArr.push(`timecard_date DESC NULLS LAST`);
        } else if (key == 'timecard_status') {
          orderArr.push(`timecard_status::text ${order[key]} NULLS LAST`);
        } else {
          orderArr.push(`${key} ${order[key]}`);
        }
      }
    });

    query += ` ORDER BY ${orderArr.join(', ')} LIMIT ${limit} OFFSET ${offset};`;
    const timecards = await this.timecardsRepository.query(query);
    const countData = await this.timecardsRepository.query(countQuery);
    const count = countData[0]?.count || 0;

    return [timecards, count];
  }

  async getAllTimeCardForFacility(
    filterTimecardDto: FilterTimecardDto,
  ): Promise<[Timecard[], number]> {
    const {
      status,
      shift_start_date,
      shift_end_date,
      limit,
      offset,
      order,
      search,
      shift_id,
      timecard_status = [],
      facility = [],
      provider = [],
    } = filterTimecardDto;

    const and: string[] = [];
    const orderArr: string[] = [];
    let query = `SELECT * FROM timecard_list_view_for_admin_facility`;
    let countQuery = `SELECT COUNT(*)::INTEGER FROM timecard_list_view_for_admin_facility`;

    if (status) {
      const andStatus =
        status != TIMECARD_FILTER_TYPE.today
          ? `timecard_status = '${status}'`
          : `timecard_date::date = CURRENT_DATE::date`;
      and.push(andStatus);
    }

    if (timecard_status.length > 0) {
      if (timecard_status.includes(TIMECARD_STATUS.approved)) {
        and.push(
          `status IN (${timecard_status.map((s) => `'${s}'`).join(', ')})`,
        );
      } else {
        and.push(
          `timecard_status IN (${timecard_status.map((s) => `'${s}'`).join(', ')})`,
        );
      }
    }

    if (shift_start_date) {
      and.push(`start_date >= '${shift_start_date}'`);
    }
    if (shift_end_date) {
      and.push(`end_date <= '${shift_end_date}'`);
    }
    if (facility.length > 0) {
      and.push(`facility_id IN (${facility.map((f) => `'${f}'`).join(', ')})`);
    }
    if (provider.length > 0) {
      and.push(`provider_id IN (${provider.map((p) => `'${p}'`).join(', ')})`);
    }
    if (search) {
      const parsedSearch = parseSearchKeyword(search);
      and.push(
        `(name ILIKE '%${parsedSearch}%' OR facility ILIKE '%${parsedSearch}%') OR shift_number::TEXT ILIKE '%${parsedSearch}%'`,
      );
    }

    if (shift_id) {
      and.push(`shift_number = '${shift_id}'`);
    }

    if (and.length > 0) {
      query += ` WHERE ${and.join(' AND ')}`;
      countQuery += ` WHERE ${and.join(' AND ')}`;
    }

    Object.keys(order).forEach((key) => {
      if (order[key]) {
        if (key == 'created_at') {
          orderArr.push(`timecard_date DESC NULLS LAST`);
        } else if (key == 'timecard_status') {
          orderArr.push(`timecard_status::text ${order[key]} NULLS LAST`);
        } else {
          orderArr.push(`${key} ${order[key]}`);
        }
      }
    });

    query += ` ORDER BY ${orderArr.join(', ')} LIMIT ${limit} OFFSET ${offset};`;
    const timecards = await this.timecardsRepository.query(query);
    const countData = await this.timecardsRepository.query(countQuery);
    const count = countData[0]?.count || 0;

    return [timecards, count];
  }

  async getTimecardCount() {
    const flaggedCount = await this.timecardsRepository.count({
      where: { status: TIMECARD_STATUS.flagged },
    });

    const disputedCount = await this.timecardsRepository.count({
      where: { status: TIMECARD_STATUS.disputed },
    });

    const todaysTimecardCount = await this.timecardsRepository
      .createQueryBuilder('t')
      .where('t.created_at::date = CURRENT_DATE::date')
      .getCount();

    return {
      flagged: flaggedCount,
      disputed: disputedCount,
      today: todaysTimecardCount,
    };
  }
}
