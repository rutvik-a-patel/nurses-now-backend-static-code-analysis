import { PAYMENT_TYPE } from '@/shared/constants/enum';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  @IsNotEmpty()
  facility: string;

  @IsString()
  @IsNotEmpty()
  payment_method: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  payment_date: string;

  @IsString()
  @IsNotEmpty()
  transaction_number: string;

  @IsNumber()
  @IsOptional()
  outstanding?: number = 0;

  @IsNumber()
  @IsOptional()
  unallocated_amount?: number = 0;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  base_url?: string;

  @IsString()
  @IsOptional()
  filename?: string;

  @IsNotEmpty()
  @IsEnum(PAYMENT_TYPE)
  payment_type: PAYMENT_TYPE;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePaymentWithInvoicesDto)
  payment_invoices: CreatePaymentWithInvoicesDto[];
}

export class CreatePaymentWithInvoicesDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsNumber()
  @IsNotEmpty()
  received: number;
}
