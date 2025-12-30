import { PartialType } from '@nestjs/mapped-types';
import { CreateProviderOrientationDto } from './create-provider-orientation.dto';

export class UpdateProviderOrientationDto extends PartialType(
  CreateProviderOrientationDto,
) {}
