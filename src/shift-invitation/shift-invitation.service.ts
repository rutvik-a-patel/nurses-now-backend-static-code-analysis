import { Injectable } from '@nestjs/common';
import { CreateShiftInvitationDto } from './dto/create-shift-invitation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ShiftInvitation } from './entities/shift-invitation.entity';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { plainToClass, plainToInstance } from 'class-transformer';
import { UpdateShiftInvitationDto } from './dto/update-shift-invitation.dto';
import { ProviderOrientation } from '@/provider-orientation/entities/provider-orientation.entity';
import { FilterShiftInvitation } from './dto/filter-shift-invitation.dto';

@Injectable()
export class ShiftInvitationService {
  constructor(
    @InjectRepository(ShiftInvitation)
    private readonly shiftInvitationRepository: Repository<ShiftInvitation>,
    @InjectRepository(ProviderOrientation)
    private readonly providerOrientationShiftRepository: Repository<ProviderOrientation>,
  ) {}
  async create(
    createShiftInvitationDto:
      | CreateShiftInvitationDto
      | CreateShiftInvitationDto[],
  ) {
    const data = plainToInstance(ShiftInvitation, createShiftInvitationDto);
    const result = await this.shiftInvitationRepository.save(data);
    return plainToInstance(ShiftInvitation, result);
  }

  async update(
    where: FindOptionsWhere<ShiftInvitation>,
    updateShiftInvitationDto: UpdateShiftInvitationDto,
  ) {
    const data = plainToClass(ShiftInvitation, updateShiftInvitationDto);
    const record = await this.shiftInvitationRepository.update(where, {
      ...data,
      updated_at: new Date().toISOString(),
    });
    return record;
  }

  async findOneWhere(options: FindOneOptions<ShiftInvitation>) {
    const result = await this.shiftInvitationRepository.findOne(options);
    return plainToInstance(ShiftInvitation, result);
  }

  async findAll(
    options: FindManyOptions<ShiftInvitation>,
  ): Promise<[ShiftInvitation[], number]> {
    const [list, count] =
      await this.shiftInvitationRepository.findAndCount(options);
    return [plainToInstance(ShiftInvitation, list), count];
  }

  async remove(where: FindOptionsWhere<ShiftInvitation>) {
    const result = await this.shiftInvitationRepository.update(where, {
      deleted_at: new Date().toISOString(),
    });

    return result;
  }

  async getAllShiftInvitations(
    id: string,
    queryParamsDto: FilterShiftInvitation,
  ): Promise<[ShiftInvitation[], number]> {
    const rawQueryCte = `
      WITH combined_data AS (
        SELECT
          si.id AS record_id,
          si.shift_id,
          p.id AS provider_id,
          p.first_name AS first_name,
          p.last_name AS last_name,
          p.base_url AS base_url,
          p.profile_image AS image,
          si.invited_on AS invited_on,
          CASE
            WHEN si.status IN ('invited', 'unseen') AND si.shift_status = 'auto_scheduling' THEN 'ai_scheduling'
            WHEN si.status IN ('invited', 'unseen') THEN 'facility_invited'
            WHEN si.status = 'withdrawn' THEN 'facility_withdrawn'
            WHEN si.status = 'rejected' THEN 'provider_rejected'
            WHEN si.status = 'cancelled' THEN 'provider_cancelled'
            ELSE CAST(si.status AS VARCHAR)
          END AS invitation_status,
          s.status AS shift_status,
          'invitation' AS source
        FROM shift_invitation si
        LEFT JOIN shift s ON si.shift_id = s.id
        LEFT JOIN provider p ON si.provider_id = p.id
        LEFT JOIN provider_cancelled_shift pcs
        ON pcs.shift_id = s.id AND pcs.provider_id = si.provider_id
        WHERE s.id = $1 AND s.deleted_at IS NULL AND si.deleted_at IS NULL

        UNION ALL

        SELECT
          sr.id AS record_id,
          sr.shift_id,
          p.id AS provider_id,
          p.first_name AS first_name,
          p.last_name AS last_name,
          p.base_url AS base_url,
          p.profile_image AS image,
          sr.created_at AS invited_on,
          CASE
            WHEN sr.status IN ('unassigned') THEN 'provider_requested'
            WHEN sr.status = 'cancelled' THEN 'provider_cancelled'
            ELSE CAST(sr.status AS VARCHAR)
          END AS invitation_status,
          s.status AS shift_status,
          'request' AS source
        FROM shift_request sr
        LEFT JOIN shift s ON sr.shift_id = s.id
        LEFT JOIN provider p ON sr.provider_id = p.id
        LEFT JOIN provider_cancelled_shift pcs
        ON pcs.shift_id = s.id AND pcs.provider_id = sr.provider_id
        WHERE sr.status != 'rejected'
          AND s.id = $1 AND s.deleted_at IS NULL AND sr.deleted_at IS NULL
      )
    `;

    // Prepare dynamic filters & parameters
    const params: any[] = [id]; // $1 = shift id
    const whereParts: string[] = [];

    // Date filters (inclusive end date)
    if (queryParamsDto?.start_date) {
      params.push(queryParamsDto.start_date);
      whereParts.push(`invited_on >= $${params.length}::date`);
    }
    if (queryParamsDto?.end_date) {
      params.push(queryParamsDto.end_date);
      // inclusive: invited_on < endDate + 1 day
      whereParts.push(
        `invited_on < ($${params.length}::date + INTERVAL '1 day')`,
      );
    }

    if (queryParamsDto?.provider?.length) {
      whereParts.push(
        `provider_id IN (${queryParamsDto.provider.map((p) => `'${p}'`).join(', ')})`,
      );
    }

    // Status filter (multiple allowed)
    if (
      queryParamsDto.invitation_status &&
      queryParamsDto.invitation_status.length
    ) {
      params.push(queryParamsDto.invitation_status);
      // $n is a text[]; filter includes only these statuses
      whereParts.push(`invitation_status = ANY($${params.length}::text[])`);
    }

    const whereClause = whereParts.length
      ? `WHERE ${whereParts.join(' AND ')}`
      : '';

    // Build dynamic ORDER BY clause
    let orderClause = 'ORDER BY invited_on DESC';
    if (queryParamsDto?.order) {
      const orderEntries = Object.entries(queryParamsDto.order)
        .filter(
          ([column, dir]) =>
            ['asc', 'desc'].includes(dir.toLowerCase()) &&
            /^[a-zA-Z0-9_]+$/.test(column), // basic SQL injection guard
        )
        .map(
          ([column, dir]) =>
            `"${column === 'created_at' ? 'invited_on' : column}" ${dir.toUpperCase()}`,
        );
      if (orderEntries.length > 0) {
        orderClause = `ORDER BY ${orderEntries.join(', ')}`;
      }
    }

    const rawQuery = `
  ${rawQueryCte}
  SELECT 
  *
  FROM combined_data
  ${whereClause}
  ${orderClause};
  `;

    const countQuery = `
      ${rawQueryCte}
      SELECT
       COUNT(*)::INTEGER AS total_count
      FROM combined_data
      ${whereClause};
    `;

    const list = await this.shiftInvitationRepository.query(rawQuery, params);
    const countRows = await this.shiftInvitationRepository.query(
      countQuery,
      params,
    );
    const count = countRows?.[0]?.total_count ?? 0;

    return [list, count];
  }

  async updateOrCreateInvitation({ shiftId, providerId, status, shiftStatus }) {
    const existing = await this.shiftInvitationRepository.findOne({
      where: {
        shift: { id: shiftId },
        provider: { id: providerId },
      },
    });

    if (existing) {
      return this.shiftInvitationRepository.update(existing.id, {
        status,
        shift_status: shiftStatus,
        invited_on: new Date().toISOString(),
      });
    } else {
      return this.shiftInvitationRepository.save({
        shift: { id: shiftId },
        provider: { id: providerId },
        status,
        shift_status: shiftStatus,
      });
    }
  }

  async updateProviderOrientation(shiftInvite: ShiftInvitation) {
    await this.providerOrientationShiftRepository.update(
      {
        facility: { id: shiftInvite.shift.facility.id },
        provider: { id: shiftInvite.provider.id },
      },
      {
        shift: { id: shiftInvite.shift.id },
      },
    );
  }
}
