import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class CreateTestFaqDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  answer: string;

  @IsNumber()
  @IsNotEmpty()
  order: number;
}

export class TestFaqDto {
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  delete_faqs?: string[];

  @IsNotEmpty()
  @IsArray()
  @Type(() => CreateTestFaqDto)
  @ValidateNested({ each: true })
  faqs: CreateTestFaqDto[];

  @IsOptional()
  @IsString()
  created_at_ip?: string;

  @IsOptional()
  @IsString()
  updated_at_ip?: string;
}
