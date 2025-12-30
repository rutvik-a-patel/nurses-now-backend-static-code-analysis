import { PartialType } from '@nestjs/mapped-types';
import { CreateLineOfBusinessDto } from './create-line-of-business.dto';

export class UpdateLineOfBusinessDto extends PartialType(
  CreateLineOfBusinessDto,
) {}
