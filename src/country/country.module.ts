import { Module } from '@nestjs/common';
import { CountryService } from './country.service';
import { CountryController } from './country.controller';
import { StateService } from '@/state/state.service';
import { CityService } from '@/city/city.service';

@Module({
  controllers: [CountryController],
  providers: [CountryService, StateService, CityService],
})
export class CountryModule {}
