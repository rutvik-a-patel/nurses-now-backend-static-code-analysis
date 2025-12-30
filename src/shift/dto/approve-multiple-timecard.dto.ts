import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class ApproveMultipleTimecardDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  shift_ids: string[];

  @IsString()
  @IsOptional()
  base_url?: string;

  @IsString()
  @IsNotEmpty()
  authority_signature: string;
}
