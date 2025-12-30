import { PartialType } from '@nestjs/mapped-types';
import { CreateRateGroupDto } from './create-rate-group.dto';

export class UpdateRateGroupDto extends PartialType(CreateRateGroupDto) {}
