import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { FindOptionsWhere, IsNull, Not, Repository } from 'typeorm';
import { CONSTANT } from '@/shared/constants/message';
import { AUTH_TABLE } from '@/shared/constants/types';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}
  async getFirebaseToken(where, table: AUTH_TABLE) {
    const list = await this.tokenRepository
      .createQueryBuilder('t')
      .select('DISTINCT(t.firebase)', 'firebase')
      .where({
        ...where,
        firebase: Not(IsNull()),
        deleted_at: IsNull(),
      })
      .andWhere(`${table}_id IS NOT NULL`)
      .getRawMany();

    return list;
  }

  async deleteTokenWhere(
    where: FindOptionsWhere<Token>,
    ip: string,
    reason?: string,
  ) {
    const time = new Date().toISOString();
    const result = await this.tokenRepository.update(
      {
        ...where,
        deleted_at: IsNull(),
      },
      {
        jwt: reason
          ? CONSTANT.SUCCESS.LOGOUT + ` (${reason})`
          : CONSTANT.SUCCESS.LOGOUT,
        logout_at: time,
        deleted_at_ip: ip,
        deleted_at: time,
      },
    );
    return result;
  }
}
