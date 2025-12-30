import { Module } from '@nestjs/common';
import { ShiftService } from './shift.service';
import { ShiftController } from './shift.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shift } from './entities/shift.entity';
import { Notification } from '@/notification/entities/notification.entity';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import { TokenService } from '@/token/token.service';
import { UserNotificationService } from '@/user-notification/user-notification.service';
import { Token } from '@/token/entities/token.entity';
import { UserNotification } from '@/user-notification/entities/user-notification.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { ShiftInvitationService } from '@/shift-invitation/shift-invitation.service';
import { ShiftInvitation } from '@/shift-invitation/entities/shift-invitation.entity';
import { ShiftRequestService } from '@/shift-request/shift-request.service';
import { ShiftRequest } from '@/shift-request/entities/shift-request.entity';
import { AutoSchedulingService } from '@/shared/helpers/auto-scheduling';
import { AIService } from '@/shared/helpers/ai-service';
import { AutoSchedulingSettingService } from '@/auto-scheduling-setting/auto-scheduling-setting.service';
import { AutoSchedulingSetting } from '@/auto-scheduling-setting/entities/auto-scheduling-setting.entity';
import { ShiftNotificationService } from '@/shared/helpers/shift-notifications';
import { ProviderService } from '@/provider/provider.service';
import { Provider } from '@/provider/entities/provider.entity';
import { TimeEntryApproval } from '@/time-entry-approval/entities/time-entry-approval.entity';
import { Admin } from '@/admin/entities/admin.entity';
import { TimeEntryApprovalService } from '@/time-entry-approval/time-entry-approval.service';
import { Certificate } from '@/certificate/entities/certificate.entity';
import { Speciality } from '@/speciality/entities/speciality.entity';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { CompetencyTestSetting } from '@/competency-test-setting/entities/competency-test-setting.entity';
import { SkillChecklistTemplate } from '@/skill-checklist-template/entities/skill-checklist-template.entity';
import { ScheduleRequestSetting } from '@/schedule-request-settings/entities/schedule-request-setting.entity';
import { ActivityService } from '@/activity/activity.service';
import { Activity } from '@/activity/entities/activity.entity';
import { CertificateService } from '@/certificate/certificate.service';
import { SpecialityService } from '@/speciality/speciality.service';
import { ShiftCancelReasonService } from '@/shift-cancel-reason/shift-cancel-reason.service';
import { ShiftCancelReason } from '@/shift-cancel-reason/entities/shift-cancel-reason.entity';
import { ProviderCancelledShift } from './entities/provider-cancelled-shift.entity';
import { ChatGateway } from '@/chat/chat.gateway';
import { ChatService } from '@/chat/chat.service';
import { Chat } from '@/chat/entities/chat.entity';
import { Media } from '@/media/entities/media.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { Department } from '@/department/entities/department.entity';
import { Room } from '@/room/entities/room.entity';
import { BullModule } from '@nestjs/bull';
import { DashboardService } from '@/dashboard/dashboard.service';
import { ProviderCredential } from '@/provider-credentials/entities/provider-credential.entity';
import { Credential } from '@/credentials/entities/credential.entity';
import { EmailService } from '@/shared/helpers/send-mail';
import { SkillChecklistModule } from '@/skill-checklist-module/entities/skill-checklist-module.entity';
import { SkillChecklistModuleService } from '@/skill-checklist-module/skill-checklist-module.service';
import { SkillChecklistResponse } from '@/skill-checklist-module/entities/skill-checklist-response.entity';
import { EDocResponse } from '@/e-doc-response/entities/e-doc-response.entity';
import { EDoc } from '@/e-docs/entities/e-doc.entity';
import { SkillChecklistAnswer } from '@/skill-checklist-module/entities/skill-checklist-answers.entity';
import { SkillChecklistQuestionAnswer } from '@/skill-checklist-module/entities/skill-checklist-question-answer.entity';
import { SkillChecklistAnswerModule } from '@/skill-checklist-module/entities/skill-checklist-answer-module.entity';
import { ProviderAnalytics } from '@/provider-analytics/entities/provider-analytics.entity';
import { ProviderNotificationSetting } from '@/user-notification/entities/provider-notification-setting.entity';
import { ProviderAvailability } from '@/provider/entities/provider-availability.entity';
import { TimeLabelSetting } from '@/provider/entities/time-label-setting.entity';
import { ProviderEvaluation } from '@/provider-evaluations/entities/provider-evaluation.entity';
import { FacilityProvider } from '@/facility-provider/entities/facility-provider.entity';
import { Timecard } from '@/timecards/entities/timecard.entity';
import { ProviderLateShift } from './entities/provider-late-shift.entity';
import { ProviderOrientation } from '@/provider-orientation/entities/provider-orientation.entity';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';
import { FacilityProviderService } from '@/facility-provider/facility-provider.service';
import { CompetencyTestScore } from '@/competency-test-response/entities/competency-test-score.entity';
import { CredentialsCategory } from '@/credentials-category/entities/credentials-category.entity';
import { RedisLockService } from '@/shared/queues/redis-lock.service';
import { RateGroup } from '@/rate-groups/entities/rate-group.entity';
import { FacilityHoliday } from '@/facility-holiday/entities/facility-holiday.entity';
import { BranchAppService } from '@/branch-app/branch-app.service';
import { Disbursement } from '@/disbursement/entities/disbursement.entity';
import { ProviderCredentialsService } from '@/provider-credentials/provider-credentials.service';
import { Invoice } from '@/invoices/entities/invoice.entity';
import { AccountingSetting } from '@/facility/entities/accounting-setting.entity';
import { ProviderOrientationService } from '@/provider-orientation/provider-orientation.service';
import { Documents } from '@/documents/entities/documents.entity';
import { VoidShift } from './entities/void-shift.entity';
import { CompetencyTestGlobalSetting } from '@/competency-test-setting/entities/competency-test-global-setting.entity';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'auto-scheduling',
    }),

    TypeOrmModule.forFeature([
      Shift,
      ShiftRequest,
      ShiftInvitation,
      Notification,
      Token,
      ShiftInvitation,
      UserNotification,
      Facility,
      AutoSchedulingSetting,
      Provider,
      TimeEntryApproval,
      Admin,
      Certificate,
      Speciality,
      CompetencyTestSetting,
      SkillChecklistTemplate,
      ScheduleRequestSetting,
      Activity,
      Credential,
      ShiftCancelReason,
      ProviderCancelledShift,
      Chat,
      Media,
      FacilityUser,
      Department,
      Room,
      ProviderCredential,
      SkillChecklistTemplate,
      SkillChecklistModule,
      SkillChecklistResponse,
      EDocResponse,
      EDoc,
      SkillChecklistAnswer,
      SkillChecklistAnswerModule,
      SkillChecklistQuestionAnswer,
      ProviderAnalytics,
      ProviderNotificationSetting,
      ProviderAvailability,
      TimeLabelSetting,
      ProviderEvaluation,
      FacilityProvider,
      Timecard,
      ProviderLateShift,
      ProviderOrientation,
      StatusSetting,
      CompetencyTestScore,
      CredentialsCategory,
      RateGroup,
      FacilityHoliday,
      Disbursement,
      Invoice,
      AccountingSetting,
      Documents,
      VoidShift,
      CompetencyTestGlobalSetting,
    ]),
  ],
  controllers: [ShiftController],
  providers: [
    ShiftService,
    ShiftRequestService,
    ShiftInvitationService,
    NotificationService,
    ChatGateway,
    ChatService,
    FirebaseNotificationService,
    TokenService,
    UserNotificationService,
    AutoSchedulingService,
    AIService,
    AutoSchedulingSettingService,
    ShiftNotificationService,
    ProviderService,
    TimeEntryApprovalService,
    EncryptDecryptService,
    ActivityService,
    CertificateService,
    SpecialityService,
    ShiftCancelReasonService,
    DashboardService,
    EmailService,
    SkillChecklistModuleService,
    FacilityProviderService,
    RedisLockService,
    BranchAppService,
    ProviderCredentialsService,
    ProviderOrientationService,
  ],
})
export class ShiftModule {}
