import { DNR_TYPE } from '@/shared/constants/enum';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class FlagDnrDto {
  @IsNotEmpty()
  @IsEnum(DNR_TYPE)
  dnr_type: DNR_TYPE;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  dnr_reason: string[];

  @IsOptional()
  @IsString()
  dnr_description: string;
}
