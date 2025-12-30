import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from '@/department/entities/department.entity';
import { Admin } from '@/admin/entities/admin.entity';
import { Room } from './entities/room.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { Provider } from '@/provider/entities/provider.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Department,
      Admin,
      Room,
      Facility,
      FacilityUser,
      Provider,
    ]),
  ],
  controllers: [RoomController],
  providers: [RoomService],
})
export class RoomModule {}
