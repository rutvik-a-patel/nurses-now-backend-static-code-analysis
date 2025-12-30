import { ORDER_BY } from '@/shared/constants/types';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class FilterEarningsDto {
  @IsNotEmpty()
  @IsString()
  start_date?: string;

  @IsNotEmpty()
  @IsString()
  end_date?: string;

  @IsOptional()
  @IsString({ each: true })
  status?: string[];

  @IsOptional()
  @IsObject()
  order?: ORDER_BY;
}
