import { PartialType } from '@nestjs/mapped-types';
import { CreateChatDto } from './create-chat.dto';

export class UpdateChatDto extends PartialType(CreateChatDto) {
  id: string;
  room: string;
  message: string;
  media: {
    image: string[];
  };
  updated_at_ip: string;
  parent: string;
}
