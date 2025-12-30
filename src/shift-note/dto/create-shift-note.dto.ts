import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateShiftNoteDto {
  @IsNotEmpty()
  @IsString()
  notes: string;

  @IsNotEmpty()
  @IsUUID()
  shift_id: string;
}
