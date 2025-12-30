import { Module } from '@nestjs/common';
import { TimeEntryApprovalService } from './time-entry-approval.service';
import { TimeEntryApprovalController } from './time-entry-approval.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeEntryApproval } from './entities/time-entry-approval.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimeEntryApproval])],
  controllers: [TimeEntryApprovalController],
  providers: [TimeEntryApprovalService],
})
export class TimeEntryApprovalModule {}
