import { PartialType } from '@nestjs/mapped-types';
import { CreateFloorDetailDto } from './create-floor-detail.dto';

export class UpdateFloorDetailDto extends PartialType(CreateFloorDetailDto) {}
