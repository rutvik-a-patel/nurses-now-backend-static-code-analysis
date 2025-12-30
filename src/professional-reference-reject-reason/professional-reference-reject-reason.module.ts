import { Module } from '@nestjs/common';
import { ProfessionalReferenceRejectReasonService } from './professional-reference-reject-reason.service';
import { ProfessionalReferenceRejectReasonController } from './professional-reference-reject-reason.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfessionalReferenceRejectReason } from './entities/professional-reference-reject-reason.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProfessionalReferenceRejectReason])],
  controllers: [ProfessionalReferenceRejectReasonController],
  providers: [ProfessionalReferenceRejectReasonService],
})
export class ProfessionalReferenceRejectReasonModule {}
