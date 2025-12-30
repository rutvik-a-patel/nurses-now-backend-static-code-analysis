import { Test, TestingModule } from '@nestjs/testing';
import { OrientationRejectReasonService } from './orientation-reject-reason.service';

describe('OrientationRejectReasonService', () => {
  let service: OrientationRejectReasonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: OrientationRejectReasonService,
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            remove: jest.fn(),
            update: jest.fn(),
            countBy: jest.fn(),
            getOne: jest.fn(),
            softDelete: jest.fn(),
            getCount: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              addOrderBy: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              offset: jest.fn().mockReturnThis(),
              getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<OrientationRejectReasonService>(
      OrientationRejectReasonService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
