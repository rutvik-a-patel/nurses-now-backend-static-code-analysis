import { PartialType } from '@nestjs/mapped-types';
import { CreateTimecardDto } from './create-timecard.dto';

export class UpdateTimecardDto extends PartialType(CreateTimecardDto) {}
