import { Module } from '@nestjs/common';
import { ProviderSavedFacilityService } from './provider-saved-facility.service';
import { ProviderSavedFacilityController } from './provider-saved-facility.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderSavedFacility } from './entities/provider-saved-facility.entity';
import { FacilityProvider } from '@/facility-provider/entities/facility-provider.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProviderSavedFacility, FacilityProvider]),
  ],
  controllers: [ProviderSavedFacilityController],
  providers: [ProviderSavedFacilityService],
})
export class ProviderSavedFacilityModule {}
