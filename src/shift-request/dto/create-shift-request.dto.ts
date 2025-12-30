import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateShiftRequestDto {
  @IsNotEmpty()
  @IsUUID()
  provider: string;

  @IsNotEmpty()
  @IsUUID()
  shift: string;
}
