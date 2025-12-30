import { Module } from '@nestjs/common';
import { ProviderCredentialsService } from './provider-credentials.service';
import { ProviderCredentialsController } from './provider-credentials.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderCredential } from './entities/provider-credential.entity';
import { CredentialsCategory } from '@/credentials-category/entities/credentials-category.entity';
import { EDoc } from '@/e-docs/entities/e-doc.entity';
import { AssignedCredential } from '@/assigned-credentials/entities/assigned-credential.entity';
import { Credential } from '@/credentials/entities/credential.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { EDocResponse } from '@/e-doc-response/entities/e-doc-response.entity';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';
import { ProviderProfessionalReference } from '@/provider-professional-reference/entities/provider-professional-reference.entity';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import { Notification } from '@/notification/entities/notification.entity';
import { Chat } from '@/chat/entities/chat.entity';
import { Department } from '@/department/entities/department.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { Media } from '@/media/entities/media.entity';
import { Room } from '@/room/entities/room.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { Token } from '@/token/entities/token.entity';
import { UserNotification } from '@/user-notification/entities/user-notification.entity';
import { ChatGateway } from '@/chat/chat.gateway';
import { ChatService } from '@/chat/chat.service';
import { TokenService } from '@/token/token.service';
import { UserNotificationService } from '@/user-notification/user-notification.service';
import { Admin } from '@/admin/entities/admin.entity';
import { FacilityProviderService } from '@/facility-provider/facility-provider.service';
import { FacilityProvider } from '@/facility-provider/entities/facility-provider.entity';
import { CompetencyTestScore } from '@/competency-test-response/entities/competency-test-score.entity';
import { Activity } from '@/activity/entities/activity.entity';
import { CompetencyTestGlobalSetting } from '@/competency-test-setting/entities/competency-test-global-setting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProviderCredential,
      CredentialsCategory,
      EDoc,
      AssignedCredential,
      Credential,
      Provider,
      EDocResponse,
      StatusSetting,
      ProviderProfessionalReference,
      Notification,
      Token,
      UserNotification,
      Chat,
      Media,
      Facility,
      FacilityUser,
      Admin,
      Department,
      Room,
      Shift,
      FacilityProvider,
      CompetencyTestScore,
      Activity,
      CompetencyTestGlobalSetting,
    ]),
  ],
  controllers: [ProviderCredentialsController],
  providers: [
    ProviderCredentialsService,
    NotificationService,
    FirebaseNotificationService,
    TokenService,
    UserNotificationService,
    ChatGateway,
    ChatService,
    FacilityProviderService,
  ],
})
export class ProviderCredentialsModule {}
