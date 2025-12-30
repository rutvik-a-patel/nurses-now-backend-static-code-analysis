import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FacilityService } from '@/facility/facility.service';
import { Facility } from '@/facility/entities/facility.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '@/strategy/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { Admin } from '@/admin/entities/admin.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { Token } from '@/token/entities/token.entity';
import { FirebaseService } from '@/shared/helpers/firebase-service';
import { FacilityUserService } from '@/facility-user/facility-user.service';
import { AdminService } from '@/admin/admin.service';
import { ProviderService } from '@/provider/provider.service';
import { Otp } from '@/otp/entities/otp.entity';
import { FacilityUserPermission } from '@/facility-user/entities/facility-user-permission.entity';
import { RoleSectionPermissionService } from '@/role-section-permission/role-section-permission.service';
import { RoleSectionPermission } from '@/role-section-permission/entities/role-section-permission.entity';
import { Section } from '@/section/entities/section.entity';
import { FacilityPermission } from '@/facility-user/entities/facility-permission.entity';
import { TimeEntrySetting } from '@/facility/entities/time-entry-setting.entity';
import { FacilityPortalSetting } from '@/facility/entities/facility-portal-setting.entity';
import { FloorDetail } from '@/floor-detail/entities/floor-detail.entity';
import { Invite } from '@/invite/entities/invite.entity';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { Certificate } from '@/certificate/entities/certificate.entity';
import { Speciality } from '@/speciality/entities/speciality.entity';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';
import { CompetencyTestSetting } from '@/competency-test-setting/entities/competency-test-setting.entity';
import { SkillChecklistTemplate } from '@/skill-checklist-template/entities/skill-checklist-template.entity';
import { ColumnsPreferenceService } from '@/columns-preference/columns-preference.service';
import { ColumnsPreference } from '@/columns-preference/entities/columns-preference.entity';
import { RefreshJwtStrategy } from '@/strategy/refresh-jwt.strategy';
import { ProviderAnalytics } from '@/provider-analytics/entities/provider-analytics.entity';
import { FacilityShiftSetting } from '@/facility-shift-setting/entities/facility-shift-setting.entity';
import { ProviderNotificationSetting } from '@/user-notification/entities/provider-notification-setting.entity';
import { ProviderAvailability } from '@/provider/entities/provider-availability.entity';
import { TimeLabelSetting } from '@/provider/entities/time-label-setting.entity';
import { ProviderEvaluation } from '@/provider-evaluations/entities/provider-evaluation.entity';
import { FacilityProvider } from '@/facility-provider/entities/facility-provider.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { AIService } from '@/shared/helpers/ai-service';
import { AutoSchedulingService } from '@/shared/helpers/auto-scheduling';
import { ShiftInvitationService } from '@/shift-invitation/shift-invitation.service';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import { ShiftService } from '@/shift/shift.service';
import { ShiftInvitation } from '@/shift-invitation/entities/shift-invitation.entity';
import { TimeEntryApproval } from '@/time-entry-approval/entities/time-entry-approval.entity';
import { ScheduleRequestSetting } from '@/schedule-request-settings/entities/schedule-request-setting.entity';
import { ShiftRequest } from '@/shift-request/entities/shift-request.entity';
import { ProviderCancelledShift } from '@/shift/entities/provider-cancelled-shift.entity';
import { ActivityService } from '@/activity/activity.service';
import { DashboardService } from '@/dashboard/dashboard.service';
import { AutoSchedulingSettingService } from '@/auto-scheduling-setting/auto-scheduling-setting.service';
import { Notification } from '@/notification/entities/notification.entity';
import { TokenService } from '@/token/token.service';
import { UserNotificationService } from '@/user-notification/user-notification.service';
import { ChatGateway } from '@/chat/chat.gateway';
import { Activity } from '@/activity/entities/activity.entity';
import { CertificateService } from '@/certificate/certificate.service';
import { SpecialityService } from '@/speciality/speciality.service';
import { ShiftCancelReasonService } from '@/shift-cancel-reason/shift-cancel-reason.service';
import { ProviderCredential } from '@/provider-credentials/entities/provider-credential.entity';
import { SkillChecklistModuleService } from '@/skill-checklist-module/skill-checklist-module.service';
import { Credential } from '@/credentials/entities/credential.entity';
import { EDocResponse } from '@/e-doc-response/entities/e-doc-response.entity';
import { EDoc } from '@/e-docs/entities/e-doc.entity';
import { AutoSchedulingSetting } from '@/auto-scheduling-setting/entities/auto-scheduling-setting.entity';
import { UserNotification } from '@/user-notification/entities/user-notification.entity';
import { ChatService } from '@/chat/chat.service';
import { Chat } from '@/chat/entities/chat.entity';
import { Media } from '@/media/entities/media.entity';
import { Department } from '@/department/entities/department.entity';
import { Room } from '@/room/entities/room.entity';
import { ShiftCancelReason } from '@/shift-cancel-reason/entities/shift-cancel-reason.entity';
import { SkillChecklistResponse } from '@/skill-checklist-module/entities/skill-checklist-response.entity';
import { SkillChecklistAnswer } from '@/skill-checklist-module/entities/skill-checklist-answers.entity';
import { SkillChecklistAnswerModule } from '@/skill-checklist-module/entities/skill-checklist-answer-module.entity';
import { SkillChecklistQuestionAnswer } from '@/skill-checklist-module/entities/skill-checklist-question-answer.entity';
import { Timecard } from '@/timecards/entities/timecard.entity';
import { ProviderLateShift } from '@/shift/entities/provider-late-shift.entity';
import { ProviderOrientation } from '@/provider-orientation/entities/provider-orientation.entity';
import { AccountingSetting } from '@/facility/entities/accounting-setting.entity';
import { SmsService } from '@/shared/helpers/send-sms';
import { BullModule } from '@nestjs/bull';
import { RedisLockService } from '@/shared/queues/redis-lock.service';
import { RateGroup } from '@/rate-groups/entities/rate-group.entity';
import { FacilityHoliday } from '@/facility-holiday/entities/facility-holiday.entity';
import { BranchAppService } from '@/branch-app/branch-app.service';
import { Disbursement } from '@/disbursement/entities/disbursement.entity';
import { ProviderCredentialsService } from '@/provider-credentials/provider-credentials.service';
import { CredentialsCategory } from '@/credentials-category/entities/credentials-category.entity';
import { Invoice } from '@/invoices/entities/invoice.entity';
import { VoidShift } from '@/shift/entities/void-shift.entity';
import { City } from '@/city/entities/city.entity';
import { ReferFriend } from '@/refer-friend/entities/refer-friend.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FacilityUser,
      Admin,
      Provider,
      Facility,
      Token,
      Otp,
      FacilityUserPermission,
      FacilityPermission,
      RoleSectionPermission,
      Section,
      TimeEntrySetting,
      FacilityPortalSetting,
      FloorDetail,
      Invite,
      Certificate,
      Speciality,
      StatusSetting,
      CompetencyTestSetting,
      SkillChecklistTemplate,
      ColumnsPreference,
      ProviderAnalytics,
      FacilityShiftSetting,
      ProviderNotificationSetting,
      ProviderAvailability,
      TimeLabelSetting,
      ProviderEvaluation,
      FacilityProvider,
      Shift,
      ShiftInvitation,
      TimeEntryApproval,
      ScheduleRequestSetting,
      ShiftRequest,
      ProviderCancelledShift,
      Notification,
      Activity,
      ProviderCredential,
      Credential,
      EDoc,
      EDocResponse,
      AutoSchedulingSetting,
      UserNotification,
      Chat,
      Media,
      Department,
      Room,
      ShiftCancelReason,
      SkillChecklistResponse,
      SkillChecklistAnswer,
      SkillChecklistAnswerModule,
      SkillChecklistQuestionAnswer,
      Timecard,
      ProviderLateShift,
      ProviderOrientation,
      AccountingSetting,
      RateGroup,
      FacilityHoliday,
      Disbursement,
      CredentialsCategory,
      Invoice,
      VoidShift,
      City,
      ReferFriend,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '12h' },
    }),
    BullModule.registerQueue({
      name: 'auto-scheduling',
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshJwtStrategy,
    FacilityService,
    FirebaseService,
    FacilityUserService,
    AdminService,
    ProviderService,
    RoleSectionPermissionService,
    EncryptDecryptService,
    ColumnsPreferenceService,
    TokenService,
    ShiftService,
    AIService,
    AutoSchedulingService,
    ShiftInvitationService,
    NotificationService,
    FirebaseNotificationService,
    ActivityService,
    DashboardService,
    AutoSchedulingSettingService,
    UserNotificationService,
    ChatGateway,
    ChatService,
    CertificateService,
    SpecialityService,
    ShiftCancelReasonService,
    SkillChecklistModuleService,
    SmsService,
    RedisLockService,
    BranchAppService,
    ProviderCredentialsService,
  ],
})
export class AuthModule {}
