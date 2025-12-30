import { IsArray, ArrayNotEmpty, IsEmail } from 'class-validator';

export class SendCredentialDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one email is required' })
  @IsEmail({}, { each: true, message: 'Each email must be valid' })
  email: string[];
}
