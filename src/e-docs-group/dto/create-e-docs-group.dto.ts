import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEDocsGroupDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
