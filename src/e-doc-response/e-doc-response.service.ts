import { Injectable } from '@nestjs/common';
import { CreateEDocResponseDto } from './dto/create-e-doc-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EDocResponse } from './entities/e-doc-response.entity';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { UpdateEDocResponseDto } from './dto/update-e-doc-response.dto';

@Injectable()
export class EDocResponseService {
  constructor(
    @InjectRepository(EDocResponse)
    private readonly eDocResponseRepository: Repository<EDocResponse>,
  ) {}
  async create(
    createEDocResponseDto: CreateEDocResponseDto,
  ): Promise<EDocResponse> {
    const data = await this.eDocResponseRepository.save(
      plainToInstance(EDocResponse, createEDocResponseDto),
    );
    return plainToInstance(EDocResponse, data);
  }

  async findOneWhere(
    options: FindOneOptions<EDocResponse>,
  ): Promise<EDocResponse> {
    const result = await this.eDocResponseRepository.findOne(options);
    return plainToInstance(EDocResponse, result);
  }

  async updateWhere(
    options: FindOptionsWhere<EDocResponse>,
    updateEDocResponseDto: UpdateEDocResponseDto,
  ) {
    const result = await this.eDocResponseRepository.update(
      options,
      plainToInstance(EDocResponse, updateEDocResponseDto),
    );

    return result;
  }
}
