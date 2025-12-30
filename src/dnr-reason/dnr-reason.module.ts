import { Module } from '@nestjs/common';
import { DnrReasonService } from './dnr-reason.service';
import { DnrReasonController } from './dnr-reason.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DnrReason } from './entities/dnr-reason.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DnrReason])],
  controllers: [DnrReasonController],
  providers: [DnrReasonService],
})
export class DnrReasonModule {}
