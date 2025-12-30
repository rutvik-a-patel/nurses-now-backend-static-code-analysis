import { Module } from '@nestjs/common';
import { EDocsService } from './e-docs.service';
import { EDocsController } from './e-docs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EDoc } from './entities/e-doc.entity';
import { EDocResponse } from '@/e-doc-response/entities/e-doc-response.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EDoc, EDocResponse])],
  controllers: [EDocsController],
  providers: [EDocsService],
})
export class EDocsModule {}
