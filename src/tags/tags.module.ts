import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './entities/tags.entity';
import { FacilityNote } from '@/facility-note/entities/facility-note.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tag, FacilityNote])],
  controllers: [TagsController],
  providers: [TagsService],
})
export class TagsModule {}
