import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ShiftService } from '@/shift/shift.service';
import { ShiftInvitationService } from '@/shift-invitation/shift-invitation.service';
import { Facility } from '@/facility/entities/facility.entity';
import { ShiftInvitation } from '@/shift-invitation/entities/shift-invitation.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { UserNotification } from '@/user-notification/entities/user-notification.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '@/token/entities/token.entity';
import { Notification } from '@/notification/entities/notification.entity';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import { UserNotificationService } from '@/user-notification/user-notification.service';
import { TokenService } from '@/token/token.service';
import { AutoSchedulingService } from '@/shared/helpers/auto-scheduling';
import { AIService } from '@/shared/helpers/ai-service';
import { AutoSchedulingSettingService } from '@/auto-scheduling-setting/auto-scheduling-setting.service';
import { AutoSchedulingSetting } from '@/auto-scheduling-setting/entities/auto-scheduling-setting.entity';
import { TimeEntryApproval } from '@/time-entry-approval/entities/time-entry-approval.entity';
import { Admin } from '@/admin/entities/admin.entity';
import { ShiftNotificationService } from '@/shared/helpers/shift-notifications';
import { DistanceMatrixService } from '@/shared/helpers/distance-matrix';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { ScheduleRequestSetting } from '@/schedule-request-settings/entities/schedule-request-setting.entity';
import { Activity } from '@/activity/entities/activity.entity';
import { ActivityService } from '@/activity/activity.service';
import { CertificateService } from '@/certificate/certificate.service';
import { SpecialityService } from '@/speciality/speciality.service';
import { ProviderService } from '@/provider/provider.service';
import { ShiftCancelReasonService } from '@/shift-cancel-reason/shift-cancel-reason.service';
import { CompetencyTestSetting } from '@/competency-test-setting/entities/competency-test-setting.entity';
import { ShiftCancelReason } from '@/shift-cancel-reason/entities/shift-cancel-reason.entity';
import { SkillChecklistTemplate } from '@/skill-checklist-template/entities/skill-checklist-template.entity';
import { Speciality } from '@/speciality/entities/speciality.entity';
import { Certificate } from 'crypto';
import { Provider } from '@/provider/entities/provider.entity';
import { ShiftRequest } from '@/shift-request/entities/shift-request.entity';
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
import { ShiftNotificationLog } from '@/notification/entities/shift-notification-log.entity';
import { Credential } from '@/credentials/entities/credential.entity';
import { SkillChecklistModule } from '@/skill-checklist-module/entities/skill-checklist-module.entity';
import { SkillChecklistModuleService } from '@/skill-checklist-module/skill-checklist-module.service';
import { SkillChecklistResponse } from '@/skill-checklist-module/entities/skill-checklist-response.entity';
import { EDocResponse } from '@/e-doc-response/entities/e-doc-response.entity';
import { EDoc } from '@/e-docs/entities/e-doc.entity';
import { SkillChecklistAnswer } from '@/skill-checklist-module/entities/skill-checklist-answers.entity';
import { SkillChecklistQuestionAnswer } from '@/skill-checklist-module/entities/skill-checklist-question-answer.entity';
import { SkillChecklistAnswerModule } from '@/skill-checklist-module/entities/skill-checklist-answer-module.entity';
import { FacilityNotificationLog } from '@/notification/entities/facility-notification-log.entity';
import { ProviderAnalytics } from '@/provider-analytics/entities/provider-analytics.entity';
import { VoidShift } from '@/shift/entities/void-shift.entity';
import { ProviderNotificationSetting } from '@/user-notification/entities/provider-notification-setting.entity';
import { ProviderAvailability } from '@/provider/entities/provider-availability.entity';
import { TimeLabelSetting } from '@/provider/entities/time-label-setting.entity';
import { ProviderEvaluation } from '@/provider-evaluations/entities/provider-evaluation.entity';
import { FacilityProvider } from '@/facility-provider/entities/facility-provider.entity';
import { Timecard } from '@/timecards/entities/timecard.entity';
import { ProviderLateShift } from '@/shift/entities/provider-late-shift.entity';
import { ProviderOrientation } from '@/provider-orientation/entities/provider-orientation.entity';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';
import { InvoicesService } from '@/invoices/invoices.service';
import { Invoice } from '@/invoices/entities/invoice.entity';
import { InvoiceTimecards } from '@/invoices/entities/invoice-timecards.entity';
import { AccountingSetting } from '@/facility/entities/accounting-setting.entity';
import { BullModule } from '@nestjs/bull';
import { RedisLockService } from '@/shared/queues/redis-lock.service';
import { PaymentInvoice } from '@/payments/entities/payment-invoice.entity';
import { RateGroup } from '@/rate-groups/entities/rate-group.entity';
import { FacilityHoliday } from '@/facility-holiday/entities/facility-holiday.entity';
import { BranchAppService } from '@/branch-app/branch-app.service';
import { Disbursement } from '@/disbursement/entities/disbursement.entity';
import { ProviderCredentialsService } from '@/provider-credentials/provider-credentials.service';
import { CredentialsCategory } from '@/credentials-category/entities/credentials-category.entity';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'auto-scheduling',
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      ShiftInvitation,
      Notification,
      Token,
      Shift,
      Facility,
      UserNotification,
      AutoSchedulingSetting,
      TimeEntryApproval,
      Admin,
      ScheduleRequestSetting,
      Activity,
      Certificate,
      Speciality,
      CompetencyTestSetting,
      SkillChecklistTemplate,
      ScheduleRequestSetting,
      Activity,
      Credential,
      ShiftCancelReason,
      Provider,
      ShiftRequest,
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
      ShiftNotificationLog,
      SkillChecklistAnswer,
      SkillChecklistAnswerModule,
      SkillChecklistQuestionAnswer,
      FacilityNotificationLog,
      ProviderAnalytics,
      VoidShift,
      ProviderNotificationSetting,
      ProviderAvailability,
      TimeLabelSetting,
      ProviderEvaluation,
      FacilityProvider,
      Timecard,
      ProviderLateShift,
      ProviderOrientation,
      StatusSetting,
      Invoice,
      InvoiceTimecards,
      AccountingSetting,
      PaymentInvoice,
      RateGroup,
      FacilityHoliday,
      Disbursement,
      CredentialsCategory,
    ]),
  ],
  providers: [
    SchedulerService,
    ChatGateway,
    ChatService,
    ShiftService,
    NotificationService,
    ShiftInvitationService,
    FirebaseNotificationService,
    UserNotificationService,
    TokenService,
    AutoSchedulingService,
    AIService,
    AutoSchedulingSettingService,
    ShiftNotificationService,
    DistanceMatrixService,
    EncryptDecryptService,
    ActivityService,
    CertificateService,
    SpecialityService,
    ProviderService,
    ShiftCancelReasonService,
    DashboardService,
    SkillChecklistModuleService,
    InvoicesService,
    RedisLockService,
    BranchAppService,
    ProviderCredentialsService,
  ],
})
export class SchedulerModule {}
