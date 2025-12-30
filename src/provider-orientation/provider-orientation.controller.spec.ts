import { Test, TestingModule } from '@nestjs/testing';
import { ProviderOrientationController } from './provider-orientation.controller';
import { ProviderOrientationService } from './provider-orientation.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProviderOrientation } from './entities/provider-orientation.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import { Documents } from '../documents/entities/documents.entity';
import { ShiftRequestService } from '@/shift-request/shift-request.service';
import { ShiftService } from '@/shift/shift.service';
import { DashboardService } from '@/dashboard/dashboard.service';
import { ActivityService } from '@/activity/activity.service';
import { SkillChecklistModuleService } from '@/skill-checklist-module/skill-checklist-module.service';
import { CertificateService } from '@/certificate/certificate.service';
import { ProviderService } from '@/provider/provider.service';
import { AIService } from '@/shared/helpers/ai-service';
import { ShiftNotificationService } from '@/shared/helpers/shift-notifications';
import { ShiftCancelReasonService } from '@/shift-cancel-reason/shift-cancel-reason.service';
import { SpecialityService } from '@/speciality/speciality.service';
import { FacilityProvider } from '@/facility-provider/entities/facility-provider.entity';
import { Activity } from '@/activity/entities/activity.entity';
import { ShiftRequest } from '@/shift-request/entities/shift-request.entity';

describe('ProviderOrientationController', () => {
  let controller: ProviderOrientationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProviderOrientationController],
      providers: [
        ProviderOrientationService,
        {
          provide: getRepositoryToken(ProviderOrientation),
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Shift),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Activity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(FacilityProvider),
          useValue: {},
        },
        {
          provide: NotificationService,
          useValue: {},
        },
        {
          provide: FirebaseNotificationService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(Documents),
          useValue: {},
        },
        {
          provide: ShiftRequestService,
          useValue: {},
        },
        {
          provide: ShiftService,
          useValue: {},
        },
        {
          provide: DashboardService,
          useValue: {},
        },
        {
          provide: ActivityService,
          useValue: {},
        },
        {
          provide: SkillChecklistModuleService,
          useValue: {},
        },
        {
          provide: CertificateService,
          useValue: {},
        },
        {
          provide: SpecialityService,
          useValue: {},
        },
        {
          provide: ProviderService,
          useValue: {},
        },
        {
          provide: ShiftCancelReasonService,
          useValue: {},
        },
        {
          provide: ShiftNotificationService,
          useValue: {},
        },
        {
          provide: AIService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(ShiftRequest),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ProviderOrientationController>(
      ProviderOrientationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
