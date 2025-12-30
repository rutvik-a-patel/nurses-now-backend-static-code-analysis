import { Injectable } from '@nestjs/common';
import { CreateLineOfBusinessDto } from './dto/create-line-of-business.dto';
import { UpdateLineOfBusinessDto } from './dto/update-line-of-business.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, IsNull, Repository } from 'typeorm';
import { LineOfBusiness } from './entities/line-of-business.entity';
import { plainToInstance } from 'class-transformer';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { Facility } from '@/facility/entities/facility.entity';

@Injectable()
export class LineOfBusinessService {
  constructor(
    @InjectRepository(LineOfBusiness)
    private readonly lineOfBusinessRepository: Repository<LineOfBusiness>,
    @InjectRepository(Facility)
    private readonly facilityRepository: Repository<Facility>,
  ) {}
  async create(createLineOfBusinessDto: CreateLineOfBusinessDto) {
    const result = await this.lineOfBusinessRepository.save(
      createLineOfBusinessDto,
    );
    return plainToInstance(LineOfBusiness, result);
  }

  async findOneWhere(options: FindOneOptions<LineOfBusiness>) {
    const result = await this.lineOfBusinessRepository.findOne(options);
    return plainToInstance(LineOfBusiness, result);
  }

  async findAll(
    options: FindManyOptions<LineOfBusiness>,
  ): Promise<[LineOfBusiness[], number]> {
    const [list, count] =
      await this.lineOfBusinessRepository.findAndCount(options);
    return [plainToInstance(LineOfBusiness, list), count];
  }

  async update(id: string, updateLineOfBusinessDto: UpdateLineOfBusinessDto) {
    const record = await this.lineOfBusinessRepository.update(id, {
      ...updateLineOfBusinessDto,
      updated_at: new Date().toISOString(),
    });
    return record;
  }

  async checkName(name: string, work_comp_code: string) {
    const data = await this.lineOfBusinessRepository
      .createQueryBuilder('lob')
      .where(
        'LOWER(lob.name) = LOWER(:name) OR LOWER(lob.work_comp_code) = LOWER(:work_comp_code)',
        { name, work_comp_code },
      )
      .getOne();

    return data;
  }

  async remove(id: string, deleteDto: DeleteDto) {
    const record = await this.lineOfBusinessRepository.update(
      { id: id, deleted_at: IsNull() },
      {
        deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: new Date().toISOString(),
      },
    );
    return record;
  }
  async isAlreadyUsed(id: string) {
    const record = await this.facilityRepository.countBy({
      facility_type: { id },
    });
    return record;
  }
}
