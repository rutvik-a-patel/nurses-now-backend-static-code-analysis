import { Test, TestingModule } from '@nestjs/testing';
import { ReferenceFormGlobalSettingService } from './reference-form-global-setting.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReferenceFormGlobalSetting } from './entities/reference-form-global-setting.entity';
import { ProviderProfessionalReference } from '@/provider-professional-reference/entities/provider-professional-reference.entity';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import { ChatGateway } from '@/chat/chat.gateway';
import { ChatService } from '@/chat/chat.service';
import { TokenService } from '@/token/token.service';
import { UserNotificationService } from '@/user-notification/user-notification.service';
import { Chat } from '@/chat/entities/chat.entity';
import { Department } from '@/department/entities/department.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { Media } from '@/media/entities/media.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { Room } from '@/room/entities/room.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { Token } from '@/token/entities/token.entity';
import { UserNotification } from '@/user-notification/entities/user-notification.entity';
import { Admin } from '@/admin/entities/admin.entity';
import { Notification } from '@/notification/entities/notification.entity';

describe('ReferenceFormGlobalSettingService', () => {
  let service: ReferenceFormGlobalSettingService;
  let _referenceFormGlobalSettingRepository: any;

  beforeEach(async () => {
    const referenceFormGlobalSettingRepositoryMock = {
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      findAndCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferenceFormGlobalSettingService,
        {
          provide: getRepositoryToken(ReferenceFormGlobalSetting),
          useValue: referenceFormGlobalSettingRepositoryMock,
        },
        {
          provide: getRepositoryToken(ProviderProfessionalReference),
          useValue: {
            find: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Notification),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Token),
          useValue: {},
        },
        {
          provide: getRepositoryToken(UserNotification),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Chat),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Provider),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Media),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Facility),
          useValue: {},
        },
        {
          provide: getRepositoryToken(FacilityUser),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Admin),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Department),
          useValue: {},
        },

        {
          provide: getRepositoryToken(Room),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Shift),
          useValue: {},
        },

        {
          provide: EncryptDecryptService,
          useValue: {
            encrypt: jest.fn(),
          },
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
          provide: TokenService,
          useValue: {},
        },
        {
          provide: UserNotificationService,
          useValue: {},
        },
        {
          provide: ChatGateway,
          useValue: {},
        },
        {
          provide: ChatService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ReferenceFormGlobalSettingService>(
      ReferenceFormGlobalSettingService,
    );

    _referenceFormGlobalSettingRepository = module.get(
      getRepositoryToken(ReferenceFormGlobalSetting),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
