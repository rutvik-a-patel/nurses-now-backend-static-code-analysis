import { PartialType } from '@nestjs/mapped-types';
import { CreateCredentialDto } from './create-credential.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateCredentialDto extends PartialType(CreateCredentialDto) {
  @IsUUID()
  @IsOptional()
  updated_by?: string;
}
