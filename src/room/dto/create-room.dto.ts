import { CHAT_TABLE } from '@/shared/constants/enum';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateRoomDto {
  @IsNotEmpty()
  @IsUUID()
  sender_id: string;

  @IsNotEmpty()
  @IsEnum(CHAT_TABLE)
  sender_type: CHAT_TABLE;
}
