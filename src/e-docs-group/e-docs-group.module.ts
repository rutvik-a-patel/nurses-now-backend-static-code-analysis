import { Module } from '@nestjs/common';
import { EDocsGroupService } from './e-docs-group.service';
import { EDocsGroupController } from './e-docs-group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EDocsGroup } from './entities/e-docs-group.entity';
import { EDoc } from '@/e-docs/entities/e-doc.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EDocsGroup, EDoc])],
  controllers: [EDocsGroupController],
  providers: [EDocsGroupService],
})
export class EDocsGroupModule {}
