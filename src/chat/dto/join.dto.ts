import { TABLE } from '@/shared/constants/enum';
import { IsNotEmpty, IsObject, IsUUID } from 'class-validator';

export class JoinDto {
  @IsNotEmpty()
  @IsUUID()
  room: string;

  @IsNotEmpty()
  @IsObject()
  user: {
    id: string;
    name: string;
    user_type: TABLE;
  };
}
