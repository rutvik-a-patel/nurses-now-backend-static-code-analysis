import { Module } from '@nestjs/common';
import { FacilityNoteService } from './facility-note.service';
import { FacilityNoteController } from './facility-note.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacilityNote } from './entities/facility-note.entity';
import { Activity } from '@/activity/entities/activity.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { Provider } from '@/provider/entities/provider.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FacilityNote,
      Activity,
      FacilityUser,
      Facility,
      Provider,
    ]),
  ],
  controllers: [FacilityNoteController],
  providers: [FacilityNoteService],
})
export class FacilityNoteModule {}
