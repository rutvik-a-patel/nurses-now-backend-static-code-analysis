import { Module } from '@nestjs/common';
import { LineOfBusinessService } from './line-of-business.service';
import { LineOfBusinessController } from './line-of-business.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LineOfBusiness } from './entities/line-of-business.entity';
import { Facility } from '@/facility/entities/facility.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LineOfBusiness, Facility])],
  controllers: [LineOfBusinessController],
  providers: [LineOfBusinessService],
})
export class LineOfBusinessModule {}
