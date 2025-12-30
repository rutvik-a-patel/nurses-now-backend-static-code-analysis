import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class TypingDto {
  @IsString()
  @IsNotEmpty()
  room: string;

  @IsBoolean()
  @IsNotEmpty()
  is_typing: boolean;
}
