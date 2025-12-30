import { Module } from '@nestjs/common';
import { FacilityRejectReasonService } from './facility-reject-reason.service';
import { FacilityRejectReasonController } from './facility-reject-reason.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacilityRejectReason } from './entities/facility-reject-reason.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FacilityRejectReason])],
  controllers: [FacilityRejectReasonController],
  providers: [FacilityRejectReasonService],
})
export class FacilityRejectReasonModule {}
