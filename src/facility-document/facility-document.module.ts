import { Module } from '@nestjs/common';
import { FacilityDocumentService } from './facility-document.service';
import { FacilityDocumentController } from './facility-document.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacilityDocument } from './entities/facility-document.entity';
import { FacilityDocumentCategory } from './entities/facility-document-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FacilityDocument, FacilityDocumentCategory]),
  ],
  controllers: [FacilityDocumentController],
  providers: [FacilityDocumentService],
})
export class FacilityDocumentModule {}
