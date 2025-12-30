import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferenceFormGlobalSettingService } from './reference-form-global-setting.service';
import { ReferenceFormGlobalSettingController } from './reference-form-global-setting.controller';
import { ReferenceFormGlobalSetting } from './entities/reference-form-global-setting.entity';
import { ProviderProfessionalReference } from '@/provider-professional-reference/entities/provider-professional-reference.entity';
import { ProfessionalReferenceResponse } from '@/professional-reference-response/entities/professional-reference-response.entity';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import { Notification } from '@/notification/entities/notification.entity';
import { Token } from '@/token/entities/token.entity';
import { TokenService } from '@/token/token.service';
import { UserNotificationService } from '@/user-notification/user-notification.service';
import { ChatGateway } from '@/chat/chat.gateway';
import { UserNotification } from '@/user-notification/entities/user-notification.entity';
import { ChatService } from '@/chat/chat.service';
import { Chat } from '@/chat/entities/chat.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { Media } from '@/media/entities/media.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { Admin } from '@/admin/entities/admin.entity';
import { Department } from '@/department/entities/department.entity';
import { Room } from '@/room/entities/room.entity';
import { Shift } from '@/shift/entities/shift.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReferenceFormGlobalSetting,
      ProviderProfessionalReference,
      ProfessionalReferenceResponse,
      Notification,
      Token,
      UserNotification,
      Chat,
      Provider,
      Media,
      Facility,
      FacilityUser,
      Admin,
      Department,
      Room,
      Shift,
    ]),
  ],
  controllers: [ReferenceFormGlobalSettingController],
  providers: [
    ReferenceFormGlobalSettingService,
    EncryptDecryptService,
    NotificationService,
    FirebaseNotificationService,
    TokenService,
    UserNotificationService,
    ChatGateway,
    ChatService,
  ],
  exports: [ReferenceFormGlobalSettingService],
})
export class ReferenceFormGlobalSettingModule {}
