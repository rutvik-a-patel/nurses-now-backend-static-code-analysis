import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFacilityDocumentCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
