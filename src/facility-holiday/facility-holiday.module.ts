import { Module } from '@nestjs/common';
import { FacilityHolidayService } from './facility-holiday.service';
import { FacilityHolidayController } from './facility-holiday.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacilityHoliday } from './entities/facility-holiday.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FacilityHoliday])],
  controllers: [FacilityHolidayController],
  providers: [FacilityHolidayService],
})
export class FacilityHolidayModule {}
