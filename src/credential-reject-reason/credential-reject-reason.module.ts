import { Module } from '@nestjs/common';
import { CredentialRejectReasonService } from './credential-reject-reason.service';
import { CredentialRejectReasonController } from './credential-reject-reason.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CredentialRejectReason } from './entities/credential-reject-reason.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CredentialRejectReason])],
  controllers: [CredentialRejectReasonController],
  providers: [CredentialRejectReasonService],
})
export class CredentialRejectReasonModule {}
