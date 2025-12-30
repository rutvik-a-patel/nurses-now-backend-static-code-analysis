import { Injectable } from '@nestjs/common';
import { CreateTestFaqDto } from './dto/create-test-faq.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TestFaq } from './entities/test-faq.entity';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  IsNull,
  Repository,
} from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { DeleteDto } from '@/shared/dto/delete.dto';

@Injectable()
export class TestFaqsService {
  constructor(
    @InjectRepository(TestFaq)
    private readonly testFaqRepository: Repository<TestFaq>,
  ) {}
  async create(createTestFaqDto: CreateTestFaqDto[]) {
    const result = await this.testFaqRepository.save(createTestFaqDto);
    return plainToInstance(TestFaq, result);
  }

  async findAll(
    options: FindManyOptions<TestFaq>,
  ): Promise<[TestFaq[], number]> {
    const [list, count] = await this.testFaqRepository.findAndCount(options);
    return [plainToInstance(TestFaq, list), count];
  }

  async findOne(options: FindOneOptions<TestFaq>) {
    const result = await this.testFaqRepository.findOne(options);
    return plainToInstance(TestFaq, result);
  }

  async remove(where: FindOptionsWhere<TestFaq>, deleteDto: DeleteDto) {
    const record = await this.testFaqRepository.update(
      { ...where, deleted_at: IsNull() },
      {
        deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: new Date().toISOString(),
      },
    );
    return record;
  }
}
