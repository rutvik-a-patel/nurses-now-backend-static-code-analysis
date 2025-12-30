import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateReferFriendDto {
  @IsString()
  @IsNotEmpty()
  full_name?: string;

  @IsNotEmpty()
  @IsEmail()
  email?: string;

  @IsString()
  @IsNotEmpty()
  country_code?: string;

  @IsString()
  @IsNotEmpty()
  mobile_no?: string;

  // Using in controller, so decorator is not needed until wanted to use form the request body
  referred_by?: number; // Assuming referred_by is a Provider ID
}
