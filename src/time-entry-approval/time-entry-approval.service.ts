import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TimeEntryApproval } from './entities/time-entry-approval.entity';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { UpdateTimeEntryApprovalDto } from './dto/update-time-entry-approval.dto';

@Injectable()
export class TimeEntryApprovalService {
  constructor(
    @InjectRepository(TimeEntryApproval)
    private readonly timeEntryApprovalRepository: Repository<TimeEntryApproval>,
  ) {}

  async findOneWhere(options: FindOneOptions<TimeEntryApproval>) {
    const data = await this.timeEntryApprovalRepository.findOne(options);
    return plainToInstance(TimeEntryApproval, data);
  }

  async findAll(
    options: FindManyOptions<TimeEntryApproval>,
  ): Promise<TimeEntryApproval[]> {
    const list = await this.timeEntryApprovalRepository.find(options);
    return plainToInstance(TimeEntryApproval, list);
  }

  async updateWhere(
    options: FindOptionsWhere<TimeEntryApproval>,
    updateTimeEntryApprovalDto: UpdateTimeEntryApprovalDto,
  ) {
    const data = await this.timeEntryApprovalRepository.update(
      options,
      updateTimeEntryApprovalDto,
    );
    return data;
  }
}
