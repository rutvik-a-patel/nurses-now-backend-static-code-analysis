import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FloorDetail } from './entities/floor-detail.entity';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { CreateFloorDetailDto } from './dto/create-floor-detail.dto';
import { plainToClass, plainToInstance } from 'class-transformer';
import { UpdateFloorDetailDto } from './dto/update-floor-detail.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { ACTIVITY_TYPE, ACTION_TABLES, TABLE } from '@/shared/constants/enum';
import { IRequest } from '@/shared/constants/types';
import { getDeepUpdatedFields } from '@/shared/helpers/get-updated-fields';
import { Activity } from '@/activity/entities/activity.entity';

@Injectable()
export class FloorDetailService {
  constructor(
    @InjectRepository(FloorDetail)
    private readonly floorDetailRepository: Repository<FloorDetail>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  async create(createFloorDetailDto: CreateFloorDetailDto) {
    const result = await this.floorDetailRepository.save(
      plainToClass(FloorDetail, createFloorDetailDto),
    );
    return plainToInstance(FloorDetail, result);
  }

  async findOneWhere(where: FindOneOptions<FloorDetail>) {
    const result = await this.floorDetailRepository.findOne(where);
    return plainToInstance(FloorDetail, result);
  }

  // create a query builder function finding one floor detail
  async findOneWithQueryBuilder(id: string) {
    const result = await this.floorDetailRepository
      .createQueryBuilder('fd')
      .leftJoinAndSelect('fd.facility', 'f')
      .select([
        'fd.id AS id',
        'fd.name AS floor_name',
        ' fd.description AS floor_description',
        'f.id AS facility_id',
        'f.name AS name',
      ])
      .where('fd.id = :id', { id })
      .getRawOne();
    return plainToInstance(FloorDetail, result);
  }

  async findAll(
    where: FindManyOptions<FloorDetail>,
  ): Promise<[FloorDetail[], number]> {
    const [list, count] = await this.floorDetailRepository.findAndCount(where);
    return [plainToInstance(FloorDetail, list), count];
  }

  async update(
    where: FindOptionsWhere<FloorDetail>,
    updateFloorDetailDto: UpdateFloorDetailDto,
  ) {
    const result = await this.floorDetailRepository.update(
      where,
      plainToClass(FloorDetail, updateFloorDetailDto),
    );
    return result;
  }

  async remove(where: FindOptionsWhere<FloorDetail>, deleteDto: DeleteDto) {
    const result = await this.floorDetailRepository.update(where, {
      deleted_at: new Date().toISOString(),
      ...deleteDto,
    });
    return result;
  }

  // Tracking the activity
  async floorActivityLog(
    req: IRequest,
    entity_id: string,
    activity_type: ACTIVITY_TYPE,
    message: Record<string, any>,
    action_for: ACTION_TABLES = ACTION_TABLES.FACILITY,
  ) {
    const action_by_type: TABLE = req.user.role;
    const action_by_id: string = req.user.id;

    const activity = this.activityRepository.create({
      action_by_type,
      entity_id,
      [action_by_type]: action_by_id,
      activity_type,
      message: {
        [req.user.role]: `${req.user.first_name} ${req.user.last_name}`,
        image:
          req.user?.base_url +
          (req.user.role === TABLE.provider
            ? req.user?.profile_image
            : req.user?.image),
        ...message,
      },
      action_for,
    });
    await this.activityRepository.save(activity);
  }

  // role update activity
  async floorActivityUpdateLog(
    req: IRequest,
    entity_id: string,
    activity_type: ACTIVITY_TYPE,
    oldData: Record<string, any>,
    newData: Record<string, any>,
    includedKeys?: string[],
    action_for?: ACTION_TABLES,
  ) {
    const changes = getDeepUpdatedFields(
      oldData,
      newData,
      includedKeys, // include keys to track
      true,
    ) as string[];
    const changesList = changes as string[] | undefined;
    if (!changesList || changesList.length === 0) return;

    await this.floorActivityLog(
      req,
      entity_id,
      activity_type,
      {
        facility_name: newData?.name,
        changes: changesList,
      },
      action_for,
    );
  }
}
