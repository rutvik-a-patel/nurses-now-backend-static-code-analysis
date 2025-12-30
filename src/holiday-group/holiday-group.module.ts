import { Module } from '@nestjs/common';
import { HolidayGroupService } from './holiday-group.service';
import { HolidayGroupController } from './holiday-group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HolidayGroup } from './entities/holiday-group.entity';
import { FacilityHoliday } from '@/facility-holiday/entities/facility-holiday.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HolidayGroup, FacilityHoliday])],
  controllers: [HolidayGroupController],
  providers: [HolidayGroupService],
})
export class HolidayGroupModule {}
