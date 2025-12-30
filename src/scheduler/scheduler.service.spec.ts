jest.mock('@/shared/helpers/send-email-helper', () => ({
  __esModule: true, // This helps Jest understand that the module is an ES module
  default: jest.fn().mockResolvedValue(true), // Mocking the default export as a function
}));

import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerService } from './scheduler.service';
import { ShiftInvitationService } from '@/shift-invitation/shift-invitation.service';
import { AIService } from '@/shared/helpers/ai-service';
import { AutoSchedulingSettingService } from '@/auto-scheduling-setting/auto-scheduling-setting.service';
import { AutoSchedulingService } from '@/shared/helpers/auto-scheduling';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Shift } from '@/shift/entities/shift.entity';
import { ShiftNotificationService } from '@/shared/helpers/shift-notifications';
import { DistanceMatrixService } from '@/shared/helpers/distance-matrix';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { Activity } from '@/activity/entities/activity.entity';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import { Admin } from '@/admin/entities/admin.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { ShiftNotificationLog } from '@/notification/entities/shift-notification-log.entity';
import { ShiftService } from '@/shift/shift.service';
import { FacilityNotificationLog } from '@/notification/entities/facility-notification-log.entity';
import { VoidShift } from '@/shift/entities/void-shift.entity';
import { InvoicesService } from '@/invoices/invoices.service';
import { ProviderOrientation } from '@/provider-orientation/entities/provider-orientation.entity';

jest.mock('@/shared/helpers/logger');
jest.mock('@/shared/helpers/send-email-helper');

describe('SchedulerService', () => {
  let service: SchedulerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulerService,
        {
          provide: getRepositoryToken(Shift),
          useValue: {
            find: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Provider),
          useValue: {
            createQueryBuilder: jest.fn(),
            leftJoinAndSelect: jest.fn(),
            leftJoin: jest.fn(),
            where: jest.fn(),
            andWhere: jest.fn(),
            getMany: jest.fn(),
            orderBy: jest.fn(),
            setParameters: jest.fn(),
            getRawMany: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(FacilityNotificationLog),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ShiftNotificationLog),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Activity),
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(VoidShift),
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: ShiftInvitationService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: ShiftService,
          useValue: {
            getProviderShiftsWithinRadius: jest.fn(),
          },
        },
        {
          provide: AIService,
          useValue: {
            getAIRecommendations: jest.fn(),
          },
        },
        {
          provide: AutoSchedulingSettingService,
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: AutoSchedulingService,
          useValue: {
            filterProviderList: jest.fn(),
            runAutoScheduling: jest.fn(),
          },
        },
        {
          provide: ShiftNotificationService,
          useValue: {
            sendNotification: jest.fn(),
          },
        },
        {
          provide: DistanceMatrixService,
          useValue: {
            getDistanceAndETA: jest.fn(),
          },
        },
        {
          provide: EncryptDecryptService,
          useValue: {
            encrypt: jest.fn(),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            encrypt: jest.fn(),
          },
        },
        {
          provide: FirebaseNotificationService,
          useValue: {
            encrypt: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Admin),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Facility),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(FacilityUser),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: InvoicesService,
          useValue: {
            generateInvoiceForFacility: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProviderOrientation),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<SchedulerService>(SchedulerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
