import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateFacilityGeneralSettingDto {
  @IsNotEmpty()
  @IsBoolean()
  is_active: boolean;
}
