import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class VerifyEmailDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNumber()
  @IsOptional()
  otp?: number;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  updated_at_ip: string;
}
