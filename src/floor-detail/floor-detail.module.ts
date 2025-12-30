import { Module } from '@nestjs/common';
import { FloorDetailService } from './floor-detail.service';
import { FloorDetailController } from './floor-detail.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FloorDetail } from './entities/floor-detail.entity';
import { Activity } from '@/activity/entities/activity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FloorDetail, Activity])],
  controllers: [FloorDetailController],
  providers: [FloorDetailService],
})
export class FloorDetailModule {}
