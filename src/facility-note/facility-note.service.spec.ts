import { Test, TestingModule } from '@nestjs/testing';
import { FacilityNoteService } from './facility-note.service';

describe('FacilityNoteService', () => {
  let service: FacilityNoteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: FacilityNoteService,
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
            countBy: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              addOrderBy: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              offset: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([]),
              getCount: jest.fn().mockResolvedValue(0),
              getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<FacilityNoteService>(FacilityNoteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
