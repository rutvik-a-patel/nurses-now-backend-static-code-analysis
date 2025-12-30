import { Injectable } from '@nestjs/common';
import { FilterDnrReportDto } from './dto/filter-report.dto';
import { FacilityProvider } from '@/facility-provider/entities/facility-provider.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(FacilityProvider)
    private readonly facilityProviderRepository: Repository<FacilityProvider>,
  ) {}

  async getAllDnrReport(
    filterDnrReportDto: FilterDnrReportDto,
  ): Promise<[FacilityProvider[], number]> {
    const {
      facility_id = [],
      provider_id = [],
      certificate_id = [],
      status = [],
      dnr_type = [],
      staff,
      search,
      start_date,
      end_date,
      limit,
      offset,
      order,
    } = filterDnrReportDto;

    let query = `select * from dnr_report`;
    let countQuery = `select count(*) from dnr_report`;

    const orderArr = [];
    const andConditions: string[] = [];

    if (facility_id.length) {
      andConditions.push(
        `facility->>'id' IN (${facility_id.map((f) => `'${f}'`).join(', ')})`,
      );
    }

    if (provider_id.length) {
      andConditions.push(
        `provider->>'id' IN (${provider_id.map((p) => `'${p}'`).join(', ')})`,
      );
    }

    if (status.length) {
      andConditions.push(
        `provider ->> 'status_id' IN (${status.map((s) => `'${s}'`).join(', ')})`,
      );
    }

    if (certificate_id.length) {
      andConditions.push(
        `provider -> 'certificate' ->> 'id' IN (${certificate_id.map((c) => `'${c}'`).join(', ')})`,
      );
    }

    if (dnr_type.length) {
      andConditions.push(
        `dnr_type IN (${dnr_type.map((d) => `'${d}'`).join(', ')})`,
      );
    }

    if (search && parseSearchKeyword(search)) {
      andConditions.push(
        `(facility->>'name' ILIKE '%${parseSearchKeyword(search)}%' OR ((provider->>'first_name') || ' ' || (provider->>'last_name')) ILIKE '%${parseSearchKeyword(search)}%')`,
      );
    }

    if (start_date) {
      andConditions.push(`TO_CHAR(dnr_at, 'YYYY-MM-DD') >= '${start_date}'`);
    }
    if (end_date) {
      andConditions.push(`TO_CHAR(dnr_at, 'YYYY-MM-DD') <= '${end_date}'`);
    }

    if (staff) {
      andConditions.push(`provider->>'first_name' ILIKE '%${staff}%'`);
    }

    if (order) {
      // map expected order keys to actual DB columns/aliases
      const columnMap: Record<string, string> = {
        'facility.name': `facility->>'name'`,
        'certificate.abbreviation': `provider -> 'certificate' ->> 'abbreviation'`,
        'status.name': `provider->>'status'`,
        'dnr_reason.reason': `dnr_reason->>'reason'`,
        'dnr_reason.dnr_description': `dnr_reason->>'dnr_description'`,
        provider: `provider->>'first_name'`,
        dnr_type: 'dnr_type',
        created_at: 'dnr_at',
      };

      Object.entries(order).forEach(([key, dir]) => {
        const column = columnMap[key] ?? key; // fallback to provided key if not mapped
        const direction = String(dir).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        // ensure only allowed columns are used to avoid injection - check against map keys or allow explicit table.column
        const allowed =
          Object.values(columnMap).includes(column) ||
          /^[a-zA-Z0-9_.]+$/.test(column); // basic safe-fallback
        if (allowed) {
          orderArr.push(`${column} ${direction}`);
        }
      });
    }

    if (andConditions.length) {
      query += ` WHERE ${andConditions.join(' AND ')}`;
      countQuery += ` WHERE ${andConditions.join(' AND ')}`;
    }

    if (orderArr.length) {
      query += ` ORDER BY ${orderArr.join(', ')}`;
    }

    if (+limit > 0) {
      query += ` LIMIT ${+limit}`;
    }

    if (offset) {
      query += ` OFFSET ${+offset}`;
    }

    const list = await this.facilityProviderRepository.query(query);
    const countData = await this.facilityProviderRepository.query(countQuery);

    const count = parseInt(countData[0]?.count || '0', 10);

    return [list, count];
  }
}
