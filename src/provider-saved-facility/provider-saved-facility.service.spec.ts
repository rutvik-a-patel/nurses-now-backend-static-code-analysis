import { Test, TestingModule } from '@nestjs/testing';
import { ProviderSavedFacilityService } from './provider-saved-facility.service';
import { ProviderSavedFacility } from './entities/provider-saved-facility.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreateProviderSavedFacilityDto } from './dto/create-provider-saved-facility.dto';
import { FacilityProvider } from '@/facility-provider/entities/facility-provider.entity';

describe('ProviderSavedFacilityService', () => {
  let service: ProviderSavedFacilityService;
  let providerSavedFacilityRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderSavedFacilityService,
        {
          provide: getRepositoryToken(ProviderSavedFacility),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(FacilityProvider),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ProviderSavedFacilityService>(
      ProviderSavedFacilityService,
    );
    providerSavedFacilityRepository = module.get<
      Repository<ProviderSavedFacility>
    >(getRepositoryToken(ProviderSavedFacility));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a new saved facility', async () => {
      const createProviderSavedFacilityDto =
        new CreateProviderSavedFacilityDto();
      const mockSavedFacility = new ProviderSavedFacility();
      providerSavedFacilityRepository.save.mockResolvedValue(mockSavedFacility);
      const result = await service.create(createProviderSavedFacilityDto);
      expect(providerSavedFacilityRepository.save).toHaveBeenCalledWith(
        createProviderSavedFacilityDto,
      );
      expect(result).toEqual(mockSavedFacility);
    });
  });

  describe('findOneWhere', () => {
    it('should find one saved facility by criteria', async () => {
      const options = { where: { id: '1' } };
      const mockSavedFacility = new ProviderSavedFacility();
      providerSavedFacilityRepository.findOne.mockResolvedValue(
        mockSavedFacility,
      );
      const result = await service.findOneWhere(options);
      expect(providerSavedFacilityRepository.findOne).toHaveBeenCalledWith(
        options,
      );
      expect(result).toEqual(mockSavedFacility);
    });
  });

  describe('findAll', () => {
    it('should return a list of saved facilities and count', async () => {
      const options = {};
      const mockSavedFacilities = [
        new ProviderSavedFacility(),
        new ProviderSavedFacility(),
      ];
      const count = mockSavedFacilities.length;
      providerSavedFacilityRepository.findAndCount.mockResolvedValue([
        mockSavedFacilities,
        count,
      ]);
      const result = await service.findAll(options);
      expect(providerSavedFacilityRepository.findAndCount).toHaveBeenCalledWith(
        options,
      );
      expect(result).toEqual([mockSavedFacilities, count]);
    });
  });

  describe('remove', () => {
    it('should mark a saved facility as deleted', async () => {
      const updateResult: any = { affected: 1 };
      providerSavedFacilityRepository.update.mockResolvedValue(updateResult);

      const result = await service.remove('1');
      expect(providerSavedFacilityRepository.update).toHaveBeenCalledWith(
        { id: '1', deleted_at: IsNull() },
        {
          deleted_at: expect.any(String),
        },
      );
      expect(result).toEqual({ affected: 1 });
    });
  });
});
