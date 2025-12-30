import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTimeEntryApprovalDto {
  @IsNotEmpty()
  @IsString()
  value: string;
}
