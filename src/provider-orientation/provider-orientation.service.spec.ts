import { Test, TestingModule } from '@nestjs/testing';
import { ProviderOrientationService } from './provider-orientation.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProviderOrientation } from './entities/provider-orientation.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import { Documents } from '../documents/entities/documents.entity';
import { FacilityProvider } from '@/facility-provider/entities/facility-provider.entity';
import { Activity } from '@/activity/entities/activity.entity';
import { ShiftRequest } from '@/shift-request/entities/shift-request.entity';

describe('ProviderOrientationService', () => {
  let service: ProviderOrientationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderOrientationService,
        {
          provide: getRepositoryToken(ProviderOrientation),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              addSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
              getMany: jest.fn().mockResolvedValue([]),
              select: jest.fn().mockReturnThis(),
              addOrderBy: jest.fn().mockReturnThis(),
            })),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Shift),
          useValue: {},
        },
        {
          provide: getRepositoryToken(FacilityProvider),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Activity),
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
          provide: getRepositoryToken(ShiftRequest),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ProviderOrientationService>(
      ProviderOrientationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
