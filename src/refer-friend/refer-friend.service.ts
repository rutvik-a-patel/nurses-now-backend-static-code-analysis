import { Injectable } from '@nestjs/common';
import { CreateReferFriendDto } from './dto/create-refer-friend.dto';
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { ReferFriend } from './entities/refer-friend.entity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { DeleteDto } from '@/shared/dto/delete.dto';
import sendEmailHelper from '@/shared/helpers/send-email-helper';
import { EJS_FILES } from '@/shared/constants/enum';
import { CONSTANT } from '@/shared/constants/message';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { ReferralQueryDto } from './dto/refer-friend.dto';

@Injectable()
export class ReferFriendService {
  constructor(
    @InjectRepository(ReferFriend)
    private readonly referFriendRepository: Repository<ReferFriend>,

    private readonly encryptDecryptService: EncryptDecryptService,
  ) {}

  async checkName(email: string, mobile_no: string) {
    const queryBuilder = this.referFriendRepository
      .createQueryBuilder('a')
      .where('LOWER(a.email) = LOWER(:email) OR a.mobile_no = :mobile_no', {
        email,
        mobile_no: mobile_no,
      });

    const data = await queryBuilder.getOne();

    return data;
  }

  async create(createReferFriendDto: CreateReferFriendDto) {
    const result = await this.referFriendRepository.save(
      plainToInstance(ReferFriend, createReferFriendDto),
    );
    return plainToInstance(ReferFriend, result);
  }

  async findAll(options?: FindManyOptions<ReferFriend>) {
    const findAll = await this.referFriendRepository.find(options);
    return plainToInstance(ReferFriend, findAll);
  }

  async findAllWithProviderData(referredById: string) {
    const results = await this.referFriendRepository
      .createQueryBuilder('rf')
      .leftJoin(
        'provider',
        'p',
        'p.email = rf.email OR p.mobile_no = rf.mobile_no',
      )
      .where('rf.referred_by = :referredById', { referredById })
      .select([
        'rf.id AS id',
        'rf.created_at AS created_at',
        'rf.updated_at AS updated_at',
        'rf.full_name AS full_name',
        'rf.email AS email',
        'rf.country_code AS country_code',
        'rf.mobile_no AS mobile_no',
        'rf.status AS status',
        'p.base_url AS base_url',
        'p.profile_image AS profile_image',
      ])
      .getRawMany();

    return plainToInstance(ReferFriend, results);
  }

  async allReferralsWithCertificates(
    provider_id: string,
    query: ReferralQueryDto,
  ): Promise<[ReferFriend[], number]> {
    const qb = this.referFriendRepository
      .createQueryBuilder('rf')
      .leftJoin(
        'provider',
        'p',
        'p.email = rf.email OR p.mobile_no = rf.mobile_no',
      )
      .leftJoin('certificate', 'c', 'c.id = p.certificate_id')
      .where('rf.referred_by = :provider_id', { provider_id })
      .select([
        'rf.id AS id',
        'rf.created_at AS created_at',
        'rf.updated_at AS updated_at',
        'rf.full_name AS full_name',
        'rf.email AS email',
        'rf.country_code AS country_code',
        'rf.mobile_no AS mobile_no',
        'rf.status AS status',
        'p.base_url AS base_url',
        'p.profile_image AS profile_image',
        `TO_CHAR(p.created_at, 'YYYY-MM-DD') AS joined_date`,
        `JSON_BUILD_OBJECT(
          'name', c.name,
          'abbreviation', c.abbreviation,
          'status', c.status,
          'text_color', c.text_color,
          'background_color', c.background_color
        ) AS certificate`,
      ]);

    if (query.search) {
      qb.where('rf.full_name ILIKE :search OR rf.email ILIKE :search', {
        search: `%${query.search || ''}%`,
      });
    }

    if (query.order) {
      Object.keys(query.order).forEach((key) => {
        const orderKey =
          key === 'joined_date'
            ? 'p.created_at'
            : key === 'abbreviation'
              ? `c.${key}`
              : `rf.${key}`;
        qb.addOrderBy(orderKey, query.order[key]);
      });
    }

    if (+query.limit > 0) {
      qb.limit(+query.limit);
    }
    if (+query.offset >= 0) {
      qb.offset(+query.offset);
    }

    const results = await qb.getRawMany();
    const count = await qb.getCount();

    return [plainToInstance(ReferFriend, results), count];
  }

  async findAndCount(options?: FindManyOptions<ReferFriend>) {
    const [list, count] =
      await this.referFriendRepository.findAndCount(options);
    return [plainToInstance(ReferFriend, list), count];
  }

  async findOne(where: FindOptionsWhere<ReferFriend>) {
    const data = await this.referFriendRepository.findOne({ where });
    return plainToInstance(ReferFriend, data);
  }

  async update(
    criteria: FindOptionsWhere<ReferFriend>,
    partialEntity: QueryDeepPartialEntity<ReferFriend>,
  ) {
    const update = await this.referFriendRepository.update(
      criteria,
      partialEntity,
    );
    return update;
  }

  // create the delete method
  async remove(option: FindOptionsWhere<ReferFriend>, deleteDto: DeleteDto) {
    const result = await this.referFriendRepository.update(option, {
      ...deleteDto,
      deleted_at: new Date().toISOString(),
    });
    return result;
  }

  async sendReferralInvitationEmail(
    data: ReferFriend,
    referred_by_name: string,
  ) {
    // Send email to the provider
    await sendEmailHelper({
      email: data.email,
      name: referred_by_name,
      redirectUrl: `${process.env.EMAIL_VERIFICATION_URL}referral?referred_by=${this.encryptDecryptService.encrypt(data.referred_by as unknown as string)}`,
      email_type: EJS_FILES.referral_invite,
      subject: CONSTANT.EMAIL.REFERRAL_INVITE_SUBJECT(referred_by_name),
    });
  }
}
