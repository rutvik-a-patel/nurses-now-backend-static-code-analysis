import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, IsNull, Repository } from 'typeorm';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { plainToInstance } from 'class-transformer';
import { Certificate } from './entities/certificate.entity';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { Provider } from '@/provider/entities/provider.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { colorCombination } from '@/shared/constants/constant';
import { CertSpecFilterQueryDto } from './dto/certificate-filter.dto';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { Credential } from '@/credentials/entities/credential.entity';

@Injectable()
export class CertificateService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(Shift)
    private shiftRepository: Repository<Shift>,
    @InjectRepository(Credential)
    private credentialRepository: Repository<Credential>,
  ) {}
  async create(createCertificateDto: CreateCertificateDto) {
    const randomNumber = Math.floor(Math.random() * 31);
    const randomColor = colorCombination[randomNumber];

    const result = await this.certificateRepository.save({
      ...createCertificateDto,
      text_color: randomColor.color,
      background_color: randomColor.backGround,
    });
    return plainToInstance(Certificate, result);
  }

  async findOneWhere(options: FindOneOptions<Certificate>) {
    const result = await this.certificateRepository.findOne(options);
    return plainToInstance(Certificate, result);
  }

  async findAll(
    queryParamsDto: CertSpecFilterQueryDto,
  ): Promise<[Certificate[], number]> {
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

    const queryBuilder = this.certificateRepository
      .createQueryBuilder('c')
      .select([
        'c.id AS id',
        'c.name AS name',
        'c.abbreviation AS abbreviation',
        'c.background_color AS background_color',
        'c.text_color AS text_color',
        'c.status AS status',
        `(SELECT JSON_AGG(JSON_BUILD_OBJECT('id', "speciality".id, 'name', "speciality".name, 'abbreviation', "speciality".abbreviation, 'background_color', "speciality".background_color, 'text_color', "speciality".text_color)) AS speciality
          FROM unnest(c.specialities) AS "specialities"
          JOIN "speciality" ON "speciality".id = "specialities") AS specialities`,
        `(SELECT COUNT(*) FROM unnest(c.specialities)) AS speciality_count`,
      ]);

    // Apply search filter
    if (search) {
      const searchKeyword = `%${parseSearchKeyword(search)}%`;
      queryBuilder.andWhere(
        '(c.name ILIKE :search OR c.abbreviation ILIKE :search)',
        { search: searchKeyword },
      );
    }

    // Apply certificate filter (array of certificate IDs)
    if (certificate && certificate.length > 0) {
      queryBuilder.andWhere('c.id IN (:...certificate)', { certificate });
    }

    // Apply name filter
    if (name) {
      queryBuilder.andWhere('c.name ILIKE :name', { name: `%${name}%` });
    }

    // Apply abbreviation filter
    if (abbreviation) {
      queryBuilder.andWhere('c.abbreviation ILIKE :abbreviation', {
        abbreviation: `%${abbreviation}%`,
      });
    }

    // Apply status filter
    if (status) {
      queryBuilder.andWhere('c.status IN (:...status)', { status });
    }

    // Apply speciality filter (array of speciality IDs - certificates that contain ANY of these specialities)
    if (speciality && speciality.length) {
      queryBuilder.andWhere('c.specialities && :speciality', { speciality });
    }

    // Apply pagination
    queryBuilder.limit(+limit).offset(+offset);

    // Apply ordering
    Object.keys(order).forEach((key) => {
      if (key === 'speciality_count') {
        queryBuilder.addOrderBy(
          `(SELECT "speciality".name FROM unnest(c.specialities) AS "specialities" JOIN "speciality" ON "speciality".id = "specialities" LIMIT 1)`,
          order[key].toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
        );
      } else {
        queryBuilder.addOrderBy(`${key}`, order[key]);
      }
    });

    const list = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();
    return [plainToInstance(Certificate, list), count];
  }

  async update(id: string, updateCertificateDto: UpdateCertificateDto) {
    const record = await this.certificateRepository.update(id, {
      ...updateCertificateDto,
      updated_at: new Date().toISOString(),
    });
    return record;
  }

  async remove(id: string, deleteDto: DeleteDto) {
    const record = await this.certificateRepository.update(
      { id: id, deleted_at: IsNull() },
      {
        deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: new Date().toISOString(),
      },
    );
    return record;
  }

  async checkName(certificateDto: CreateCertificateDto | UpdateCertificateDto) {
    const { name = undefined, abbreviation = undefined } = certificateDto;

    const queryBuilder = this.certificateRepository.createQueryBuilder('c');

    if (name) {
      queryBuilder.orWhere('LOWER(c.name) = LOWER(:name)', { name });
    }

    if (abbreviation) {
      queryBuilder.orWhere('LOWER(c.abbreviation) = LOWER(:abbreviation)', {
        abbreviation,
      });
    }

    const data = await queryBuilder.getOne();

    return data;
  }

  async getCertificateDetails(id: string) {
    const certificate = await this.certificateRepository
      .createQueryBuilder('c')
      .select([
        'c.id AS id',
        'c.name AS name',
        'c.abbreviation AS abbreviation',
        'c.status AS status',
        'c.display AS display',
        'c.workforce_portal_alias AS workforce_portal_alias',
        'c.text_color AS text_color',
        'c.background_color AS background_color',
        `(SELECT JSON_AGG(JSON_BUILD_OBJECT('id',"speciality".id, 'name', "speciality".name, 'abbreviation', "speciality".abbreviation, 'text_color', "speciality".text_color, 'background_color', "speciality".background_color)) AS speciality
          FROM unnest(c.specialities) AS "specialities"
          JOIN "speciality" ON "speciality".id = "specialities") AS specialities`,
      ])
      .where(`c.id = :id`, { id })
      .getRawOne();

    return certificate;
  }

  async isCertificateUsed(id: string) {
    const provider = await this.providerRepository
      .createQueryBuilder('p')
      .where('p.certificate_id = :id', { id: id })
      .orWhere('p.additional_certification @> :id2', {
        id2: [id],
      })
      .getCount();

    const credentials = await this.credentialRepository
      .createQueryBuilder('c')
      .where('c.licenses @> :id', {
        id: [id],
      })
      .getCount();

    const shift = await this.shiftRepository.count({
      relations: {
        certificate: true,
      },
      where: {
        certificate: { id: id },
      },
    });

    return !provider && !credentials && !shift ? false : true;
  }
}
