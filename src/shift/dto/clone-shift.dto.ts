import { IsNotEmpty, IsUUID } from 'class-validator';

export class CloneShiftDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
