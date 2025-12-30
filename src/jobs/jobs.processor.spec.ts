import { Test, TestingModule } from '@nestjs/testing';
import { JobsProcessor } from './jobs.processor';
import { AutoSchedulingService } from '@/shared/helpers/auto-scheduling';
import { ShiftService } from '@/shift/shift.service';
import { ShiftInvitationService } from '@/shift-invitation/shift-invitation.service';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';

const mockAutoSchedulingService = {
  // Add mock methods as needed
  autoSchedule: jest.fn(),
};

describe('JobsProcessor', () => {
  let provider: JobsProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsProcessor,
        {
          provide: AutoSchedulingService,
          useValue: mockAutoSchedulingService,
        },
        {
          provide: ShiftService,
          useValue: {},
        },
        {
          provide: ShiftInvitationService,
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
      ],
    }).compile();

    provider = module.get<JobsProcessor>(JobsProcessor);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
