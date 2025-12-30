import { Test, TestingModule } from '@nestjs/testing';
import { EDocsGroupService } from './e-docs-group.service';
import { EDocsGroup } from './entities/e-docs-group.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  Repository,
  FindOneOptions,
  FindOptionsWhere,
  FindManyOptions,
} from 'typeorm';
import { CreateEDocsGroupDto } from './dto/create-e-docs-group.dto';
import { UpdateEDocsGroupDto } from './dto/update-e-docs-group.dto';
import { EDoc } from '@/e-docs/entities/e-doc.entity';

describe('EDocsGroupService', () => {
  let service: EDocsGroupService;
  let eDocsGroupRepository: any;

  const mockQueryBuilder: any = {
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EDocsGroupService,
        {
          provide: getRepositoryToken(EDocsGroup),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            softRemove: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              getOne: jest.fn().mockReturnThis(),
            })),
          },
        },
        {
          provide: getRepositoryToken(EDoc),
          useValue: {
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EDocsGroupService>(EDocsGroupService);
    eDocsGroupRepository = module.get<Repository<EDocsGroup>>(
      getRepositoryToken(EDocsGroup),
    );
    eDocsGroupRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createEDocsGroupDto = new CreateEDocsGroupDto();
    it('should create e-doc successfully', async () => {
      eDocsGroupRepository.save.mockResolvedValue(new EDocsGroup());

      const result = await service.create(createEDocsGroupDto);
      expect(eDocsGroupRepository.save).toHaveBeenCalledWith(
        createEDocsGroupDto,
      );
      expect(result).toEqual(new EDocsGroup());
    });
  });

  describe('findOneWhere', () => {
    const options: FindOneOptions<EDocsGroup> = { where: { id: '1' } };
    it('should find one e-doc successfully', async () => {
      eDocsGroupRepository.findOne.mockResolvedValue(new EDocsGroup());

      const result = await service.findOneWhere(options);
      expect(eDocsGroupRepository.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual(new EDocsGroup());
    });
  });

  describe('findAll', () => {
    const options: FindManyOptions<EDocsGroup> = { where: { id: '1' } };
    it('should find all e-doc successfully', async () => {
      eDocsGroupRepository.find.mockResolvedValue([new EDocsGroup()]);

      const result = await service.findAll(options);
      expect(eDocsGroupRepository.find).toHaveBeenCalledWith(options);
      expect(result).toEqual([new EDocsGroup()]);
    });
  });

  describe('updateWhere', () => {
    const options: FindOptionsWhere<EDocsGroup> = { id: '1' };
    const updateEDocsGroupDto = new UpdateEDocsGroupDto();
    it('should update e-doc successfully', async () => {
      eDocsGroupRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateWhere(options, updateEDocsGroupDto);
      expect(eDocsGroupRepository.update).toHaveBeenCalledWith(
        options,
        updateEDocsGroupDto,
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('remove', () => {
    const id = '1';
    it('should soft remove e-docs group', async () => {
      jest.spyOn(service, 'findOneWhere').mockResolvedValue(new EDocsGroup());
      eDocsGroupRepository.softRemove.mockResolvedValue({ affected: 1 });

      await service.remove(id);
      expect(service.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
        relations: { document: true },
      });
      expect(eDocsGroupRepository.softRemove).toHaveBeenCalledWith(
        new EDocsGroup(),
      );
    });
  });

  describe('checkName', () => {
    const name = 'test';
    it('should check name is exist or not', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(new EDocsGroup());

      const result = await service.checkName(name);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'LOWER(d.name) = LOWER(:name)',
        { name },
      );
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
      expect(result).toEqual(new EDocsGroup());
    });
  });

  describe('isGroupUsed', () => {
    const id = '1';
    it('should return true if group is used', async () => {
      const countMock = jest.fn().mockResolvedValue(2);
      service['eDocRepository'].count = countMock;
      const result = await service.isGroupUsed(id);
      expect(countMock).toHaveBeenCalledWith({
        where: { document_group: { id } },
      });
      expect(result).toBe(true);
    });
    it('should return false if group is not used', async () => {
      const countMock = jest.fn().mockResolvedValue(0);
      service['eDocRepository'].count = countMock;
      const result = await service.isGroupUsed(id);
      expect(countMock).toHaveBeenCalledWith({
        where: { document_group: { id } },
      });
      expect(result).toBe(false);
    });
  });
});
