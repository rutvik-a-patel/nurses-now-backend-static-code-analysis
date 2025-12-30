import { Test, TestingModule } from '@nestjs/testing';
import { SubSectionService } from './sub-section.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SubSection } from './entities/sub-section.entity';
import { FindManyOptions, Repository } from 'typeorm';

describe('SubSectionService', () => {
  let service: SubSectionService;
  let subSectionRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubSectionService,
        {
          provide: getRepositoryToken(SubSection),
          useValue: {
            findAndCount: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SubSectionService>(SubSectionService);
    subSectionRepository = module.get<Repository<SubSection>>(
      getRepositoryToken(SubSection),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return sub section list', async () => {
      const where: FindManyOptions<SubSection> = { where: { id: '1' } };
      subSectionRepository.findAndCount.mockResolvedValue([
        [new SubSection()],
        1,
      ]);

      const result = await service.findAll(where);
      expect(subSectionRepository.findAndCount).toHaveBeenCalledWith(where);
      expect(result).toEqual([new SubSection()]);
    });
  });
});
