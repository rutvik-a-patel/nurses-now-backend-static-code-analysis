import { PushNotificationType } from '@/shared/constants/enum';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserNotificationDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  text: string;

  @IsNotEmpty()
  @IsEnum(PushNotificationType)
  push_type: string;
}
