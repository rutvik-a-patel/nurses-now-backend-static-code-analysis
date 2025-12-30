import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsNumber,
  IsString,
  ValidateNested,
  IsBoolean,
  Max,
} from 'class-validator';
import { AvailabilityStatusDTO } from './provider-availability.dto';

export class ShiftTimePreferenceDto {
  @IsOptional()
  @IsBoolean()
  D?: boolean = false; // 8 Hours Days

  @IsOptional()
  @IsBoolean()
  E?: boolean = false; // 8 Hours Evenings

  @IsOptional()
  @IsBoolean()
  N?: boolean = false; // 8 Hours Nights

  @IsOptional()
  @IsBoolean()
  A?: boolean = false; // 12 Hours Day

  @IsOptional()
  @IsBoolean()
  P?: boolean = false; // 12 Hours Night
}

export class UpdatePreferenceSettingDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  preferred_state: string[];

  @IsOptional()
  @IsNumber()
  @Max(250, { message: 'Radius must be 250 or less' })
  radius: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ShiftTimePreferenceDto)
  shift_time: ShiftTimePreferenceDto;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  shift_preference: string[];

  @IsOptional()
  @IsArray()
  availability_status: AvailabilityStatusDTO[];
}
