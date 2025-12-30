import { Module } from '@nestjs/common';
import { SpecialityService } from './speciality.service';
import { SpecialityController } from './speciality.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Speciality } from './entities/speciality.entity';
import { Credential } from '@/credentials/entities/credential.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { Provider } from '@/provider/entities/provider.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Speciality, Shift, Credential, Provider]),
  ],
  controllers: [SpecialityController],
  providers: [SpecialityService],
})
export class SpecialityModule {}
