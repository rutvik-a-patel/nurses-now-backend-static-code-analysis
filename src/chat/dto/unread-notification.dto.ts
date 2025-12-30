import { IsNotEmpty, IsString } from 'class-validator';

export class UnreadNotificationDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
