import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from './entities/activity.entity';
import { CertificateService } from '@/certificate/certificate.service';
import { SpecialityService } from '@/speciality/speciality.service';
import { ProviderService } from '@/provider/provider.service';
import { CompetencyTestSetting } from '@/competency-test-setting/entities/competency-test-setting.entity';
import { SkillChecklistTemplate } from '@/skill-checklist-template/entities/skill-checklist-template.entity';
import { Speciality } from '@/speciality/entities/speciality.entity';
import { Certificate } from 'crypto';
import { Provider } from '@/provider/entities/provider.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { ShiftCancelReason } from '@/shift-cancel-reason/entities/shift-cancel-reason.entity';
import { ShiftCancelReasonService } from '@/shift-cancel-reason/shift-cancel-reason.service';
import { Credential } from '@/credentials/entities/credential.entity';
import { EDocResponse } from '@/e-doc-response/entities/e-doc-response.entity';
import { EDoc } from '@/e-docs/entities/e-doc.entity';
import { ProviderAnalytics } from '@/provider-analytics/entities/provider-analytics.entity';
import { ProviderNotificationSetting } from '@/user-notification/entities/provider-notification-setting.entity';
import { ProviderAvailability } from '@/provider/entities/provider-availability.entity';
import { TimeLabelSetting } from '@/provider/entities/time-label-setting.entity';
import { ProviderEvaluation } from '@/provider-evaluations/entities/provider-evaluation.entity';
import { FacilityProvider } from '@/facility-provider/entities/facility-provider.entity';
import { ProviderCancelledShift } from '@/shift/entities/provider-cancelled-shift.entity';
import { ProviderLateShift } from '@/shift/entities/provider-late-shift.entity';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { BranchAppService } from '@/branch-app/branch-app.service';
import { VoidShift } from '@/shift/entities/void-shift.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Activity,
      Certificate,
      Credential,
      Speciality,
      CompetencyTestSetting,
      SkillChecklistTemplate,
      Provider,
      Shift,
      ShiftCancelReason,
      EDocResponse,
      EDoc,
      ProviderAnalytics,
      ProviderNotificationSetting,
      ProviderAvailability,
      TimeLabelSetting,
      ProviderEvaluation,
      FacilityProvider,
      ProviderCancelledShift,
      ProviderLateShift,
      StatusSetting,
      VoidShift,
    ]),
  ],
  controllers: [ActivityController],
  providers: [
    ActivityService,
    CertificateService,
    SpecialityService,
    ProviderService,
    ShiftCancelReasonService,
    EncryptDecryptService,
    BranchAppService,
  ],
})
export class ActivityModule {}
