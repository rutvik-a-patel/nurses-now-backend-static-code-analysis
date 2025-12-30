import { Module } from '@nestjs/common';
import { ProviderOrientationService } from './provider-orientation.service';
import { ProviderOrientationController } from './provider-orientation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderOrientation } from './entities/provider-orientation.entity';
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
import { Provider } from '@/provider/entities/provider.entity';
import { Media } from '@/media/entities/media.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { Admin } from '@/admin/entities/admin.entity';
import { Department } from '@/department/entities/department.entity';
import { Room } from '@/room/entities/room.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { Documents } from '../documents/entities/documents.entity';
import { ShiftRequestService } from '@/shift-request/shift-request.service';
import { ShiftRequest } from '@/shift-request/entities/shift-request.entity';
import { ShiftService } from '@/shift/shift.service';
import { DashboardService } from '@/dashboard/dashboard.service';
import { ActivityService } from '@/activity/activity.service';
import { ShiftInvitation } from '@/shift-invitation/entities/shift-invitation.entity';
import { TimeEntryApproval } from '@/time-entry-approval/entities/time-entry-approval.entity';
import { ScheduleRequestSetting } from '@/schedule-request-settings/entities/schedule-request-setting.entity';
import { ProviderCancelledShift } from '@/shift/entities/provider-cancelled-shift.entity';
import { Timecard } from '@/timecards/entities/timecard.entity';
import { ProviderLateShift } from '@/shift/entities/provider-late-shift.entity';
import { ProviderCredential } from '@/provider-credentials/entities/provider-credential.entity';
import { SkillChecklistModule } from '@/skill-checklist-module/entities/skill-checklist-module.entity';
import { SkillChecklistModuleService } from '@/skill-checklist-module/skill-checklist-module.service';
import { Credential } from '@/credentials/entities/credential.entity';
import { EDocResponse } from '@/e-doc-response/entities/e-doc-response.entity';
import { EDoc } from '@/e-docs/entities/e-doc.entity';
import { Activity } from '@/activity/entities/activity.entity';
import { CertificateService } from '@/certificate/certificate.service';
import { SpecialityService } from '@/speciality/speciality.service';
import { ProviderService } from '@/provider/provider.service';
import { ShiftCancelReasonService } from '@/shift-cancel-reason/shift-cancel-reason.service';
import { SkillChecklistTemplate } from '@/skill-checklist-template/entities/skill-checklist-template.entity';
import { SkillChecklistResponse } from '@/skill-checklist-module/entities/skill-checklist-response.entity';
import { SkillChecklistAnswer } from '@/skill-checklist-module/entities/skill-checklist-answers.entity';
import { SkillChecklistAnswerModule } from '@/skill-checklist-module/entities/skill-checklist-answer-module.entity';
import { SkillChecklistQuestionAnswer } from '@/skill-checklist-module/entities/skill-checklist-question-answer.entity';
import { Certificate } from '@/certificate/entities/certificate.entity';
import { Speciality } from '@/speciality/entities/speciality.entity';
import { ProviderAvailability } from '@/provider/entities/provider-availability.entity';
import { CompetencyTestSetting } from '@/competency-test-setting/entities/competency-test-setting.entity';
import { ProviderAnalytics } from '@/provider-analytics/entities/provider-analytics.entity';
import { ProviderNotificationSetting } from '@/user-notification/entities/provider-notification-setting.entity';
import { TimeLabelSetting } from '@/provider/entities/time-label-setting.entity';
import { ProviderEvaluation } from '@/provider-evaluations/entities/provider-evaluation.entity';
import { FacilityProvider } from '@/facility-provider/entities/facility-provider.entity';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';
import { ShiftCancelReason } from '@/shift-cancel-reason/entities/shift-cancel-reason.entity';
import { ShiftNotificationService } from '@/shared/helpers/shift-notifications';
import { AIService } from '@/shared/helpers/ai-service';
import { RateGroup } from '@/rate-groups/entities/rate-group.entity';
import { FacilityHoliday } from '@/facility-holiday/entities/facility-holiday.entity';
import { BranchAppService } from '@/branch-app/branch-app.service';
import { Disbursement } from '@/disbursement/entities/disbursement.entity';
import { Invoice } from '@/invoices/entities/invoice.entity';
import { AccountingSetting } from '@/facility/entities/accounting-setting.entity';
import { VoidShift } from '@/shift/entities/void-shift.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProviderOrientation,
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
      Documents,
      ShiftRequest,
      ShiftInvitation,
      TimeEntryApproval,
      ScheduleRequestSetting,
      ProviderCancelledShift,
      Timecard,
      ProviderLateShift,
      ProviderCredential,
      SkillChecklistModule,
      SkillChecklistTemplate,
      SkillChecklistResponse,
      SkillChecklistAnswer,
      SkillChecklistQuestionAnswer,
      SkillChecklistAnswerModule,
      Credential,
      Certificate,
      Speciality,
      EDocResponse,
      EDoc,
      ProviderAvailability,
      CompetencyTestSetting,
      ProviderAnalytics,
      ProviderNotificationSetting,
      TimeLabelSetting,
      ProviderEvaluation,
      FacilityProvider,
      StatusSetting,
      ShiftCancelReason,
      Activity,
      RateGroup,
      FacilityHoliday,
      Disbursement,
      Invoice,
      AccountingSetting,
      Documents,
      VoidShift,
    ]),
  ],
  controllers: [ProviderOrientationController],
  providers: [
    ProviderOrientationService,
    NotificationService,
    FirebaseNotificationService,
    TokenService,
    UserNotificationService,
    ChatGateway,
    ChatService,
    ShiftRequestService,
    ShiftService,
    DashboardService,
    ActivityService,
    SkillChecklistModuleService,
    CertificateService,
    SpecialityService,
    ProviderService,
    ShiftCancelReasonService,
    ShiftNotificationService,
    AIService,
    BranchAppService,
  ],
})
export class ProviderOrientationModule {}
