import { Injectable } from '@nestjs/common';
import { DepartmentDto } from './dto/create-department.dto';
import { Department } from './entities/department.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { DeleteDto } from '@/shared/dto/delete.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async create(createDepartmentDto: DepartmentDto[]) {
    const result = await this.departmentRepository.save(createDepartmentDto);
    return plainToInstance(Department, result);
  }

  async remove(where: FindOptionsWhere<Department>, deleteDto: DeleteDto) {
    const record = await this.departmentRepository.update(
      { ...where, deleted_at: IsNull() },
      {
        deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: new Date().toISOString(),
      },
    );
    return record;
  }

  async findAll(id: string) {
    const queryBuilder = this.departmentRepository
      .createQueryBuilder('d')
      .leftJoin('admin', 'a', 'a.id = ANY(d.members)')
      .select([
        'd.id AS id',
        'd.name AS team_name',
        'd.base_url AS base_url',
        'd.image AS image',
        'd.status AS status',
        'd.created_at AS created_at',
        'd.updated_at AS updated_at',
        `json_agg(
          json_build_object(
            'id', a.id,
            'first_name', a.first_name,
            'last_name', a.last_name,
            'base_url', a.base_url,
            'image', a.image,
            'user_type', 'admin'
          )
        ) FILTER (WHERE a.id IS NOT NULL AND a.id != :user_id) AS members`,
      ])
      .where(':user_id = ANY(d.members)', { user_id: id })
      .groupBy('d.id');

    return await queryBuilder.getRawMany();
  }
}
