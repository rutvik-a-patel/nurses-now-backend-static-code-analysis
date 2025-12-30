import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { IsNull, Repository } from 'typeorm';
import { CONSTANT } from '@/shared/constants/message';

describe('TokenService', () => {
  let service: TokenService;
  let mockTokenRepository: any;
  const mockQueryBuilder: any = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: getRepositoryToken(Token),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              getRawMany: jest.fn().mockResolvedValue([new Token()]),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    mockTokenRepository = module.get<Repository<Token>>(
      getRepositoryToken(Token),
    );
    mockTokenRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFirebaseToken', () => {
    it('should return firebase token', async () => {
      const where = { provider: { id: '1' } };
      const table = 'provider';
      mockQueryBuilder.getRawMany.mockResolvedValue([new Token()]);
      const result = await service.getFirebaseToken(where, table);
      expect(result).toEqual([new Token()]);
    });
  });

  describe('deleteTokenWhere', () => {
    const where = { provider: { id: '1' } };
    const ip = '127.0.0.1';
    const reason = 'User request';
    const time = expect.any(String);
    it('should update the token with the correct values', async () => {
      const expectedUpdateArgs = [
        {
          ...where,
          deleted_at: IsNull(),
        },
        {
          jwt: CONSTANT.SUCCESS.LOGOUT + ` (${reason})`,
          logout_at: time,
          deleted_at_ip: ip,
          deleted_at: time,
        },
      ];

      const mockUpdateResult = { affected: 1 }; // Adjust this mock result based on the actual return type
      mockTokenRepository.update.mockResolvedValue(mockUpdateResult);

      const result = await service.deleteTokenWhere(where, ip, reason);

      expect(result).toEqual(mockUpdateResult);
      expect(mockTokenRepository.update).toHaveBeenCalledWith(
        expectedUpdateArgs[0],
        expect.objectContaining({
          jwt: CONSTANT.SUCCESS.LOGOUT + ` (${reason})`,
          logout_at: expect.any(String),
          deleted_at_ip: ip,
          deleted_at: expect.any(String),
        }),
      );
    });

    it('should update the token with the correct values without reason', async () => {
      const expectedUpdateArgs = [
        {
          ...where,
          deleted_at: IsNull(),
        },
        {
          jwt: CONSTANT.SUCCESS.LOGOUT,
          logout_at: time,
          deleted_at_ip: ip,
          deleted_at: time,
        },
      ];

      const mockUpdateResult = { affected: 1 }; // Adjust this mock result based on the actual return type
      mockTokenRepository.update.mockResolvedValue(mockUpdateResult);

      const result = await service.deleteTokenWhere(where, ip);

      expect(result).toEqual(mockUpdateResult);
      expect(mockTokenRepository.update).toHaveBeenCalledWith(
        expectedUpdateArgs[0],
        expect.objectContaining({
          jwt: CONSTANT.SUCCESS.LOGOUT,
          logout_at: expect.any(String),
          deleted_at_ip: ip,
          deleted_at: expect.any(String),
        }),
      );
    });
  });
});
