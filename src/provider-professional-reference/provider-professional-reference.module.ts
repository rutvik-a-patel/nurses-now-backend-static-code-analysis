import { Module } from '@nestjs/common';
import { ProviderProfessionalReferenceService } from './provider-professional-reference.service';
import { ProviderProfessionalReferenceController } from './provider-professional-reference.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderProfessionalReference } from './entities/provider-professional-reference.entity';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { ReferenceForm } from '@/reference-form-design/entities/reference-form.entity';
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
import { ProfessionalReferenceResponse } from '@/professional-reference-response/entities/professional-reference-response.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProviderProfessionalReference,
      ReferenceForm,
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
      ProfessionalReferenceResponse,
    ]),
  ],
  controllers: [ProviderProfessionalReferenceController],
  providers: [
    ProviderProfessionalReferenceService,
    EncryptDecryptService,
    NotificationService,
    FirebaseNotificationService,
    TokenService,
    UserNotificationService,
    ChatGateway,
    ChatService,
  ],
})
export class ProviderProfessionalReferenceModule {}
