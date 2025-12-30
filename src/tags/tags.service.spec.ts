import { Test, TestingModule } from '@nestjs/testing';
import { TagsService } from './tags.service';
import { LineOfBusiness } from '@/line-of-business/entities/line-of-business.entity';

describe('TagsService', () => {
  let service: TagsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TagsService,
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            remove: jest.fn(),
            update: jest.fn(),
            countBy: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              getOne: jest.fn().mockResolvedValue(new LineOfBusiness()),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<TagsService>(TagsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
