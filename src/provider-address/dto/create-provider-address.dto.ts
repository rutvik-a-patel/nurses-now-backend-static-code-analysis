import { Provider } from '@/provider/entities/provider.entity';
import { Type } from 'class-transformer';
import {
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateProviderAddressDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsString()
  zip_code: string;

  @IsOptional()
  @IsString()
  street: string;

  @IsOptional()
  @IsString()
  apartment: string;

  @IsOptional()
  @IsLatitude()
  latitude: string;

  @IsOptional()
  @IsLongitude()
  longitude: string;

  @IsOptional()
  @IsString()
  place_id: string;

  @IsOptional()
  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  state: string;

  @IsNotEmpty()
  @Type(() => Provider)
  provider: Provider;
}
