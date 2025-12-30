import { Module } from '@nestjs/common';
import { DropdownService } from './dropdown.service';
import { DropdownController } from './dropdown.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificate } from '@/certificate/entities/certificate.entity';
import { Speciality } from '@/speciality/entities/speciality.entity';
import { Country } from '@/country/entities/country.entity';
import { State } from '@/state/entities/state.entity';
import { City } from '@/city/entities/city.entity';
import { FacilityPermission } from '@/facility-user/entities/facility-permission.entity';
import { Role } from '@/role/entities/role.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { ShiftCancelReason } from '@/shift-cancel-reason/entities/shift-cancel-reason.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { FacilityShiftSetting } from '@/facility-shift-setting/entities/facility-shift-setting.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { ShiftType } from '@/shift-type/entities/shift-type.entity';
import { LineOfBusiness } from '@/line-of-business/entities/line-of-business.entity';
import { TimecardRejectReason } from '@/timecard-reject-reason/entities/timecard-reject-reason.entity';
import { CompetencyTestSetting } from '@/competency-test-setting/entities/competency-test-setting.entity';
import { SkillChecklistTemplate } from '@/skill-checklist-template/entities/skill-checklist-template.entity';
import { AIService } from '@/shared/helpers/ai-service';
import { FlagSetting } from '@/flag-setting/entities/flag-setting.entity';
import { DnrReason } from '@/dnr-reason/entities/dnr-reason.entity';
import { EDocsGroup } from '@/e-docs-group/entities/e-docs-group.entity';
import { Admin } from '@/admin/entities/admin.entity';
import { FloorDetail } from '@/floor-detail/entities/floor-detail.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { CredentialsCategory } from '@/credentials-category/entities/credentials-category.entity';
import { StatusSetting } from '@/status-setting/entities/status-setting.entity';
import { Tag } from '@/tags/entities/tags.entity';
import { ProviderRejectReason } from '@/provider-reject-reason/entities/provider-reject-reason.entity';
import { OrientationRejectReason } from '@/orientation-reject-reason/entities/orientation-reject-reason.entity';
import { AdminDocument } from '@/admin-document/entities/admin-document.entity';
import { Documents } from '@/documents/entities/documents.entity';
import { FacilityProvider } from '@/facility-provider/entities/facility-provider.entity';
import { CredentialRejectReason } from '@/credential-reject-reason/entities/credential-reject-reason.entity';
import { ProfessionalReferenceRejectReason } from '@/professional-reference-reject-reason/entities/professional-reference-reject-reason.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Certificate,
      Speciality,
      Country,
      State,
      City,
      FacilityPermission,
      Role,
      Facility,
      FacilityUser,
      FacilityShiftSetting,
      ShiftCancelReason,
      Provider,
      ShiftType,
      LineOfBusiness,
      TimecardRejectReason,
      CompetencyTestSetting,
      SkillChecklistTemplate,
      FlagSetting,
      DnrReason,
      EDocsGroup,
      Admin,
      FloorDetail,
      Shift,
      CredentialsCategory,
      StatusSetting,
      Tag,
      ProviderRejectReason,
      OrientationRejectReason,
      AdminDocument,
      Documents,
      FacilityProvider,
      CredentialRejectReason,
      ProfessionalReferenceRejectReason,
    ]),
  ],
  controllers: [DropdownController],
  providers: [DropdownService, AIService],
})
export class DropdownModule {}
