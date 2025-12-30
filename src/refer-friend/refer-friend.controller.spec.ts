import { Test, TestingModule } from '@nestjs/testing';
import { ReferFriendController } from './refer-friend.controller';
import { ReferFriendService } from './refer-friend.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReferFriend } from './entities/refer-friend.entity';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';

describe('ReferFriendController', () => {
  let controller: ReferFriendController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReferFriendController],
      providers: [
        ReferFriendService,
        {
          provide: getRepositoryToken(ReferFriend),
          useValue: {
            checkName: jest.fn(),
            create: jest.fn(),
            sendReferralInvitationEmail: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: EncryptDecryptService,
          useValue: {
            encrypt: jest.fn(),
            decrypt: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ReferFriendController>(ReferFriendController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
