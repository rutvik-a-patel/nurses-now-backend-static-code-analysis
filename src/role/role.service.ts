import { Injectable } from '@nestjs/common';
import {
  FindOneOptions,
  FindOptionsWhere,
  In,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { Role } from './entities/role.entity';
import { plainToClass, plainToInstance } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { RoleSectionPermission } from '@/role-section-permission/entities/role-section-permission.entity';
import { DeleteDto } from '@/shared/dto/delete.dto';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleSectionPermissionService } from '@/role-section-permission/role-section-permission.service';
import { SectionService } from '@/section/section.service';
import { Admin } from '@/admin/entities/admin.entity';
import { MultiSelectQueryParamsDto } from '@/shared/dto/query-params.dto';
import { Activity } from '@/activity/entities/activity.entity';
import { ACTION_TABLES, ACTIVITY_TYPE, TABLE } from '@/shared/constants/enum';
import { IRequest } from '@/shared/constants/types';
import { getUpdatedFields } from '@/shared/helpers/get-updated-fields';
import { RoleIncludedKeys } from '@/shared/constants/constant';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(RoleSectionPermission)
    private readonly roleSectionPermissionRepository: Repository<RoleSectionPermission>,
    private readonly roleSectionPermissionService: RoleSectionPermissionService,
    private readonly sectionService: SectionService,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const result = await this.roleRepository.save(createRoleDto);
    return plainToInstance(Role, result);
  }

  async findOneWhere(options: FindOneOptions<Role>) {
    const result = await this.roleRepository.findOne(options);
    return plainToInstance(Role, result);
  }

  async saveRoleSectionPermission(
    roleSectionPermission: RoleSectionPermission[],
  ) {
    const result = await this.roleSectionPermissionRepository.save(
      roleSectionPermission,
    );
    return plainToInstance(RoleSectionPermission, result);
  }

  async updateRolePermissions(
    where: FindOptionsWhere<RoleSectionPermission>,
    data: { has_access: boolean },
  ) {
    const record = await this.roleSectionPermissionRepository.update(where, {
      ...data,
      updated_at: new Date().toISOString(),
    });
    return record;
  }

  async getAllRoles(
    queryParamsDto: MultiSelectQueryParamsDto,
  ): Promise<[Role[], number]> {
    const { search, order, limit, offset, status } = queryParamsDto;
    const queryBuilder = this.roleRepository
      .createQueryBuilder('r')
      .select([
        'r.id AS id',
        'r.name AS name',
        'r.description AS description',
        'r.created_at AS created_at',
        'r.status AS status',
        `COALESCE((SELECT COUNT(id)::INTEGER FROM admin WHERE admin.role_id = r.id AND admin.deleted_at IS NULL GROUP BY admin.role_id), 0) AS user_count`,
      ]);

    if (search) {
      queryBuilder.where(`name ILIKE :search`, {
        search: `%${parseSearchKeyword(search)}%`,
      });
    }
    if (status && status.length) {
      queryBuilder.andWhere('r.status IN (:...status)', {
        status,
      });
    }

    Object.keys(order).forEach((key) => {
      queryBuilder.addOrderBy(`${key}`, order[key]);
    });
    const list = await queryBuilder.limit(+limit).offset(+offset).getRawMany();
    const count = await queryBuilder.getCount();

    return [list, count];
  }

  async remove(id: string, deleteDto: DeleteDto) {
    const record = await this.roleRepository.update(
      { id: id, deleted_at: IsNull() },
      {
        deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: new Date().toISOString(),
      },
    );
    return record;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const record = await this.roleRepository.update(id, {
      ...updateRoleDto,
      updated_at: new Date().toISOString(),
    });
    return record;
  }

  async prepareSectionData(roleId: string, sectionIds: string[] = []) {
    const allSections = await this.sectionService.findAll({
      where: { id: Not(In(sectionIds)) },
    });

    if (!allSections.length) {
      return [];
    }

    const roleSectionPermissionArr = [];
    for (const section of allSections) {
      const subSectionPermission =
        await this.roleSectionPermissionService.getPermissions(section.id);

      for (const { id, permission } of subSectionPermission) {
        for (const data of permission) {
          roleSectionPermissionArr.push({
            role: roleId,
            section: section.id,
            sub_section: id,
            permission: data.id,
            has_access: false,
          });
        }
      }
    }

    return roleSectionPermissionArr;
  }

  async duplicateRole(id: string): Promise<Role> {
    const role = await this.findOneWhere({
      where: { id: id },
      select: { id: true, name: true, description: true, status: true },
    });

    delete role.id;
    const newRole = await this.create(role);

    let roleSectionPermissions =
      await this.roleSectionPermissionRepository.find({
        relations: {
          section: true,
          sub_section: true,
          permission: true,
        },
        where: { role: { id: id } },
        select: {
          id: true,
          status: true,
          has_access: true,
        },
      });

    roleSectionPermissions = roleSectionPermissions.map(
      (roleSectionPermission) => {
        return plainToClass(RoleSectionPermission, {
          role: newRole.id,
          section: roleSectionPermission.section.id,
          sub_section: roleSectionPermission.sub_section.id,
          permission: roleSectionPermission.permission.id,
          has_access: roleSectionPermission.has_access,
          status: roleSectionPermission.status,
        });
      },
    );

    await this.saveRoleSectionPermission(roleSectionPermissions);
    return newRole;
  }

  async isRoleInUse(id: string): Promise<boolean> {
    const count = await this.adminRepository.count({
      where: {
        role: { id },
      },
      relations: ['role'],
    });
    return count > 0;
  }

  // Tracking the activity
  async roleActivityLog(
    req: IRequest,
    entity_id: string,
    activity_type: ACTIVITY_TYPE,
    message: Record<string, any>,
  ) {
    const action_by_type: TABLE = req.user.role;
    const action_by_id: string = req.user.id;

    const activity = this.activityRepository.create({
      action_by_type,
      entity_id,
      [action_by_type]: action_by_id,
      activity_type,
      message,
      action_for: ACTION_TABLES.ROLE,
    });
    await this.activityRepository.save(activity);
  }

  // role update activity
  async roleActivityUpdateLog(
    req: IRequest,
    entity_id: string,
    oldData: Record<string, any>,
    newData: Record<string, any>,
  ) {
    const changes = getUpdatedFields(
      oldData,
      newData,
      RoleIncludedKeys, // include keys to track
      true,
    ) as string[];

    const changesList = changes as string[] | undefined;
    if (!changesList || changesList.length === 0) return;

    const statusChanged =
      oldData?.status != null &&
      newData?.status != null &&
      oldData.status !== newData.status;

    let activity_type = ACTIVITY_TYPE.ROLE_UPDATED;
    if (statusChanged) {
      if (newData.status === 'in_active') {
        activity_type = ACTIVITY_TYPE.ROLE_DEACTIVATED;
      } else if (newData.status === 'active') {
        activity_type = ACTIVITY_TYPE.ROLE_REACTIVATED;
      }
    }

    await this.roleActivityLog(req, entity_id, activity_type, {
      changes: changesList,
    });
  }
}
