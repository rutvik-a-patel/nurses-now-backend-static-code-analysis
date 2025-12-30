import { Injectable } from '@nestjs/common';
import { FindManyOptions, Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}
  async findAll(
    where: FindManyOptions<Permission>,
  ): Promise<[Permission[], number]> {
    const [list, count] = await this.permissionRepository.findAndCount(where);
    return [plainToInstance(Permission, list), count];
  }
}
