import { IsArray, IsEmail, IsNotEmpty, IsUUID } from 'class-validator';

export class ShareInvoiceDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsArray()
  @IsNotEmpty()
  @IsEmail({}, { each: true })
  emails: string[];
}
