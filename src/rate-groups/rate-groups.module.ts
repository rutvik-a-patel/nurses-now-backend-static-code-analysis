import { Module } from '@nestjs/common';
import { RateGroupsService } from './rate-groups.service';
import { RateGroupsController } from './rate-groups.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RateGroup } from './entities/rate-group.entity';
import { RateSheet } from './entities/rate-sheet.entity';
import { Certificate } from '@/certificate/entities/certificate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RateGroup, RateSheet, Certificate])],
  controllers: [RateGroupsController],
  providers: [RateGroupsService],
})
export class RateGroupsModule {}
