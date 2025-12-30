import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateEDocResponseDto {
  @IsNotEmpty()
  @IsString()
  document: string;

  @IsOptional()
  @IsString()
  original_filename?: string;
}
