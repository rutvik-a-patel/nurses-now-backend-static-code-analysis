import { Module } from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { CertificateController } from './certificate.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificate } from './entities/certificate.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { Credential } from '@/credentials/entities/credential.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Provider, Certificate, Shift, Credential]),
  ],
  controllers: [CertificateController],
  providers: [CertificateService],
})
export class CertificateModule {}
