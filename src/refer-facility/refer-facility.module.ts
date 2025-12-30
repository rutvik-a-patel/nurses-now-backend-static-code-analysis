import { Module } from '@nestjs/common';
import { ReferFacilityService } from './refer-facility.service';
import { ReferFacilityController } from './refer-facility.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferFacility } from './entities/refer-facility.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReferFacility])],
  controllers: [ReferFacilityController],
  providers: [ReferFacilityService],
})
export class ReferFacilityModule {}
