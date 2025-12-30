import { IsOptional } from 'class-validator';

export class DeleteDto {
  @IsOptional()
  deleted_at_ip?: string;
}
