import { IsNotEmpty, IsString } from 'class-validator';

export class ClockOutDto {
  @IsNotEmpty()
  @IsString()
  shift_id: string;
}
