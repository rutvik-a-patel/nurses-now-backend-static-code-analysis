import { Module } from '@nestjs/common';
import { ProviderAddressService } from './provider-address.service';
import { ProviderAddressController } from './provider-address.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderAddress } from './entities/provider-address.entity';
import { City } from '@/city/entities/city.entity';
import { State } from '@/state/entities/state.entity';
import { Country } from '@/country/entities/country.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProviderAddress, City, State, Country])],
  controllers: [ProviderAddressController],
  providers: [ProviderAddressService],
})
export class ProviderAddressModule {}
