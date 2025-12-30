import { Provider } from '@/provider/entities/provider.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { FindOneOptions, Repository } from 'typeorm';
import { AssignedCredential } from './entities/assigned-credential.entity';
import { CreateAssignedCredentialDto } from './dto/create-assigned-credential.dto';
import { Activity } from '@/activity/entities/activity.entity';
import { ACTIVITY_TYPE, ACTION_TABLES, TABLE } from '@/shared/constants/enum';
import { IRequest } from '@/shared/constants/types';
import { getUpdatedFields } from '@/shared/helpers/get-updated-fields';

@Injectable()
export class AssignedCredentialsService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(AssignedCredential)
    private readonly assignedCredentialRepository: Repository<AssignedCredential>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  async create(
    createAssignedCredentialDto: CreateAssignedCredentialDto,
    id: string,
  ) {
    const body = [];
    createAssignedCredentialDto.credential_id.forEach((credential) => {
      body.push({
        credential_id: credential,
        provider: id,
      });
    });

    const result = await this.assignedCredentialRepository.save(body);
    return result;
  }

  async findOneProviderWhere(option: FindOneOptions<Provider>) {
    const result = await this.providerRepository.findOne(option);
    return plainToInstance(Provider, result);
  }

  // Tracking the activity
  async assignCredentialActivityLog(
    req: IRequest,
    entity_id: string,
    activity_type: ACTIVITY_TYPE,
    message: Record<string, any>,
    action_for: ACTION_TABLES = ACTION_TABLES.PROVIDER_CREDENTIAL,
  ) {
    const action_by_type: TABLE = req.user.role;
    const action_by_id: string = req.user.id;

    const activity = this.activityRepository.create({
      action_by_type,
      entity_id,
      [action_by_type]: action_by_id,
      activity_type,
      message,
      action_for,
    });
    await this.activityRepository.save(activity);
  }

  // role update activity
  async assignCredentialActivityUpdateLog(
    req: IRequest,
    entity_id: string,
    activity_type: ACTIVITY_TYPE,
    oldData: Record<string, any>,
    newData: Record<string, any>,
    includedKeys?: string[],
  ) {
    const changes = getUpdatedFields(
      oldData,
      newData,
      includedKeys, // include keys to track
      true,
    ) as string[];

    const changesList = changes as string[] | undefined;
    if (!changesList || changesList.length === 0) return;

    await this.assignCredentialActivityLog(req, entity_id, activity_type, {
      changes: changesList,
    });
  }
}
