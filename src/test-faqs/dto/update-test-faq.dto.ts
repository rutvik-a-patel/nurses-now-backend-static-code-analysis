import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateTestFaqDto {
  @IsString()
  @IsOptional()
  question: string;

  @IsString()
  @IsOptional()
  answer: string;

  @IsNumber()
  @IsOptional()
  order: number;
}
