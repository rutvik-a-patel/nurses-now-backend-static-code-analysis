import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOneOptions,
  FindOptionsWhere,
  In,
  IsNull,
  Repository,
} from 'typeorm';
import { RateGroup } from './entities/rate-group.entity';
import { CreateRateGroupDto } from './dto/create-rate-group.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateRateGroupDto } from './dto/update-rate-group.dto';
import { RateSheet } from './entities/rate-sheet.entity';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { Certificate } from '@/certificate/entities/certificate.entity';

@Injectable()
export class RateGroupsService {
  constructor(
    @InjectRepository(RateGroup)
    private readonly rateGroupRepository: Repository<RateGroup>,
    @InjectRepository(RateSheet)
    private readonly rateSheetRepository: Repository<RateSheet>,
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
  ) {}

  async findOneWhere(options: FindOneOptions<RateGroup>): Promise<RateGroup> {
    const data = await this.rateGroupRepository.findOne(options);
    return plainToInstance(RateGroup, data);
  }

  async createRateGroup(createRateGroupDto: CreateRateGroupDto) {
    const data = await this.rateGroupRepository.save(
      plainToInstance(RateGroup, createRateGroupDto),
    );
    return data;
  }

  async canDeleteRateSheets(certificateIds: string[]) {
    const certificates = await this.certificateRepository.find({
      where: {
        id: In(certificateIds),
        status: DEFAULT_STATUS.active,
      },
      select: { id: true },
    });

    return certificates.length ? false : true;
  }

  async updateRateGroup(
    options: FindOptionsWhere<RateGroup>,
    updateRateGroupDto: UpdateRateGroupDto,
  ) {
    const data = await this.rateGroupRepository.update(
      options,
      plainToInstance(RateGroup, updateRateGroupDto),
    );
    return data;
  }

  async getInActiveCertificates(certificateIds: string[]) {
    const certificates = await this.certificateRepository.find({
      where: {
        id: In(certificateIds),
        status: DEFAULT_STATUS.in_active,
      },
      select: { id: true },
    });

    const inActiveCertificates = certificates.filter((cert) =>
      certificateIds.some((id) => id === cert.id),
    );

    return inActiveCertificates;
  }

  async saveRateGroup(createRateGroupDto: CreateRateGroupDto) {
    const {
      rate_sheets = [],
      deleted_rate_sheets = [],
      ...payload
    } = createRateGroupDto;
    const where = payload.facility
      ? { facility: { id: payload.facility } }
      : { facility: IsNull() };

    const existingRateGroup = await this.findOneWhere({
      where,
      relations: { rate_sheets: true },
    });

    if (!existingRateGroup) {
      await this.createRateGroup(createRateGroupDto);
      return;
    }

    if (payload) await this.updateRateGroup(where, payload);

    if (rate_sheets.length) {
      await this.rateSheetRepository.save(
        rate_sheets.map((rate_sheet) =>
          plainToInstance(RateSheet, {
            ...rate_sheet,
            rate_group: { id: existingRateGroup.id },
          }),
        ),
      );
    }

    if (!deleted_rate_sheets.length) return;

    const inActiveCertificates =
      await this.getInActiveCertificates(deleted_rate_sheets);

    if (inActiveCertificates.length) {
      await this.rateSheetRepository.softDelete({
        certificate: {
          id: In(deleted_rate_sheets),
        },
        rate_group: {
          id: existingRateGroup.id,
        },
      });
    }
  }

  async getRateGroup(facilityId: string | undefined) {
    const where = facilityId
      ? { facility: { id: facilityId } }
      : { facility: IsNull() };

    let data = await this.findOneWhere({
      where,
    });

    let doesExist = true;
    if (!data) {
      doesExist = false;
      data = await this.findOneWhere({
        where: { facility: IsNull() },
      });

      if (!data) return null;
    }

    const rateSheets = await this.getRateSheet(data.id);

    if (!doesExist) {
      rateSheets.map((rateSheet) => {
        delete rateSheet.id;
        rateSheet.rate_sheet.map((rate) => {
          delete rate.id;
          return rate;
        });
        return rateSheet;
      });
      delete data.id;
    }

    return { ...data, rate_list: rateSheets };
  }

  async getRateSheet(id: string) {
    const data = await this.rateSheetRepository.query(
      `SELECT * FROM rate_list WHERE id=$1`,
      [id],
    );

    return data;
  }
}
