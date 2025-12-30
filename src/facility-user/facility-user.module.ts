import { Module } from '@nestjs/common';
import { FacilityUserService } from './facility-user.service';
import { FacilityUserController } from './facility-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacilityUser } from './entities/facility-user.entity';
import { FacilityUserPermission } from './entities/facility-user-permission.entity';
import { FacilityPermission } from './entities/facility-permission.entity';
import { Admin } from '@/admin/entities/admin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FacilityUser,
      FacilityUserPermission,
      FacilityPermission,
      Admin,
    ]),
  ],
  controllers: [FacilityUserController],
  providers: [FacilityUserService],
})
export class FacilityUserModule {}
