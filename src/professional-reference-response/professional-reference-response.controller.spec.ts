import { Test, TestingModule } from '@nestjs/testing';
import { ProfessionalReferenceResponseController } from './professional-reference-response.controller';
import { ProfessionalReferenceResponseService } from './professional-reference-response.service';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { NotificationService } from '@/notification/notification.service';
import { UserNotificationService } from '@/user-notification/user-notification.service';
import { TokenService } from '@/token/token.service';
import { ChatGateway } from '@/chat/chat.gateway';
import { ChatService } from '@/chat/chat.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';

describe('ProfessionalReferenceResponseController', () => {
  let controller: ProfessionalReferenceResponseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfessionalReferenceResponseController],
      providers: [
        {
          provide: ProfessionalReferenceResponseService,
          useValue: {
            createResponse: jest.fn(),
            findReferenceFormDesign: jest.fn(),
            findOneProfessionalReference: jest.fn(),
          },
        },
        {
          provide: EncryptDecryptService,
          useValue: {
            encrypt: jest.fn(),
            decrypt: jest.fn(),
          },
        },
        {
          provide: FirebaseNotificationService,
          useValue: {},
        },
        {
          provide: NotificationService,
          useValue: {},
        },
        {
          provide: UserNotificationService,
          useValue: {},
        },
        {
          provide: TokenService,
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

    controller = module.get<ProfessionalReferenceResponseController>(
      ProfessionalReferenceResponseController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
