import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCredentialsCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
