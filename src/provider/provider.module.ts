import { Module } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { ProviderController } from './provider.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provider } from './entities/provider.entity';
import { ProviderAvailability } from './entities/provider-availability.entity';
import { ProviderAddressService } from '@/provider-address/provider-address.service';
import { ProviderAddress } from '@/provider-address/entities/provider-address.entity';
import { Country } from '@/country/entities/country.entity';
import { State } from '@/state/entities/state.entity';
import { City } from '@/city/entities/city.entity';
import { ProviderCredentialsService } from '@/provider-credentials/provider-credentials.service';
import { ProviderCredential } from '@/provider-credentials/entities/provider-credential.entity';
import { CredentialsCategory } from '@/credentials-category/entities/credentials-category.entity';
import { CompetencyTestResponseService } from '@/competency-test-response/competency-test-response.service';
import { CompetencyTestOption } from '@/competency-test-option/entities/competency-test-option.entity';
import { CompetencyTestQuestion } from '@/competency-test-question/entities/competency-test-question.entity';
import { CompetencyTestResponse } from '@/competency-test-response/entities/competency-test-response.entity';
import { CompetencyTestScore } from '@/competency-test-response/entities/competency-test-score.entity';
import { CompetencyTestSetting } from '@/competency-test-setting/entities/competency-test-setting.entity';
import { Certificate } from '@/certificate/entities/certificate.entity';
import { Speciality } from '@/speciality/entities/speciality.entity';
import { ProviderWorkHistoryService } from '@/provider-work-history/provider-work-history.service';
import { ProviderEducationHistoryService } from '@/provider-education-history/provider-education-history.service';
import { ProviderProfessionalReferenceService } from '@/provider-professional-reference/provider-professional-reference.service';
import { ProviderWorkHistory } from '@/provider-work-history/entities/provider-work-history.entity';
import { ProviderEducationHistory } from '@/provider-education-history/entities/provider-education-history.entity';
import { ProviderProfessionalReference } from '@/provider-professional-reference/entities/provider-professional-reference.entity';
import { EDocsGroup } from '@/e-docs-group/entities/e-docs-group.entity';
import { EDoc } from '@/e-docs/entities/e-doc.entity';
import { AssignedCredential } from '@/assigned-credentials/entities/assigned-credential.entity';
import { SkillChecklistTemplate } from '@/skill-checklist-template/entities/skill-checklist-template.entity';
import { Credential } from '@/credentials/entities/credential.entity';
import { ReferenceForm } from '@/reference-form-design/entities/reference-form.entity';
import { ReferenceFormDesign } from '@/reference-form-design/entities/reference-form-design.entity';
import { ProfessionalReferenceResponse } from '@/professional-reference-response/entities/professional-reference-response.entity';
import { EDocResponse } from '@/e-doc-response/entities/e-doc-response.entity';
import { ProviderAnalytics } from '@/provider-analytics/entities/provider-analytics.entity';
import { ProviderNotificationSetting } from '@/user-notification/entities/provider-notification-setting.entity';
import { TimeLabelSetting } from './entities/time-label-setting.entity';
import { ProviderEvaluation } from '@/provider-evaluations/entities/provider-evaluation.entity';
import { FacilityProvider } from '@/facility-provider/entities/facility-provider.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { ProviderCancelledShift } from '@/shift/entities/provider-cancelled-shift.entity';
import { ProviderLateShift } from '@/shift/entities/provider-late-shift.entity';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { FacilityProviderService } from '@/facility-provider/facility-provider.service';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import { Notification } from '@/notification/entities/notification.entity';
import { TokenService } from '@/token/token.service';
import { UserNotificationService } from '@/user-notification/user-notification.service';
import { ChatGateway } from '@/chat/chat.gateway';
import { ChatService } from '@/chat/chat.service';
import { Chat } from '@/chat/entities/chat.entity';
import { Token } from '@/token/entities/token.entity';
import { UserNotification } from '@/user-notification/entities/user-notification.entity';
import { Media } from '@/media/entities/media.entity';
import { Department } from '@/department/entities/department.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { Room } from '@/room/entities/room.entity';
import { Admin } from '@/admin/entities/admin.entity';
import { BranchAppService } from '@/branch-app/branch-app.service';
import { Activity } from '@/activity/entities/activity.entity';
import { VoidShift } from '@/shift/entities/void-shift.entity';
import { CompetencyTestGlobalSetting } from '@/competency-test-setting/entities/competency-test-global-setting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Provider,
      ProviderAvailability,
      ProviderAddress,
      City,
      State,
      Country,
      ProviderCredential,
      CredentialsCategory,
      CompetencyTestResponse,
      CompetencyTestSetting,
      CompetencyTestQuestion,
      CompetencyTestScore,
      CompetencyTestOption,
      Certificate,
      Speciality,
      ProviderWorkHistory,
      ProviderEducationHistory,
      ProviderProfessionalReference,
      EDocsGroup,
      EDoc,
      AssignedCredential,
      Credential,
      SkillChecklistTemplate,
      ProfessionalReferenceResponse,
      ReferenceForm,
      ReferenceFormDesign,
      EDocResponse,
      ProviderAnalytics,
      ProviderNotificationSetting,
      TimeLabelSetting,
      ProviderEvaluation,
      FacilityProvider,
      Shift,
      ProviderCancelledShift,
      ProviderLateShift,
      StatusSetting,
      Notification,
      Chat,
      Token,
      UserNotification,
      Media,
      Facility,
      FacilityUser,
      Admin,
      Department,
      Room,
      Activity,
      VoidShift,
      CompetencyTestGlobalSetting,
    ]),
  ],
  controllers: [ProviderController],
  providers: [
    ProviderService,
    ProviderAddressService,
    ProviderCredentialsService,
    CompetencyTestResponseService,
    ProviderWorkHistoryService,
    ProviderEducationHistoryService,
    ProviderProfessionalReferenceService,
    EncryptDecryptService,
    FacilityProviderService,
    NotificationService,
    FirebaseNotificationService,
    UserNotificationService,
    TokenService,
    ChatGateway,
    ChatService,
    BranchAppService,
  ],
})
export class ProviderModule {}
