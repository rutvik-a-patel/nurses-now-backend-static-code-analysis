import { PartialType } from '@nestjs/mapped-types';
import { CreateProviderAddressDto } from './create-provider-address.dto';

export class UpdateProviderAddressDto extends PartialType(
  CreateProviderAddressDto,
) {}
