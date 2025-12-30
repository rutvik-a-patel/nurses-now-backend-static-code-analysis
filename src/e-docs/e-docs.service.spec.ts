import { Test, TestingModule } from '@nestjs/testing';
import { EDocsService } from './e-docs.service';
import { EDoc } from './entities/e-doc.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindOneOptions, FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { CreateEDocDto } from './dto/create-e-doc.dto';
import { UpdateEDocDto } from './dto/update-e-doc.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { EDocResponse } from '@/e-doc-response/entities/e-doc-response.entity';

describe('EDocsService', () => {
  let service: EDocsService;
  let eDocRepository: any;

  const mockQueryBuilder: any = {
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EDocsService,
        {
          provide: getRepositoryToken(EDoc),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              getOne: jest.fn().mockReturnThis(),
            })),
          },
        },
        {
          provide: getRepositoryToken(EDocResponse),
          useValue: {
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EDocsService>(EDocsService);
    eDocRepository = module.get<Repository<EDoc>>(getRepositoryToken(EDoc));
    eDocRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createEDocDto = new CreateEDocDto();
    it('should create e-doc successfully', async () => {
      eDocRepository.save.mockResolvedValue(new EDoc());

      const result = await service.create(createEDocDto);
      expect(eDocRepository.save).toHaveBeenCalledWith(createEDocDto);
      expect(result).toEqual(new EDoc());
    });
  });

  describe('findOneWhere', () => {
    const options: FindOneOptions<EDoc> = { where: { id: '1' } };
    it('should find one e-doc successfully', async () => {
      eDocRepository.findOne.mockResolvedValue(new EDoc());

      const result = await service.findOneWhere(options);
      expect(eDocRepository.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual(new EDoc());
    });
  });

  describe('updateWhere', () => {
    const options: FindOptionsWhere<EDoc> = { id: '1' };
    const updateEDocDto = new UpdateEDocDto();
    it('should update e-doc successfully', async () => {
      eDocRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateWhere(options, updateEDocDto);
      expect(eDocRepository.update).toHaveBeenCalledWith(
        options,
        updateEDocDto,
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('remove', () => {
    const id = '1';
    const deleteDto = new DeleteDto();
    it('should remove e-doc', async () => {
      eDocRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.remove(id, deleteDto);
      expect(eDocRepository.update).toHaveBeenCalledWith(
        { id: id, deleted_at: IsNull() },
        expect.objectContaining({
          deleted_at_ip: deleteDto.deleted_at_ip,
          deleted_at: expect.any(String),
        }),
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('checkName', () => {
    const name = 'test';
    const groupId = '1';
    it('should check name is exist or not', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(new EDoc());

      const result = await service.checkName(name, groupId);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'LOWER(d.name) = LOWER(:name) AND d.document_group_id = :groupId',
        { name, groupId },
      );
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
      expect(result).toEqual(new EDoc());
    });
  });

  describe('isEDocUsed', () => {
    const id = '1';
    it('should return true if e-doc is used', async () => {
      const countMock = jest.fn().mockResolvedValue(2);
      Object.defineProperty(service, 'eDocResponseRepository', {
        value: { count: countMock },
        writable: true,
      });
      const result = await service.isEDocUsed(id);
      expect(countMock).toHaveBeenCalledWith({
        where: { e_doc: { id } },
      });
      expect(result).toBe(true);
    });
    it('should return false if e-doc is not used', async () => {
      const countMock = jest.fn().mockResolvedValue(0);
      Object.defineProperty(service, 'eDocResponseRepository', {
        value: { count: countMock },
        writable: true,
      });
      const result = await service.isEDocUsed(id);
      expect(countMock).toHaveBeenCalledWith({
        where: { e_doc: { id } },
      });
      expect(result).toBe(false);
    });
  });
});
