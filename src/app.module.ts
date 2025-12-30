import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProviderModule } from './provider/provider.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configuration } from '../config/configuration';
import { validationSchema } from '../config/validation';
import { TypeOrmModule } from '@nestjs/typeorm';
import { database } from '../config/database';
import { CertificateModule } from './certificate/certificate.module';
import { SpecialityModule } from './speciality/speciality.module';
import { ProviderAddressModule } from './provider-address/provider-address.module';
import { StatusSettingModule } from './status-setting/status-setting.module';
import { FacilityUserModule } from './facility-user/facility-user.module';
import { RoleModule } from './role/role.module';
import { AdminModule } from './admin/admin.module';
import { SectionModule } from './section/section.module';
import { PermissionModule } from './permission/permission.module';
import { RoleSectionPermissionModule } from './role-section-permission/role-section-permission.module';
import { AuthModule } from './auth/auth.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './shared/helpers/response-interceptor';
import { UnauthorizedExceptionFilter } from './shared/helpers/unauthorized-exception';
import { FacilityModule } from './facility/facility.module';
import { SetIpAddressInterceptor } from './shared/helpers/set-ip-interceptor';
import { SubSectionModule } from './sub-section/sub-section.module';
import { DropdownModule } from './dropdown/dropdown.module';
import { ProviderAcknowledgementModule } from './provider-acknowledgement/provider-acknowledgement.module';
import { UploadModule } from './upload/upload.module';
import { OtpModule } from './otp/otp.module';
import { ProviderGeneralSettingModule } from './provider-general-setting/provider-general-setting.module';
import { ProviderProfileSettingModule } from './provider-profile-setting/provider-profile-setting.module';
import { SkillChecklistTemplateModule } from './skill-checklist-template/skill-checklist-template.module';
import { SkillChecklistModuleModule } from './skill-checklist-module/skill-checklist-module.module';
import { CompetencyTestSettingModule } from './competency-test-setting/competency-test-setting.module';
import { CompetencyTestQuestionModule } from './competency-test-question/competency-test-question.module';
import { CompetencyTestOptionModule } from './competency-test-option/competency-test-option.module';
import { TestFaqsModule } from './test-faqs/test-faqs.module';
import { ProviderEducationHistoryModule } from './provider-education-history/provider-education-history.module';
import { ProviderWorkHistoryModule } from './provider-work-history/provider-work-history.module';
import { ProviderProfessionalReferenceModule } from './provider-professional-reference/provider-professional-reference.module';
import { ShiftCancelReasonModule } from './shift-cancel-reason/shift-cancel-reason.module';
import { ShiftTypeModule } from './shift-type/shift-type.module';
import { CompetencyTestResponseModule } from './competency-test-response/competency-test-response.module';
import { ShiftModule } from './shift/shift.module';
import { FloorDetailModule } from './floor-detail/floor-detail.module';
import { NotificationModule } from './notification/notification.module';
import { UserNotificationModule } from './user-notification/user-notification.module';
import { ShiftInvitationModule } from './shift-invitation/shift-invitation.module';
import { ShiftRequestModule } from './shift-request/shift-request.module';
import { FacilityRejectReasonModule } from './facility-reject-reason/facility-reject-reason.module';
import { ProviderRejectReasonModule } from './provider-reject-reason/provider-reject-reason.module';
import { ProviderSavedFacilityModule } from './provider-saved-facility/provider-saved-facility.module';
import { FacilityShiftSettingModule } from './facility-shift-setting/facility-shift-setting.module';
import { CredentialsCategoryModule } from './credentials-category/credentials-category.module';
import { ProviderCredentialsModule } from './provider-credentials/provider-credentials.module';
import { TimecardRejectReasonModule } from './timecard-reject-reason/timecard-reject-reason.module';
import { FacilityProviderModule } from './facility-provider/facility-provider.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ProviderAnalyticsModule } from './provider-analytics/provider-analytics.module';
import { BadgeSettingModule } from './badge-setting/badge-setting.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { AutoSchedulingSettingModule } from './auto-scheduling-setting/auto-scheduling-setting.module';
import { LineOfBusinessModule } from './line-of-business/line-of-business.module';
import { ReferenceFormDesignModule } from './reference-form-design/reference-form-design.module';
import { ReferenceFormOptionModule } from './reference-form-option/reference-form-option.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerExceptionFilter } from './shared/helpers/throttler-exception';
import { FlagSettingModule } from './flag-setting/flag-setting.module';
import { DnrReasonModule } from './dnr-reason/dnr-reason.module';
import { TimeEntryApprovalModule } from './time-entry-approval/time-entry-approval.module';
import { ScheduleRequestSettingsModule } from './schedule-request-settings/schedule-request-settings.module';
import { FacilityDocumentModule } from './facility-document/facility-document.module';
import { FacilityGeneralSettingModule } from './facility-general-setting/facility-general-setting.module';
import { AdminDocumentModule } from './admin-document/admin-document.module';
import { SiteAccessSettingModule } from './site-access-setting/site-access-setting.module';
import { FacilityProfileSettingModule } from './facility-profile-setting/facility-profile-setting.module';
import { ChatModule } from './chat/chat.module';
import { MediaModule } from './media/media.module';
import { EDocsGroupModule } from './e-docs-group/e-docs-group.module';
import { EDocsModule } from './e-docs/e-docs.module';
import { EDocResponseModule } from './e-doc-response/e-doc-response.module';
import { AssignedCredentialsModule } from './assigned-credentials/assigned-credentials.module';
import { ReferFacilityModule } from './refer-facility/refer-facility.module';
import { DepartmentModule } from './department/department.module';
import { RoomModule } from './room/room.module';
import { ColumnsPreferenceModule } from './columns-preference/columns-preference.module';
import { ShiftNoteModule } from './shift-note/shift-note.module';
import { ActivityModule } from './activity/activity.module';
import { BullModule } from '@nestjs/bull';
import { JobsModule } from './jobs/jobs.module';
import { CredentialsModule } from './credentials/credentials.module';
import { ProfessionalReferenceResponseModule } from './professional-reference-response/professional-reference-response.module';
import { ReferenceFormGlobalSettingModule } from './reference-form-global-setting/reference-form-global-setting.module';
import { ProviderOrientationModule } from './provider-orientation/provider-orientation.module';
import { FacilityNoteModule } from './facility-note/facility-note.module';
import { TagsModule } from './tags/tags.module';
import { ReferFriendModule } from './refer-friend/refer-friend.module';
import { ProviderEvaluationsModule } from './provider-evaluations/provider-evaluations.module';
import { HolidayGroupModule } from './holiday-group/holiday-group.module';
import { FacilityHolidayModule } from './facility-holiday/facility-holiday.module';
import { TimecardsModule } from './timecards/timecards.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { OrientationRejectReasonModule } from './orientation-reject-reason/orientation-reject-reason.module';
import { RateGroupsModule } from './rate-groups/rate-groups.module';
import { ReportsModule } from './reports/reports.module';
import { BranchAppService } from './branch-app/branch-app.service';
import { DisbursementModule } from './disbursement/disbursement.module';
import { DocumentsModule } from './documents/documents.module';
import { CredentialRejectReasonModule } from './credential-reject-reason/credential-reject-reason.module';
import { ProfessionalReferenceRejectReasonModule } from './professional-reference-reject-reason/professional-reference-reject-reason.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${__dirname}/../../config/env/${process.env.NODE_ENV}.env`,
      load: [configuration],
      isGlobal: true,
      validationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...database(configService),
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([{ limit: 0, ttl: 0 }]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST') || 'localhost',
          port: configService.get('REDIS_PORT') || 6379,
          db: configService.get('REDIS_DB') || 0,
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          timeout: 300000,
        },
        settings: {
          stalledInterval: 30000, // Built-in stalled job handling
          maxStalledCount: 2,
          guardInterval: 5000,
          retryProcessDelay: 5000,
        },
      }),
      inject: [ConfigService],
    }),

    BullModule.registerQueue({
      name: 'auto-scheduling',
    }),

    ProviderModule,
    CertificateModule,
    SpecialityModule,
    StatusSettingModule,
    UploadModule,
    OtpModule,
    ProviderAddressModule,
    FacilityUserModule,
    RoleModule,
    AdminModule,
    SectionModule,
    PermissionModule,
    RoleSectionPermissionModule,
    AuthModule,
    FacilityModule,
    SubSectionModule,
    DropdownModule,
    ProviderAcknowledgementModule,
    ProviderGeneralSettingModule,
    ProviderProfileSettingModule,
    SkillChecklistTemplateModule,
    SkillChecklistModuleModule,
    CompetencyTestSettingModule,
    CompetencyTestQuestionModule,
    CompetencyTestOptionModule,
    TestFaqsModule,
    ProviderEducationHistoryModule,
    ProviderWorkHistoryModule,
    ProviderProfessionalReferenceModule,
    ShiftCancelReasonModule,
    ShiftTypeModule,
    CompetencyTestResponseModule,
    ShiftModule,
    FloorDetailModule,
    NotificationModule,
    UserNotificationModule,
    ShiftInvitationModule,
    ShiftRequestModule,
    FacilityRejectReasonModule,
    ProviderRejectReasonModule,
    ProviderSavedFacilityModule,
    FacilityShiftSettingModule,
    CredentialsCategoryModule,
    ProviderCredentialsModule,
    TimecardRejectReasonModule,
    FacilityProviderModule,
    DashboardModule,
    ProviderAnalyticsModule,
    BadgeSettingModule,
    SchedulerModule,
    AutoSchedulingSettingModule,
    LineOfBusinessModule,
    ReferenceFormDesignModule,
    ReferenceFormOptionModule,
    FlagSettingModule,
    DnrReasonModule,
    TimeEntryApprovalModule,
    ScheduleRequestSettingsModule,
    FacilityDocumentModule,
    FacilityGeneralSettingModule,
    AdminDocumentModule,
    SiteAccessSettingModule,
    FacilityProfileSettingModule,
    EDocsGroupModule,
    EDocsModule,
    ChatModule,
    MediaModule,
    EDocResponseModule,
    AssignedCredentialsModule,
    ReferFacilityModule,
    DepartmentModule,
    RoomModule,
    ColumnsPreferenceModule,
    ShiftNoteModule,
    ActivityModule,
    JobsModule,
    CredentialsModule,
    ProfessionalReferenceResponseModule,
    ReferenceFormGlobalSettingModule,
    ProviderOrientationModule,
    FacilityNoteModule,
    TagsModule,
    ReferFriendModule,
    ProviderEvaluationsModule,
    HolidayGroupModule,
    FacilityHolidayModule,
    TimecardsModule,
    InvoicesModule,
    PaymentsModule,
    WebhooksModule,
    OrientationRejectReasonModule,
    RateGroupsModule,
    ReportsModule,
    DisbursementModule,
    DocumentsModule,
    CredentialRejectReasonModule,
    ProfessionalReferenceRejectReasonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_INTERCEPTOR, useClass: SetIpAddressInterceptor },
    {
      provide: APP_FILTER,
      useClass: UnauthorizedExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ThrottlerExceptionFilter,
    },
    BranchAppService,
  ],
})
export class AppModule {}
