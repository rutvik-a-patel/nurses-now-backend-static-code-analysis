import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { MEDIA_FOLDER } from '@/shared/constants/enum';

export class CreateUploadDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(MEDIA_FOLDER)
  folder: MEDIA_FOLDER;
}
