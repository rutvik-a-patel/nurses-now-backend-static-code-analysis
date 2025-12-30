import { Test, TestingModule } from '@nestjs/testing';
import { BranchAppService } from './branch-app.service';
import { ConfigService } from '@nestjs/config';

describe('BranchAppService', () => {
  let service: BranchAppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BranchAppService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BranchAppService>(BranchAppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
