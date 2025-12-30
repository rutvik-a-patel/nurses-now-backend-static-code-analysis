import { DeleteDto } from '@/shared/dto/delete.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class DeleteUnPostedDto extends DeleteDto {
  @IsUUID()
  @IsOptional()
  id?: string;
}
