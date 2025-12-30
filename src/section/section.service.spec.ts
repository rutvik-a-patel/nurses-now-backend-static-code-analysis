import { Test, TestingModule } from '@nestjs/testing';
import { SectionService } from './section.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Section } from './entities/section.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

describe('SectionService', () => {
  let service: SectionService;
  let sectionRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SectionService,
        {
          provide: getRepositoryToken(Section),
          useValue: {
            findOne: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SectionService>(SectionService);
    sectionRepository = module.get<Repository<Section>>(
      getRepositoryToken(Section),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneWhere', () => {
    const options: FindOneOptions<Section> = { where: { id: '1' } };
    it('should return one section detail', async () => {
      sectionRepository.findOne.mockResolvedValue(new Section());
      const result = await service.findOneWhere(options);
      expect(sectionRepository.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual(new Section());
    });
  });

  describe('findAll', () => {
    const options: FindManyOptions<Section> = { where: { id: '1' } };
    it('should return section list', async () => {
      sectionRepository.findAndCount.mockResolvedValue([[new Section()]]);
      const result = await service.findAll(options);
      expect(sectionRepository.findAndCount).toHaveBeenCalledWith(options);
      expect(result).toEqual([new Section()]);
    });
  });
});
