import { Test, TestingModule } from '@nestjs/testing';
import { ProviderGeneralSettingService } from './provider-general-setting.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProviderGeneralSettingSection } from './entities/provider-general-setting-section.entity';
import { ProviderGeneralSettingSubSection } from './entities/provider-general-setting-sub-section.entity';
import { Repository } from 'typeorm';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

describe('ProviderGeneralSettingService', () => {
  let service: ProviderGeneralSettingService;
  let providerGeneralSettingSectionRepository: any;
  let providerGeneralSettingSubSectionRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderGeneralSettingService,
        {
          provide: getRepositoryToken(ProviderGeneralSettingSection),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProviderGeneralSettingSubSection),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              addOrderBy: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              offset: jest.fn().mockReturnThis(),
              getManyAndCount: jest
                .fn()
                .mockResolvedValue([
                  [new ProviderGeneralSettingSubSection()],
                  1,
                ]),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<ProviderGeneralSettingService>(
      ProviderGeneralSettingService,
    );
    providerGeneralSettingSectionRepository = module.get<
      Repository<ProviderGeneralSettingSection>
    >(getRepositoryToken(ProviderGeneralSettingSection));
    providerGeneralSettingSubSectionRepository = module.get<
      Repository<ProviderGeneralSettingSubSection>
    >(getRepositoryToken(ProviderGeneralSettingSubSection));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSource', () => {
    it('should successfully create a new Source', async () => {
      const createSourceDto = new CreateSourceDto();
      const source = new ProviderGeneralSettingSubSection();
      providerGeneralSettingSubSectionRepository.save.mockResolvedValue(source);
      const result = await service.createSource(createSourceDto);
      expect(
        providerGeneralSettingSubSectionRepository.save,
      ).toHaveBeenCalledWith(createSourceDto);
      expect(result).toEqual(source);
    });
  });

  describe('findOneSubSection', () => {
    it('should find one sub section', async () => {
      const options = { where: { id: '1' } };
      const sub_section = new ProviderGeneralSettingSubSection();
      providerGeneralSettingSubSectionRepository.findOne.mockResolvedValue(
        sub_section,
      );
      const result = await service.findOneSubSection(options);
      expect(
        providerGeneralSettingSubSectionRepository.findOne,
      ).toHaveBeenCalledWith(options);
      expect(result).toEqual(sub_section);
    });
  });

  describe('findOneSourceName', () => {
    let mockQueryBuilder;
    beforeEach(() => {
      mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
      };

      // Setup mock for createQueryBuilder to return the mock query builder
      providerGeneralSettingSubSectionRepository.createQueryBuilder = jest.fn(
        () => mockQueryBuilder,
      );
    });
    it('should find one sub section', async () => {
      const options = 'Other';
      const sub_section = new ProviderGeneralSettingSubSection();
      mockQueryBuilder.getOne.mockResolvedValue(sub_section);
      const result = await service.findOneSourceName(options);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'LOWER(p.name) = LOWER(:name)',
        {
          name: options,
        },
      );
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
      expect(result).toEqual(sub_section);
    });
  });

  describe('update', () => {
    it('should update an sub section and return the result', async () => {
      const updateSettingDto = new UpdateSettingDto();
      const id = '1';
      const updateResult = { affected: 1 };
      const expectedDto = {
        ...updateSettingDto,
        updated_at: expect.any(String), // Expect any string for the 'updated_at', or mock Date to control output
      };

      providerGeneralSettingSubSectionRepository.update.mockResolvedValue(
        updateResult,
      );

      const result = await service.updateSubSection(id, updateSettingDto);

      expect(
        providerGeneralSettingSubSectionRepository.update,
      ).toHaveBeenCalledWith(id, expectedDto);
      expect(result).toEqual(updateResult);
    });
  });

  describe('findOneSectionWhere', () => {
    it('should find one section', async () => {
      const options = {};
      const section = new ProviderGeneralSettingSection();
      providerGeneralSettingSectionRepository.findOne.mockResolvedValue(
        section,
      );
      const result = await service.findOneSectionWhere(options);
      expect(
        providerGeneralSettingSectionRepository.findOne,
      ).toHaveBeenCalledWith(options);
      expect(result).toEqual(section);
    });
  });

  describe('findAllSectionWhere', () => {
    it('should return a list of section', async () => {
      const options = {};
      const sections = [
        new ProviderGeneralSettingSection(),
        new ProviderGeneralSettingSection(),
      ];
      providerGeneralSettingSectionRepository.find.mockResolvedValue(sections);
      const result = await service.findAllSectionWhere(options);
      expect(providerGeneralSettingSectionRepository.find).toHaveBeenCalledWith(
        options,
      );
      expect(result).toEqual(sections);
    });
  });
});
