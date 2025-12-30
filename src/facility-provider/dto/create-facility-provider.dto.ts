import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateFacilityProviderDto {
  @IsNotEmpty()
  @IsUUID()
  provider: string;

  @IsNotEmpty()
  @IsUUID()
  facility: string;
}
