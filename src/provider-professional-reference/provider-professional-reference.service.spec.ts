import { Test, TestingModule } from '@nestjs/testing';
import { ProviderProfessionalReferenceService } from './provider-professional-reference.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProviderProfessionalReference } from './entities/provider-professional-reference.entity';
import { IsNull, Repository } from 'typeorm';
import { CreateProviderProfessionalReferenceDto } from './dto/create-provider-professional-reference.dto';
import { UpdateProviderProfessionalReferenceDto } from './dto/update-provider-professional-reference.dto';
import { ProfessionalReferenceResponse } from '@/professional-reference-response/entities/professional-reference-response.entity';
import { ReferenceForm } from '@/reference-form-design/entities/reference-form.entity';
import { ReferenceFormDesign } from '@/reference-form-design/entities/reference-form-design.entity';

describe('ProviderProfessionalReferenceService', () => {
  let service: ProviderProfessionalReferenceService;
  let repository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderProfessionalReferenceService,
        {
          provide: getRepositoryToken(ProviderProfessionalReference),
          useValue: {
            findAndCount: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProfessionalReferenceResponse),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ReferenceForm),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ReferenceFormDesign),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProviderProfessionalReferenceService>(
      ProviderProfessionalReferenceService,
    );
    repository = module.get<Repository<ProviderProfessionalReference>>(
      getRepositoryToken(ProviderProfessionalReference),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a new reference', async () => {
      const createProviderProfessionalReferenceDto =
        new CreateProviderProfessionalReferenceDto();
      const data = new ProviderProfessionalReference();
      repository.save.mockResolvedValue(data);
      const result = await service.create(
        createProviderProfessionalReferenceDto,
      );
      expect(repository.save).toHaveBeenCalledWith(
        createProviderProfessionalReferenceDto,
      );
      expect(result).toEqual(data);
    });
  });

  describe('findAll', () => {
    it('should return a list of reference', async () => {
      const options = {};
      const data = [
        new ProviderProfessionalReference(),
        new ProviderProfessionalReference(),
      ];
      const count = data.length;
      repository.findAndCount.mockResolvedValue([data, count]);
      const result = await service.findAll(options);
      expect(repository.findAndCount).toHaveBeenCalledWith(options);
      expect(result).toEqual([data, count]);
    });
  });

  describe('remove', () => {
    it('should mark a reference as deleted', async () => {
      const where = { id: '1', deleted_at: IsNull() };
      const deleteDto = { deleted_at_ip: '127.0.0.1' };
      const updateResult: any = { affected: 1 };
      repository.update.mockResolvedValue(updateResult);

      const result = await service.remove(where, deleteDto);
      expect(repository.update).toHaveBeenCalledWith(where, {
        ...deleteDto,
        deleted_at: expect.any(String),
      });
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('findOneWhere', () => {
    it('should find one lob by criteria', async () => {
      const options = { where: { id: '1' } };
      const data = new ProviderProfessionalReference();
      repository.findOne.mockResolvedValue(data);
      const result = await service.findOneWhere(options);
      expect(repository.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual(data);
    });
  });

  describe('update', () => {
    it('should update an certificate and return the result', async () => {
      const updateProviderProfessionalReferenceDto =
        new UpdateProviderProfessionalReferenceDto();
      const id = '1';
      const updateResult = { affected: 1 };
      const expectedDto = {
        ...updateProviderProfessionalReferenceDto,
        updated_at: expect.any(String), // Expect any string for the 'updated_at', or mock Date to control output
      };

      repository.update.mockResolvedValue(updateResult);

      const result = await service.update(
        id,
        updateProviderProfessionalReferenceDto,
      );

      expect(repository.update).toHaveBeenCalledWith(id, expectedDto);
      expect(result).toEqual(updateResult);
    });
  });
});
