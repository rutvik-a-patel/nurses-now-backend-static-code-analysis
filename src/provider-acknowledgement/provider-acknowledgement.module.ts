import { Module } from '@nestjs/common';
import { ProviderAcknowledgementService } from './provider-acknowledgement.service';
import { ProviderAcknowledgementController } from './provider-acknowledgement.controller';
import { ProviderService } from '@/provider/provider.service';
import { Provider } from '@/provider/entities/provider.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubAcknowledgement } from './entities/sub-acknowledgement.entity';
import { ProviderAcknowledgement } from './entities/provider-acknowledgement.entity';
import { Certificate } from '@/certificate/entities/certificate.entity';
import { Speciality } from '@/speciality/entities/speciality.entity';
import { CompetencyTestSetting } from '@/competency-test-setting/entities/competency-test-setting.entity';
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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Provider,
      SubAcknowledgement,
      ProviderAcknowledgement,
      Certificate,
      Speciality,
      CompetencyTestSetting,
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
    ]),
  ],
  controllers: [ProviderAcknowledgementController],
  providers: [
    ProviderAcknowledgementService,
    ProviderService,
    EncryptDecryptService,
    BranchAppService,
  ],
})
export class ProviderAcknowledgementModule {}
