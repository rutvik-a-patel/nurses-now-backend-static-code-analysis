import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { IsOptional, IsArray, IsIn, IsUUID } from 'class-validator';

export class FilterShiftInvitation extends QueryParamsDto {
  @IsOptional()
  @IsArray()
  @IsIn(
    [
      'facility_withdrawn',
      'facility_invited',
      'ai_scheduling',
      'ai_invitation_rejected',
      'provider_rejected',
      'provider_requested',
      'provider_cancelled',
      'assigned',
      'accepted',
    ] as const,
    { each: true },
  )
  invitation_status?: string[];

  @IsArray()
  @IsOptional()
  @IsUUID(undefined, { each: true })
  provider?: string[];
}
