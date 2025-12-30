import { Test, TestingModule } from '@nestjs/testing';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';

describe('TokenController', () => {
  let controller: TokenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokenController],
      providers: [
        TokenService,
        {
          provide: getRepositoryToken(Token),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TokenController>(TokenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
