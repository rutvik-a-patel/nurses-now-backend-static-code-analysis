import { Injectable } from '@nestjs/common';
import { FindManyOptions, Repository } from 'typeorm';
import { RoleSectionPermission } from './entities/role-section-permission.entity';
import { plainToInstance } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { Section } from '@/section/entities/section.entity';

@Injectable()
export class RoleSectionPermissionService {
  constructor(
    @InjectRepository(RoleSectionPermission)
    private readonly roleSectionPermissionRepository: Repository<RoleSectionPermission>,
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
  ) {}

  async findAll(
    where: FindManyOptions<RoleSectionPermission>,
  ): Promise<[RoleSectionPermission[], number]> {
    const [list, count] =
      await this.roleSectionPermissionRepository.findAndCount(where);
    return [plainToInstance(RoleSectionPermission, list), count];
  }

  async getSectionAndPermissionByRoleId(id: string, section_id: string) {
    const result = await this.roleSectionPermissionRepository
      .createQueryBuilder('rsp')
      .select([
        'ss.id AS id',
        'ss.name AS sub_section',
        'JSON_AGG(p.name) AS permission',
      ])
      .innerJoin(
        'section',
        's',
        "s.id = rsp.section_id AND s.status = 'active'",
      )
      .innerJoin(
        'sub_section',
        'ss',
        "ss.id = rsp.sub_section_id AND s.status = 'active'",
      )
      .innerJoin(
        'permission',
        'p',
        "p.id = rsp.permission_id AND p.status = 'active'",
      )
      .where('rsp.role_id = :id', { id: id })
      .andWhere('rsp.section_id = :section_id', {
        section_id: section_id,
      })
      .groupBy('ss.id, ss.name')
      .getRawMany();
    return result;
  }

  async getSectionPermissions(id: string) {
    const result = await this.sectionRepository
      .createQueryBuilder('s')
      .select([
        's.id AS id',
        's.name AS section',
        `(SELECT JSON_AGG(JSON_BUILD_OBJECT('id', ss.id, 'sub_section', ss.name, 'permission', (
            SELECT JSON_AGG(
                    p.name
            )
              FROM role_section_permission rsp
            INNER JOIN permission p ON p.id = rsp.permission_id AND rsp.has_access = true AND rsp.role_id = '${id}'
          WHERE ss.id = rsp.sub_section_id AND rsp.deleted_at IS NULL
          ))) AS JSON_AGG 
          FROM sub_section ss where ss.section_id = s.id) AS permissions`,
      ])
      .getRawMany();

    return result;
  }

  async getPermissions(section_id: string) {
    const result = await this.roleSectionPermissionRepository
      .createQueryBuilder('rsp')
      .select([
        'ss.id AS id',
        'ss.name AS sub_section',
        `(SELECT JSONB_AGG(jsonb_build_object('id', permission.id, 'name', permission.name)) AS JSONB_AGG FROM permission 
            LEFT JOIN role_section_permission rsp ON rsp.permission_id = permission.id 
              WHERE "rsp"."sub_section_id" = "ss"."id" AND "rsp"."section_id" = '${section_id}' AND "rsp"."is_default" = true) AS permission`,
      ])
      .innerJoin(
        'section',
        's',
        "s.id = rsp.section_id AND s.status = 'active'",
      )
      .innerJoin(
        'sub_section',
        'ss',
        "ss.id = rsp.sub_section_id AND s.status = 'active'",
      )
      .innerJoin(
        'permission',
        'p',
        "p.id = rsp.permission_id AND p.status = 'active'",
      )
      .where('rsp.section_id = :section_id AND rsp.is_default = true', {
        section_id: section_id,
      })
      .groupBy('ss.id, ss.name')
      .getRawMany();

    return result;
  }

  async getSingleRole(id: string) {
    const result = await this.sectionRepository
      .createQueryBuilder('s')
      .select([
        's.id AS id',
        's.name AS section',
        `(SELECT JSON_AGG(JSON_BUILD_OBJECT('id', ss.id, 'sub_section', ss.name, 'permission', (
            SELECT JSON_AGG(
                    JSON_BUILD_OBJECT('id', p.id, 'name', p.name, 'has_access', rsp.has_access)
            )
              FROM role_section_permission rsp
            INNER JOIN permission p ON p.id = rsp.permission_id AND rsp.role_id = '${id}'
          WHERE ss.id = rsp.sub_section_id AND rsp.deleted_at IS NULL
          ))) AS JSON_AGG 
          FROM sub_section ss where ss.section_id = s.id) AS permissions`,
      ])
      .getRawMany();

    return result;
  }
}
