import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, IsNull, Repository } from 'typeorm';
import { Speciality } from './entities/speciality.entity';
import { plainToInstance } from 'class-transformer';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { CreateSpecialityDto } from './dto/create-speciality.dto';
import { UpdateSpecialityDto } from './dto/update-speciality.dto';
import { Credential } from '@/credentials/entities/credential.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { colorCombination } from '@/shared/constants/constant';
import { CertSpecFilterQueryDto } from '@/certificate/dto/certificate-filter.dto';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';

@Injectable()
export class SpecialityService {
  constructor(
    @InjectRepository(Speciality)
    private readonly specialityRepository: Repository<Speciality>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(Shift)
    private shiftRepository: Repository<Shift>,
    @InjectRepository(Credential)
    private credentialRepository: Repository<Credential>,
  ) {}
  async create(createSpecialityDto: CreateSpecialityDto) {
    const randomNumber = Math.floor(Math.random() * 31);
    const randomColor = colorCombination[randomNumber];

    const result = await this.specialityRepository.save({
      ...createSpecialityDto,
      text_color: randomColor.color,
      background_color: randomColor.backGround,
    });
    return plainToInstance(Speciality, result);
  }

  async findOneWhere(options: FindOneOptions<Speciality>) {
    const result = await this.specialityRepository.findOne(options);
    return plainToInstance(Speciality, result);
  }

  async findAll(
    queryParamsDto: CertSpecFilterQueryDto,
  ): Promise<[Speciality[], number]> {
    const {
      search,
      limit,
      offset,
      order,
      certificate,
      speciality,
      name,
      abbreviation,
      status,
    } = queryParamsDto;

    const queryBuilder = this.specialityRepository
      .createQueryBuilder('sp')
      .select([
        'sp.id AS id',
        'sp.name AS name',
        'sp.abbreviation AS abbreviation',
        'sp.background_color AS background_color',
        'sp.text_color AS text_color',
        'sp.status AS status',
        `(SELECT JSON_AGG(JSON_BUILD_OBJECT('id', "certificate".id, 'name', "certificate".name, 'abbreviation', "certificate".abbreviation, 'background_color', "certificate".background_color, 'text_color', "certificate".text_color)) AS certificate
        FROM unnest(sp.certificates) AS "certificates"
        JOIN "certificate" ON "certificate".id = "certificates") AS certificates`,
        `(SELECT COUNT(*) FROM unnest(sp.certificates)) AS certificate_count`,
      ]);

    // Apply search filter
    if (search) {
      const searchKeyword = `%${parseSearchKeyword(search)}%`;
      queryBuilder.andWhere(
        '(sp.name ILIKE :search OR sp.abbreviation ILIKE :search)',
        { search: searchKeyword },
      );
    }

    // Apply certificate filter (array of certificate IDs)
    if (speciality && speciality.length > 0) {
      queryBuilder.andWhere('sp.id IN (:...speciality)', { speciality });
    }

    // Apply name filter
    if (name) {
      queryBuilder.andWhere('sp.name ILIKE :name', { name: `%${name}%` });
    }

    // Apply abbreviation filter
    if (abbreviation) {
      queryBuilder.andWhere('sp.abbreviation ILIKE :abbreviation', {
        abbreviation: `%${abbreviation}%`,
      });
    }

    // Apply status filter
    if (status) {
      queryBuilder.andWhere('sp.status IN (:...status)', { status });
    }

    // Apply speciality filter (array of speciality IDs - certificates that contain ANY of these specialities)
    if (certificate && certificate.length) {
      queryBuilder.andWhere('sp.certificates && :certificate', { certificate });
    }

    // Apply pagination
    queryBuilder.limit(+limit).offset(+offset);

    // Apply ordering
    Object.keys(order).forEach((key) => {
      if (key === 'certificate_count') {
        queryBuilder.addOrderBy(
          `(SELECT MIN("certificate".name) FROM unnest(sp.certificates) AS "certificates" JOIN "certificate" ON "certificate".id = "certificates")`,
          order[key].toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
        );
      } else {
        queryBuilder.addOrderBy(`${key}`, order[key]);
      }
    });

    const list = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();
    return [plainToInstance(Speciality, list), count];
  }

  async update(id: string, updateSpecialityDto: UpdateSpecialityDto) {
    const record = await this.specialityRepository.update(id, {
      ...updateSpecialityDto,
      updated_at: new Date().toISOString(),
    });
    return record;
  }

  async remove(id: string, deleteDto: DeleteDto) {
    const record = await this.specialityRepository.update(
      { id: id, deleted_at: IsNull() },
      {
        deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: new Date().toISOString(),
      },
    );
    return record;
  }

  async checkName(specialtyDto: CreateSpecialityDto | UpdateSpecialityDto) {
    const { name = undefined, abbreviation = undefined } = specialtyDto;

    const queryBuilder = this.specialityRepository.createQueryBuilder('s');

    if (name) {
      queryBuilder.orWhere('LOWER(s.name) = LOWER(:name)', { name });
    }

    if (abbreviation) {
      queryBuilder.orWhere('LOWER(s.abbreviation) = LOWER(:abbreviation)', {
        abbreviation,
      });
    }

    const data = await queryBuilder.getOne();

    return data;
  }

  async getSpecialityDetails(id: string) {
    const speciality = await this.specialityRepository
      .createQueryBuilder('s')
      .select([
        's.id AS id',
        's.name AS name',
        's.abbreviation AS abbreviation',
        's.status AS status',
        's.display AS display',
        's.workforce_portal_alias AS workforce_portal_alias',
        's.text_color AS text_color',
        's.background_color AS background_color',
        `(SELECT JSON_AGG(JSON_BUILD_OBJECT('id',"certificate".id, 'name', "certificate".name, 'abbreviation', "certificate".abbreviation, 'text_color', "certificate".text_color, 'background_color', "certificate".background_color)) AS certificate
          FROM unnest(s.certificates) AS "certificates"
          JOIN "certificate" ON "certificate".id = "certificates") AS certificates`,
      ])
      .where(`s.id = :id`, { id })
      .getRawOne();

    return speciality;
  }

  async isSpecialityUsed(id: string) {
    const provider = await this.providerRepository
      .createQueryBuilder('p')
      .where('p.speciality_id = :id', { id: id })
      .orWhere('p.additional_speciality @> :id2', {
        id2: [id],
      })
      .getCount();

    const shift = await this.shiftRepository.count({
      relations: {
        speciality: true,
      },
      where: {
        speciality: { id: id },
      },
    });

    const credentials = await this.credentialRepository
      .createQueryBuilder('c')
      .where('c.licenses @> :id', {
        id: [id],
      })
      .getCount();

    return !provider && !shift && !credentials ? false : true;
  }
}
