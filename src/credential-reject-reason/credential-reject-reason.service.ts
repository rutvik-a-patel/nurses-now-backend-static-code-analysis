import { Injectable } from '@nestjs/common';
import { CreateCredentialRejectReasonDto } from './dto/create-credential-reject-reason.dto';
import { UpdateCredentialRejectReasonDto } from './dto/update-credential-reject-reason.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { plainToInstance } from 'class-transformer';
import { Repository, FindOneOptions, FindManyOptions, IsNull } from 'typeorm';
import { CredentialRejectReason } from './entities/credential-reject-reason.entity';

@Injectable()
export class CredentialRejectReasonService {
  constructor(
    @InjectRepository(CredentialRejectReason)
    private readonly credentialRejectReasonRepository: Repository<CredentialRejectReason>,
  ) {}
  async create(
    createCredentialRejectReasonDto: CreateCredentialRejectReasonDto,
  ) {
    const result = await this.credentialRejectReasonRepository.save(
      createCredentialRejectReasonDto,
    );
    return plainToInstance(CredentialRejectReason, result);
  }

  async checkName(reason: string, id?: string) {
    const queryBuilder = this.credentialRejectReasonRepository
      .createQueryBuilder('p')
      .where('LOWER(p.reason) = LOWER(:reason)', {
        reason,
      });

    if (id) {
      queryBuilder.andWhere('p.id != :id', { id });
    }

    const data = await queryBuilder.getOne();

    return data;
  }

  async findOneWhere(options: FindOneOptions<CredentialRejectReason>) {
    const result = await this.credentialRejectReasonRepository.findOne(options);
    return plainToInstance(CredentialRejectReason, result);
  }

  async findAll(
    options: FindManyOptions<CredentialRejectReason>,
  ): Promise<[CredentialRejectReason[], number]> {
    const [list, count] =
      await this.credentialRejectReasonRepository.findAndCount(options);
    return [plainToInstance(CredentialRejectReason, list), count];
  }

  async update(
    id: string,
    updateCredentialRejectReasonDto: UpdateCredentialRejectReasonDto,
  ) {
    const record = await this.credentialRejectReasonRepository.update(
      id,
      updateCredentialRejectReasonDto,
    );
    return record;
  }

  async remove(id: string, deleteDto: DeleteDto) {
    const record = await this.credentialRejectReasonRepository.update(
      { id: id, deleted_at: IsNull() },
      {
        deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: new Date().toISOString(),
      },
    );
    return record;
  }

  async isAlreadyInUse(id: string) {
    const record = await this.credentialRejectReasonRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect(
        'p.provider_credential',
        'provider_credential',
        'provider_credential.reason_id = p.id AND provider_credential.deleted_at IS NULL',
      )
      .where('p.id = :id', { id })
      .andWhere('provider_credential.id IS NOT NULL')
      .getOne();

    return record ? true : false;
  }
}
