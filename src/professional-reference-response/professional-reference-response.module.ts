import { Module } from '@nestjs/common';
import { ProfessionalReferenceResponseService } from './professional-reference-response.service';
import { ProfessionalReferenceResponseController } from './professional-reference-response.controller';
import { ProviderProfessionalReference } from '@/provider-professional-reference/entities/provider-professional-reference.entity';
import { ReferenceFormDesign } from '@/reference-form-design/entities/reference-form-design.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfessionalReferenceResponse } from './entities/professional-reference-response.entity';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import { TokenService } from '@/token/token.service';
import { NotificationService } from '@/notification/notification.service';
import { UserNotificationService } from '@/user-notification/user-notification.service';
import { ChatGateway } from '@/chat/chat.gateway';
import { Notification } from '@/notification/entities/notification.entity';
import { UserNotification } from '@/user-notification/entities/user-notification.entity';
import { Token } from '@/token/entities/token.entity';
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
      ProfessionalReferenceResponse,
      ReferenceFormDesign,
      ProviderProfessionalReference,
      Notification,
      UserNotification,
      Token,
      Chat,
      Provider,
      Media,
      Admin,
      Facility,
      FacilityUser,
      Department,
      Room,
      Shift,
    ]),
  ],
  controllers: [ProfessionalReferenceResponseController],
  providers: [
    ProfessionalReferenceResponseService,
    EncryptDecryptService,
    FirebaseNotificationService,
    NotificationService,
    UserNotificationService,
    TokenService,
    ChatGateway,
    ChatService,
  ],
})
export class ProfessionalReferenceResponseModule {}
