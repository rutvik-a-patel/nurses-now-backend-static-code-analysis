import { MultiSelectQueryParamsDto } from '@/shared/dto/query-params.dto';
import { IsOptional, IsArray, IsString } from 'class-validator';

export class TimingSettingDto extends MultiSelectQueryParamsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  start_time?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  end_time?: string[];
}
