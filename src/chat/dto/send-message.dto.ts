export class SendMessageDto {
  id: string;
  room: string;
  shift: string;
  message: string;
  user_id: string;
  user_type: string;
  media: {
    image: string[];
  };
  created_at_ip: string;
  parent: string;
}
