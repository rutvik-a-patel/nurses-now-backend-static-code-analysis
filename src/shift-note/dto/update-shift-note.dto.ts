import { IsOptional, IsString } from 'class-validator';

export class UpdateShiftNoteDto {
  @IsString()
  @IsOptional()
  notes: string;
}
