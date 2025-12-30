import { Module } from '@nestjs/common';
import { CompetencyTestResponseService } from './competency-test-response.service';
import { CompetencyTestResponseController } from './competency-test-response.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompetencyTestResponse } from './entities/competency-test-response.entity';
import { CompetencyTestSetting } from '@/competency-test-setting/entities/competency-test-setting.entity';
import { CompetencyTestQuestion } from '@/competency-test-question/entities/competency-test-question.entity';
import { CompetencyTestScore } from './entities/competency-test-score.entity';
import { CompetencyTestOption } from '@/competency-test-option/entities/competency-test-option.entity';
import { CompetencyTestSettingService } from '@/competency-test-setting/competency-test-setting.service';
import { CompetencyTestGlobalSetting } from '@/competency-test-setting/entities/competency-test-global-setting.entity';
import { ProviderService } from '@/provider/provider.service';
import { Provider } from '@/provider/entities/provider.entity';
import { Certificate } from '@/certificate/entities/certificate.entity';
import { Speciality } from '@/speciality/entities/speciality.entity';
import { SkillChecklistTemplate } from '@/skill-checklist-template/entities/skill-checklist-template.entity';
import { ProviderAnalytics } from '@/provider-analytics/entities/provider-analytics.entity';
import { ProviderNotificationSetting } from '@/user-notification/entities/provider-notification-setting.entity';
import { ProviderAvailability } from '@/provider/entities/provider-availability.entity';
import { TimeLabelSetting } from '@/provider/entities/time-label-setting.entity';
import { ProviderEvaluation } from '@/provider-evaluations/entities/provider-evaluation.entity';
import { FacilityProvider } from '@/facility-provider/entities/facility-provider.entity';
import { ProviderCancelledShift } from '@/shift/entities/provider-cancelled-shift.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { ProviderLateShift } from '@/shift/entities/provider-late-shift.entity';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { BranchAppService } from '@/branch-app/branch-app.service';
import { VoidShift } from '@/shift/entities/void-shift.entity';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import { Notification } from '@/notification/entities/notification.entity';
import { TokenService } from '@/token/token.service';
import { UserNotificationService } from '@/user-notification/user-notification.service';
import { ChatGateway } from '@/chat/chat.gateway';
import { Token } from '@/token/entities/token.entity';
import { UserNotification } from '@/user-notification/entities/user-notification.entity';
import { ChatService } from '@/chat/chat.service';
import { Chat } from '@/chat/entities/chat.entity';
import { Media } from '@/media/entities/media.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { Admin } from '@/admin/entities/admin.entity';
import { Department } from '@/department/entities/department.entity';
import { Room } from '@/room/entities/room.entity';
import { Activity } from '@/activity/entities/activity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompetencyTestResponse,
      CompetencyTestSetting,
      CompetencyTestQuestion,
      CompetencyTestScore,
      CompetencyTestOption,
      CompetencyTestGlobalSetting,
      Provider,
      Certificate,
      Speciality,
      SkillChecklistTemplate,
      ProviderAnalytics,
      ProviderNotificationSetting,
      ProviderAvailability,
      TimeLabelSetting,
      ProviderEvaluation,
      FacilityProvider,
      Shift,
      ProviderCancelledShift,
      ProviderLateShift,
      StatusSetting,
      VoidShift,
      CompetencyTestGlobalSetting,
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
      Activity,
    ]),
  ],
  controllers: [CompetencyTestResponseController],
  providers: [
    CompetencyTestResponseService,
    CompetencyTestSettingService,
    ProviderService,
    EncryptDecryptService,
    BranchAppService,
    NotificationService,
    FirebaseNotificationService,
    TokenService,
    UserNotificationService,
    ChatGateway,
    ChatService,
  ],
})
export class CompetencyTestResponseModule {}
