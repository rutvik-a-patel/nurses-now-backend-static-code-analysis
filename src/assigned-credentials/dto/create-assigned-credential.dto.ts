import { ArrayMinSize, IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateAssignedCredentialDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty()
  @IsUUID(undefined, { each: true })
  credential_id: string[];
}
