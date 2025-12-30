import { Injectable } from '@nestjs/common';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, IsNull, Repository } from 'typeorm';
import { Credential } from './entities/credential.entity';
import { plainToInstance } from 'class-transformer';
import { IRequest } from '@/shared/constants/types';
import { ProviderCredential } from '@/provider-credentials/entities/provider-credential.entity';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { SkillChecklistResponse } from '@/skill-checklist-module/entities/skill-checklist-response.entity';
import { CompetencyTestScore } from '@/competency-test-response/entities/competency-test-score.entity';
import { CHECKLIST_STATUS } from '@/shared/constants/enum';

@Injectable()
export class CredentialsService {
  constructor(
    @InjectRepository(Credential)
    private readonly credentialRepository: Repository<Credential>,
    @InjectRepository(ProviderCredential)
    private readonly providerCredentialRepository: Repository<ProviderCredential>,
    @InjectRepository(SkillChecklistResponse)
    private readonly skillChecklistResponseRepository: Repository<SkillChecklistResponse>,
    @InjectRepository(CompetencyTestScore)
    private readonly competencyTestScoreRepository: Repository<CompetencyTestScore>,
  ) {}

  async create(createCredentialDto: CreateCredentialDto, req: IRequest) {
    createCredentialDto.created_by = req.user.id;
    const data = await this.credentialRepository.save(
      plainToInstance(Credential, createCredentialDto),
    );
    return plainToInstance(Credential, data);
  }

  async findOneWhere(options: FindOneOptions<Credential>) {
    const result = await this.credentialRepository.findOne(options);
    return plainToInstance(Credential, result);
  }

  async update(id: string, updateCredentialDto: UpdateCredentialDto) {
    const record = await this.credentialRepository.update(
      id,
      plainToInstance(Credential, {
        ...updateCredentialDto,
        updated_at: new Date().toISOString(),
      }),
    );
    return record;
  }

  async isCredentialInUse(id: string) {
    const uploadDocumentCount = await this.providerCredentialRepository.count({
      where: { credential: { id } },
    });

    const credential = await this.credentialRepository.findOne({
      where: { id },
    });

    const skillCount = credential?.credential_id
      ? await this.skillChecklistResponseRepository.count({
          where: {
            skill_checklist_template: { id: credential.credential_id },
            status: CHECKLIST_STATUS.pending,
          },
        })
      : 0;

    const competencyCount = credential?.credential_id
      ? await this.competencyTestScoreRepository.count({
          where: { competency_test_setting: { id: credential.credential_id } },
        })
      : 0;

    return !!uploadDocumentCount || !!skillCount || !!competencyCount;
  }

  async remove(id: string, deleteDto: DeleteDto) {
    const record = await this.credentialRepository.update(
      { id: id, deleted_at: IsNull() },
      {
        deleted_at: new Date().toISOString(),
        deleted_at_ip: deleteDto.deleted_at_ip,
      },
    );

    return record;
  }
}
