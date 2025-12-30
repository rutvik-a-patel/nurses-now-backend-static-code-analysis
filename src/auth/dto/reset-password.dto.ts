import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsStrongPassword()
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsString()
  updated_at_ip?: string;
}
