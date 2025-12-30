import { Injectable } from '@nestjs/common';
import { CreateFacilityUserDto } from './dto/create-facility-user.dto';
import { plainToInstance } from 'class-transformer';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  In,
  IsNull,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FacilityUser } from './entities/facility-user.entity';
import { UpdateFacilityUserDto } from './dto/update-facility-user.dto';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { FacilityUserPermission } from './entities/facility-user-permission.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ContactFilterDto } from './dto/contact-filter.dto';
import { FacilityPermission } from './entities/facility-permission.entity';
import { Admin } from '@/admin/entities/admin.entity';
import { ENTITY_STATUS } from '@/shared/constants/enum';

@Injectable()
export class FacilityUserService {
  constructor(
    @InjectRepository(FacilityUser)
    private readonly facilityUserRepository: Repository<FacilityUser>,
    @InjectRepository(FacilityUserPermission)
    private readonly facilityUserPermissionRepository: Repository<FacilityUserPermission>,
    @InjectRepository(FacilityPermission)
    private readonly facilityPermissionRepository: Repository<FacilityPermission>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}
  async create(createFacilityUserDto: CreateFacilityUserDto) {
    const result = await this.facilityUserRepository.save(
      createFacilityUserDto,
    );
    return plainToInstance(FacilityUser, result);
  }

  async findOneWhere(options: FindOneOptions<FacilityUser>) {
    const result = await this.facilityUserRepository.findOne(options);
    return plainToInstance(FacilityUser, result);
  }

  async findAllWhere(options: FindManyOptions<FacilityUser>) {
    const result = await this.facilityUserRepository.find(options);
    return plainToInstance(FacilityUser, result);
  }

  async update(
    id: string,
    updateFacilityUserDto: UpdateFacilityUserDto | UpdateProfileDto,
  ) {
    const record = await this.facilityUserRepository.update(id, {
      ...updateFacilityUserDto,
      updated_at: new Date().toISOString(),
    });
    return record;
  }

  async updateWhere(
    where: FindOptionsWhere<FacilityUser>,
    updateFacilityUserDto: UpdateFacilityUserDto,
  ) {
    const record = await this.facilityUserRepository.update(
      where,
      updateFacilityUserDto,
    );
    return record;
  }

  async getAllFacilityContacts(
    id: string,
    queryParamsDto: ContactFilterDto,
    user: any,
  ): Promise<[FacilityUser[], number]> {
    const repo =
      user.role === 'admin'
        ? this.adminRepository
        : this.facilityUserRepository;

    const newUser = await repo.findOne({
      where: { id: user.id },
    });

    const queryBuilder = this.facilityUserRepository
      .createQueryBuilder('fu')
      .select([
        'fu.id AS id',
        'fu.title AS title',
        'fu.first_name AS first_name',
        'fu.last_name AS last_name',
        'fu.email AS email',
        'fu.base_url AS base_url',
        'fu.image AS image',
        'fu.facility_id AS facility_id',
        'fu.status AS status',
        'fu.created_at AS created_at',
        'fu.updated_at AS updated_at',
        'CARDINALITY(fu.facility_id) AS facility_count',
      ])
      .innerJoin(
        'facility_user_permission',
        'fup',
        'fup.facility_user_id = fu.id',
      )
      .innerJoin(
        'facility_permission',
        'fp',
        `fp.id = fup.facility_permission_id`,
      )
      .limit(+queryParamsDto.limit)
      .offset(+queryParamsDto.offset);

    queryBuilder
      .where('fu.facility_id @> :id', {
        id: [id],
      })
      .andWhere(
        `fu.id NOT IN (SELECT facility_user_id 
          FROM facility_user_permission fup
            LEFT JOIN facility_permission fp ON fp.id = fup.facility_permission_id
          WHERE fp.name IN ('can_manage_billing', 'can_see_billing_summary') AND fup.deleted_at IS NULL)`,
      )
      .andWhere(`fu.id != '${user.id}'`);

    if (queryParamsDto.search) {
      queryBuilder.andWhere(
        `(fu.first_name ILIKE :search OR fu.last_name ILIKE :search OR fu.first_name || ' ' || fu.last_name ILIKE :search OR fu.email ILIKE :search OR fu.title ILIKE :search)`,
        {
          search: `%${parseSearchKeyword(queryParamsDto.search)}%`,
        },
      );
    }

    if (queryParamsDto.status && queryParamsDto.status.length) {
      queryBuilder.andWhere('fu.status IN (:...status)', {
        status: queryParamsDto.status,
      });
    }
    if (queryParamsDto.start_date) {
      queryBuilder.andWhere(
        `TO_CHAR(fu.created_at, 'YYYY-MM-DD') >= :start_date`,
        {
          start_date: queryParamsDto.start_date,
        },
      );
    }

    if (queryParamsDto.end_date) {
      queryBuilder.andWhere(
        `TO_CHAR(fu.created_at, 'YYYY-MM-DD') <= :end_date`,
        {
          end_date: queryParamsDto.end_date,
        },
      );
    }

    if (newUser?.hide_inactive_contacts) {
      queryBuilder.andWhere('fu.status IN (:...status)', {
        status: [ENTITY_STATUS.active, ENTITY_STATUS.invited],
      });
    }

    queryBuilder.groupBy('fu.id');

    Object.entries(queryParamsDto.order).forEach(([column, direction]) => {
      if (column === 'facility_count') {
        queryBuilder.addOrderBy(`facility_count`, direction);
      } else {
        queryBuilder.addOrderBy(`fu.${column}::CHARACTER VARYING`, direction);
      }
    });

    const list = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();

    return [list, count];
  }

  async getAllBillingContacts(
    id: string,
    queryParamsDto: ContactFilterDto,
    user: any,
  ): Promise<[FacilityUser[], number]> {
    const repo =
      user.role === 'admin'
        ? this.adminRepository
        : this.facilityUserRepository;

    const newUser = await repo.findOne({
      where: { id: user.id },
    });

    const queryBuilder = this.facilityUserRepository
      .createQueryBuilder('fu')
      .select([
        'fu.id AS id',
        'fu.title AS title',
        'fu.first_name AS first_name',
        'fu.last_name AS last_name',
        'fu.email AS email',
        'fu.base_url AS base_url',
        'fu.image AS image',
        'fu.facility_id AS facility_id',
        'fu.status AS status',
        'fu.created_at AS created_at',
        'fu.updated_at AS updated_at',
        'CARDINALITY(fu.facility_id) AS facility_count',
      ])
      .innerJoin(
        'facility_user_permission',
        'fup',
        'fup.facility_user_id = fu.id',
      )
      .innerJoin(
        'facility_permission',
        'fp',
        `fp.id = fup.facility_permission_id AND fp.name IN ('can_manage_billing', 'can_see_billing_summary')`,
      )
      .limit(+queryParamsDto.limit)
      .offset(+queryParamsDto.offset);

    queryBuilder
      .where('fu.facility_id @> :id', {
        id: [id],
      })
      .andWhere(`fu.id != '${user.id}'`);

    if (queryParamsDto.search) {
      queryBuilder.andWhere(
        `(fu.first_name ILIKE :search OR fu.last_name ILIKE :search OR fu.first_name || ' ' || fu.last_name ILIKE :search OR fu.email ILIKE :search OR fu.title ILIKE :search)`,
        {
          search: `%${parseSearchKeyword(queryParamsDto.search)}%`,
        },
      );
    }
    if (queryParamsDto.status && queryParamsDto.status.length) {
      queryBuilder.andWhere('fu.status IN (:...status)', {
        status: queryParamsDto.status,
      });
    }

    if (queryParamsDto.start_date) {
      queryBuilder.andWhere(
        `TO_CHAR(fu.created_at, 'YYYY-MM-DD') >= :start_date`,
        {
          start_date: queryParamsDto.start_date,
        },
      );
    }

    if (queryParamsDto.end_date) {
      queryBuilder.andWhere(
        `TO_CHAR(fu.created_at, 'YYYY-MM-DD') <= :end_date`,
        {
          end_date: queryParamsDto.end_date,
        },
      );
    }

    if (newUser?.hide_inactive_contacts) {
      queryBuilder.andWhere('fu.status IN (:...status)', {
        status: [ENTITY_STATUS.active, ENTITY_STATUS.invited],
      });
    }

    queryBuilder.groupBy('fu.id');

    Object.entries(queryParamsDto.order).forEach(([column, direction]) => {
      if (column === 'facility_count') {
        queryBuilder.addOrderBy(`facility_count`, direction);
      } else {
        queryBuilder.addOrderBy(`fu.${column}::CHARACTER VARYING`, direction);
      }
    });

    const list = await queryBuilder.getRawMany();
    const count = await queryBuilder.getCount();

    return [list, count];
  }

  async getContactProfile(id: string) {
    const data = await this.facilityUserRepository
      .createQueryBuilder('fu')
      .select([
        'id',
        'first_name',
        'last_name',
        'title',
        'email',
        'country_code',
        'mobile_no',
        'base_url',
        'image',
        'status',
        'created_at',
        `(SELECT JSON_AGG(jsonb_build_object('id', fup.id, 'permission_id', fp.id, 'name', fp.name)) AS JSONB_AGG
          FROM facility_user_permission fup 
            LEFT JOIN facility_permission fp 
              ON fp.id = fup.facility_permission_id 
          WHERE fup.facility_user_id = fu.id 
            AND fup.has_access = true AND fup.deleted_at Is Null) AS permission`,
        `(SELECT JSON_AGG(jsonb_build_object('id', "facility".id, 'name', "facility".name)) AS facility
          FROM unnest(fu.facility_id) AS "facility_id"
            JOIN "facility" ON "facility".id = "facility_id") AS facility`,
      ])
      .where(`id = :id`, {
        id: id,
      })
      .getRawOne();

    return data;
  }

  async removePermissions(id: string, permissions: string[]) {
    const record = await this.facilityUserPermissionRepository.update(
      {
        facility_user: { id: id },
        facility_permission: { id: In(permissions) },
        deleted_at: IsNull(),
      },
      {
        // deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: new Date().toISOString(),
      },
    );
    return record;
  }

  async addPermissions(user: FacilityUser, permissions: string[]) {
    const existingPermissions =
      await this.facilityUserPermissionRepository.find({
        where: {
          facility_user: { id: user.id },
          facility_permission: { id: In(permissions) },
          deleted_at: IsNull(),
        },
        relations: {
          facility_permission: true,
        },
        select: {
          id: true,
          facility_permission: {
            id: true,
          },
        },
      });
    const permissionIds = existingPermissions.length
      ? existingPermissions.map(
          (permission) => permission.facility_permission.id,
        )
      : [];
    const newPermissions = permissions.length
      ? permissions.filter((permission) => !permissionIds.includes(permission))
      : [];

    const newPermissionsDto = newPermissions.length
      ? newPermissions.map((permissionId) => ({
          facility_user: user,
          facility_permission: { id: permissionId },
          has_access: true,
        }))
      : [];
    const records =
      await this.facilityUserPermissionRepository.save(newPermissionsDto);
    return records;
  }

  async getFacilityUserPermissions(id: string) {
    const data = await this.facilityUserPermissionRepository.find({
      relations: {
        facility_permission: true,
      },
      where: { facility_user: { id: id } },
      select: {
        id: true,
        has_access: true,
        facility_permission: {
          id: true,
          name: true,
        },
      },
    });

    return data;
  }

  async getFacilityPermissions(where: FindManyOptions<FacilityPermission>) {
    const permissions = await this.facilityPermissionRepository.find(where);
    return permissions;
  }

  async findOnePermissionWhere(options: FindOneOptions<FacilityPermission>) {
    const result = await this.facilityPermissionRepository.findOne(options);
    return plainToInstance(FacilityPermission, result);
  }

  async hideInactiveContacts(
    user: any,
    data: { hide_inactive_contacts?: boolean; hide_inactive_users?: boolean },
  ) {
    const repo =
      user.role === 'admin'
        ? this.adminRepository
        : this.facilityUserRepository;

    const updateData: any = {
      hide_inactive_contacts: data.hide_inactive_contacts,
    };

    if (user.role === 'admin') {
      Object.assign(updateData, {
        hide_inactive_users: data.hide_inactive_users,
      });
    }

    const record = await repo.update(user.id, updateData);
    return record;
  }

  async getContactSettings(user: any) {
    const repo =
      user.role === 'admin'
        ? this.adminRepository
        : this.facilityUserRepository;

    const result = await repo.findOne({
      where: { id: user.id },
    });

    return result;
  }
}
