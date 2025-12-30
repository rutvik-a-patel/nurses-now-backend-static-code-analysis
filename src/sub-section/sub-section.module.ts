import { Module } from '@nestjs/common';
import { SubSectionService } from './sub-section.service';
import { SubSectionController } from './sub-section.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubSection } from './entities/sub-section.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubSection])],
  controllers: [SubSectionController],
  providers: [SubSectionService],
})
export class SubSectionModule {}
