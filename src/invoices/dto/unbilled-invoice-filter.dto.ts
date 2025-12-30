import { INVOICE_STATUS } from '@/shared/constants/enum';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UnbilledInvoiceFilterDto extends QueryParamsDto {
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  facility?: string[];
}

export class BilledInvoiceFilterDto extends UnbilledInvoiceFilterDto {
  @IsOptional()
  @IsArray()
  @IsEnum(INVOICE_STATUS, { each: true })
  @Type(() => String)
  invoice_status?: INVOICE_STATUS[];

  @IsOptional()
  @IsString()
  invoice_number?: string;

  @IsOptional()
  @IsNumberString()
  total?: string;

  @IsOptional()
  @IsNumberString()
  outstanding?: string;

  @IsOptional()
  @IsNumberString()
  aging?: string;
}
