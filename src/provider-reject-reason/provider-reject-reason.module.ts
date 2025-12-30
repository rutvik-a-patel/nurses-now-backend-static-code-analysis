import { Module } from '@nestjs/common';
import { ProviderRejectReasonService } from './provider-reject-reason.service';
import { ProviderRejectReasonController } from './provider-reject-reason.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderRejectReason } from './entities/provider-reject-reason.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProviderRejectReason])],
  controllers: [ProviderRejectReasonController],
  providers: [ProviderRejectReasonService],
})
export class ProviderRejectReasonModule {}
