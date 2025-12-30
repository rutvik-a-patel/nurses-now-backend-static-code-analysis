import { Module } from '@nestjs/common';
import { OrientationRejectReasonService } from './orientation-reject-reason.service';
import { OrientationRejectReasonController } from './orientation-reject-reason.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrientationRejectReason } from './entities/orientation-reject-reason.entity';
import { ProviderOrientation } from '@/provider-orientation/entities/provider-orientation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrientationRejectReason, ProviderOrientation]),
  ],
  controllers: [OrientationRejectReasonController],
  providers: [OrientationRejectReasonService],
})
export class OrientationRejectReasonModule {}
