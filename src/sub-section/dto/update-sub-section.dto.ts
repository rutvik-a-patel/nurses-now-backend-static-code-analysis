import { PartialType } from '@nestjs/mapped-types';
import { CreateSubSectionDto } from './create-sub-section.dto';

export class UpdateSubSectionDto extends PartialType(CreateSubSectionDto) {}
