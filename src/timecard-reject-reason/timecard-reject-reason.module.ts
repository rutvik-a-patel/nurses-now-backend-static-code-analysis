import { Module } from '@nestjs/common';
import { TimecardRejectReasonService } from './timecard-reject-reason.service';
import { TimecardRejectReasonController } from './timecard-reject-reason.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimecardRejectReason } from './entities/timecard-reject-reason.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimecardRejectReason])],
  controllers: [TimecardRejectReasonController],
  providers: [TimecardRejectReasonService],
})
export class TimecardRejectReasonModule {}
