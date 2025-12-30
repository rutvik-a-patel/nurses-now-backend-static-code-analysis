import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { Invite } from '@/invite/entities/invite.entity';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { Activity } from '@/activity/entities/activity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Admin, Facility, Invite, Activity])],
  controllers: [AdminController],
  providers: [AdminService, EncryptDecryptService],
})
export class AdminModule {}
