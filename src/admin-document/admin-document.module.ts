import { Module } from '@nestjs/common';
import { AdminDocumentService } from './admin-document.service';
import { AdminDocumentController } from './admin-document.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminDocument } from './entities/admin-document.entity';
import { Documents } from '@/documents/entities/documents.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdminDocument, Documents])],
  controllers: [AdminDocumentController],
  providers: [AdminDocumentService],
})
export class AdminDocumentModule {}
