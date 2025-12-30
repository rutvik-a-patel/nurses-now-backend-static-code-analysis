import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import 'dotenv/config';
import { Provider } from '@/provider/entities/provider.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { Admin } from '@/admin/entities/admin.entity';
import { AUTH_COLUMN, AUTH_TABLE } from '@/shared/constants/types';
import { CONSTANT } from '@/shared/constants/message';
import { Facility } from '@/facility/entities/facility.entity';
import { DEFAULT_STATUS, TABLE } from '@/shared/constants/enum';
import { Token } from '@/token/entities/token.entity';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  private repositories: Record<string, Repository<any>>;
  constructor(
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
    @InjectRepository(FacilityUser)
    private facilityUserRepository: Repository<FacilityUser>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Facility)
    private facilityRepository: Repository<Facility>,
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_REFRESH_SECRET,
      passReqToCallback: true,
    });

    this.repositories = {
      provider: this.providerRepository,
      admin: this.adminRepository,
      facility_user: this.facilityUserRepository,
      facility: this.facilityRepository,
    };
  }

  async validate(
    req: Request,
    payload: {
      id: string;
      column: AUTH_COLUMN;
      table: AUTH_TABLE;
    },
  ) {
    try {
      const refreshToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      if (!refreshToken) {
        throw new UnauthorizedException(CONSTANT.ERROR.INVALID_REFRESH_TOKEN);
      }

      // Validate the refresh token from the database
      const storedToken = await this.tokenRepository.findOne({
        where: { refresh_jwt: refreshToken },
      });

      if (!storedToken) {
        throw new UnauthorizedException(CONSTANT.ERROR.INVALID_REFRESH_TOKEN);
      }

      const repository = this.repositories[payload.table];
      if (!repository) {
        throw new UnauthorizedException(CONSTANT.ERROR.INVALID_REFRESH_TOKEN);
      }

      const where = {
        id: payload.id,
      };

      const relations = {};

      if (
        payload.table === TABLE.admin ||
        payload.table === TABLE.facility_user // facility not include due to, it does not have enum of 'status'
      ) {
        Object.assign(where, { status: DEFAULT_STATUS.active });
      }

      const entity = await repository.findOne({
        where,
        relations,
      });

      if (!entity) {
        throw new UnauthorizedException(CONSTANT.ERROR.INVALID_REFRESH_TOKEN);
      }

      Object.assign(entity, { role: payload.table });
      delete entity.password;
      return entity;
    } catch (_error) {
      throw new UnauthorizedException(CONSTANT.ERROR.INVALID_REFRESH_TOKEN);
    }
  }
}
