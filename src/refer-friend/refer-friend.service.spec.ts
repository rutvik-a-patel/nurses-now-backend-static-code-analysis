import { Test, TestingModule } from '@nestjs/testing';
import { ReferFriendService } from './refer-friend.service';
import { ReferFriend } from './entities/refer-friend.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';

describe('ReferFriendService', () => {
  let service: ReferFriendService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferFriendService,
        {
          provide: getRepositoryToken(ReferFriend),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              getOne: jest.fn(),
              getMany: jest.fn(),
              getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
            })),
            findAndCount: jest.fn().mockResolvedValue([[], 0]),
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

    service = module.get<ReferFriendService>(ReferFriendService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
