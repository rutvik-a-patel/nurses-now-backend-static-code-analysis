import { PartialType } from '@nestjs/mapped-types';
import { CreateFacilityNoteDto } from './create-facility-note.dto';

export class UpdateFacilityNoteDto extends PartialType(CreateFacilityNoteDto) {}
