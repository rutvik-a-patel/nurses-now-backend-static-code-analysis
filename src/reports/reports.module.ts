import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { FacilityProvider } from '@/facility-provider/entities/facility-provider.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([FacilityProvider])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
