import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Documents } from './entities/documents.entity';
import { Activity } from '@/activity/entities/activity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Documents, Activity])],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
