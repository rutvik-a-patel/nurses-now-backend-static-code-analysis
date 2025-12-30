import { Module } from '@nestjs/common';
import { FacilityService } from './facility.service';
import { FacilityController } from './facility.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Facility } from './entities/facility.entity';
import { FacilityUserService } from '@/facility-user/facility-user.service';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { FacilityUserPermission } from '@/facility-user/entities/facility-user-permission.entity';
import { FacilityPermission } from '@/facility-user/entities/facility-permission.entity';
import { FacilityPortalSetting } from './entities/facility-portal-setting.entity';
import { TimeEntrySetting } from './entities/time-entry-setting.entity';
import { FloorDetail } from '@/floor-detail/entities/floor-detail.entity';
import { Invite } from '@/invite/entities/invite.entity';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { StatusSettingService } from '@/status-setting/status-setting.service';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';
import { FacilityShiftSetting } from '@/facility-shift-setting/entities/facility-shift-setting.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { AccountingSetting } from './entities/accounting-setting.entity';
import { Admin } from '@/admin/entities/admin.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { ShiftCancelReason } from '@/shift-cancel-reason/entities/shift-cancel-reason.entity';
import { Token } from '@/token/entities/token.entity';
import { Activity } from '@/activity/entities/activity.entity';
import { City } from '@/city/entities/city.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Facility,
      FacilityUser,
      FacilityUserPermission,
      FacilityPermission,
      FacilityPortalSetting,
      TimeEntrySetting,
      FloorDetail,
      Invite,
      StatusSetting,
      FacilityShiftSetting,
      Provider,
      AccountingSetting,
      Admin,
      Shift,
      ShiftCancelReason,
      Token,
      Activity,
      City,
    ]),
  ],
  controllers: [FacilityController],
  providers: [
    FacilityService,
    FacilityUserService,
    EncryptDecryptService,
    StatusSettingService,
  ],
})
export class FacilityModule {}
