import { Module } from '@nestjs/common';
import { ShiftRequestService } from './shift-request.service';
import { ShiftRequestController } from './shift-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftRequest } from './entities/shift-request.entity';
import { Token } from '@/token/entities/token.entity';
import { UserNotification } from '@/user-notification/entities/user-notification.entity';
import { Notification } from '@/notification/entities/notification.entity';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import { UserNotificationService } from '@/user-notification/user-notification.service';
import { TokenService } from '@/token/token.service';
import { ShiftService } from '@/shift/shift.service';
import { Shift } from '@/shift/entities/shift.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { ShiftNotificationService } from '@/shared/helpers/shift-notifications';
import { FacilityProviderService } from '@/facility-provider/facility-provider.service';
import { FacilityProvider } from '@/facility-provider/entities/facility-provider.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { ShiftInvitation } from '@/shift-invitation/entities/shift-invitation.entity';
import { TimeEntryApproval } from '@/time-entry-approval/entities/time-entry-approval.entity';
import { Admin } from '@/admin/entities/admin.entity';
import { ScheduleRequestSetting } from '@/schedule-request-settings/entities/schedule-request-setting.entity';
import { ActivityService } from '@/activity/activity.service';
import { Activity } from '@/activity/entities/activity.entity';
import { CertificateService } from '@/certificate/certificate.service';
import { SpecialityService } from '@/speciality/speciality.service';
import { ProviderService } from '@/provider/provider.service';
import { Certificate } from 'crypto';
import { Speciality } from '@/speciality/entities/speciality.entity';
import { CompetencyTestSetting } from '@/competency-test-setting/entities/competency-test-setting.entity';
import { SkillChecklistTemplate } from '@/skill-checklist-template/entities/skill-checklist-template.entity';
import { ShiftCancelReasonService } from '@/shift-cancel-reason/shift-cancel-reason.service';
import { ShiftCancelReason } from '@/shift-cancel-reason/entities/shift-cancel-reason.entity';
import { ProviderCancelledShift } from '@/shift/entities/provider-cancelled-shift.entity';
import { ChatGateway } from '@/chat/chat.gateway';
import { ChatService } from '@/chat/chat.service';
import { Chat } from '@/chat/entities/chat.entity';
import { Department } from '@/department/entities/department.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { Media } from '@/media/entities/media.entity';
import { Room } from '@/room/entities/room.entity';
import { DashboardService } from '@/dashboard/dashboard.service';
import { ProviderCredential } from '@/provider-credentials/entities/provider-credential.entity';
import { Credential } from '@/credentials/entities/credential.entity';
import { SkillChecklistModuleService } from '@/skill-checklist-module/skill-checklist-module.service';
import { SkillChecklistModule } from '@/skill-checklist-module/entities/skill-checklist-module.entity';
import { SkillChecklistResponse } from '@/skill-checklist-module/entities/skill-checklist-response.entity';
import { EDocResponse } from '@/e-doc-response/entities/e-doc-response.entity';
import { EDoc } from '@/e-docs/entities/e-doc.entity';
import { SkillChecklistAnswer } from '@/skill-checklist-module/entities/skill-checklist-answers.entity';
import { SkillChecklistQuestionAnswer } from '@/skill-checklist-module/entities/skill-checklist-question-answer.entity';
import { SkillChecklistAnswerModule } from '@/skill-checklist-module/entities/skill-checklist-answer-module.entity';
import { ProviderAnalytics } from '@/provider-analytics/entities/provider-analytics.entity';
import { ProviderNotificationSetting } from '@/user-notification/entities/provider-notification-setting.entity';
import { ProviderAvailability } from '@/provider/entities/provider-availability.entity';
import { CompetencyTestScore } from '@/competency-test-response/entities/competency-test-score.entity';
import { TimeLabelSetting } from '@/provider/entities/time-label-setting.entity';
import { CredentialsCategory } from '@/credentials-category/entities/credentials-category.entity';
import { ProviderEvaluation } from '@/provider-evaluations/entities/provider-evaluation.entity';
import { Timecard } from '@/timecards/entities/timecard.entity';
import { ProviderLateShift } from '@/shift/entities/provider-late-shift.entity';
import { ProviderOrientation } from '@/provider-orientation/entities/provider-orientation.entity';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { AIService } from '@/shared/helpers/ai-service';
import { RateGroup } from '@/rate-groups/entities/rate-group.entity';
import { FacilityHoliday } from '@/facility-holiday/entities/facility-holiday.entity';
import { BranchAppService } from '@/branch-app/branch-app.service';
import { Disbursement } from '@/disbursement/entities/disbursement.entity';
import { ProviderCredentialsService } from '@/provider-credentials/provider-credentials.service';
import { Invoice } from '@/invoices/entities/invoice.entity';
import { AccountingSetting } from '@/facility/entities/accounting-setting.entity';
import { VoidShift } from '@/shift/entities/void-shift.entity';
import { CompetencyTestGlobalSetting } from '@/competency-test-setting/entities/competency-test-global-setting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShiftRequest,
      Shift,
      ShiftInvitation,
      Facility,
      Notification,
      Token,
      UserNotification,
      FacilityProvider,
      Provider,
      TimeEntryApproval,
      Admin,
      ScheduleRequestSetting,
      Activity,
      Certificate,
      Credential,
      Speciality,
      CompetencyTestSetting,
      SkillChecklistTemplate,
      ShiftCancelReason,
      ProviderCancelledShift,
      Chat,
      Media,
      FacilityUser,
      Department,
      Room,
      ProviderCredential,
      SkillChecklistModule,
      SkillChecklistTemplate,
      SkillChecklistResponse,
      EDocResponse,
      EDoc,
      SkillChecklistAnswer,
      SkillChecklistAnswerModule,
      SkillChecklistQuestionAnswer,
      ProviderAnalytics,
      ProviderNotificationSetting,
      ProviderAvailability,
      CompetencyTestScore,
      TimeLabelSetting,
      CredentialsCategory,
      ProviderEvaluation,
      Timecard,
      ProviderLateShift,
      ProviderOrientation,
      StatusSetting,
      RateGroup,
      FacilityHoliday,
      Disbursement,
      Invoice,
      AccountingSetting,
      VoidShift,
      CompetencyTestGlobalSetting,
    ]),
  ],
  controllers: [ShiftRequestController],
  providers: [
    ShiftRequestService,
    ChatGateway,
    ShiftService,
    NotificationService,
    FirebaseNotificationService,
    UserNotificationService,
    ShiftNotificationService,
    TokenService,
    FacilityProviderService,
    ActivityService,
    CertificateService,
    SpecialityService,
    ProviderService,
    ShiftCancelReasonService,
    ChatService,
    DashboardService,
    SkillChecklistModuleService,
    EncryptDecryptService,
    AIService,
    BranchAppService,
    ProviderCredentialsService,
  ],
})
export class ShiftRequestModule {}
