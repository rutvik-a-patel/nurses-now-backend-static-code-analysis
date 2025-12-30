import { Test, TestingModule } from '@nestjs/testing';
import { ProviderAddressService } from './provider-address.service';
import { ProviderAddress } from './entities/provider-address.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProviderAddressDto } from './dto/create-provider-address.dto';
import { UpdateProviderAddressDto } from './dto/update-provider-address.dto';

describe('ProviderAddressService', () => {
  let service: ProviderAddressService;
  let providerAddressRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderAddressService,
        {
          provide: getRepositoryToken(ProviderAddress),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProviderAddressService>(ProviderAddressService);
    providerAddressRepository = module.get<Repository<ProviderAddress>>(
      getRepositoryToken(ProviderAddress),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a new timecard reject reason', async () => {
      const createProviderAddressDto = new CreateProviderAddressDto();
      const mockAddress = new ProviderAddress();
      providerAddressRepository.save.mockResolvedValue(mockAddress);

      const result = await service.create(createProviderAddressDto);
      expect(providerAddressRepository.save).toHaveBeenCalledWith({
        ...createProviderAddressDto,
      });
      expect(result).toEqual(mockAddress);
    });
  });

  describe('update', () => {
    it('should update an reject reason and return the result', async () => {
      const updateProviderAddressDto = new UpdateProviderAddressDto();
      const where: any = { id: '1' };
      const updateResult = { affected: 1 };
      const expectedDto = {
        ...updateProviderAddressDto, // Expect any string for the 'updated_at', or mock Date to control output
      };

      providerAddressRepository.update.mockResolvedValue(updateResult);

      const result = await service.updateWhere(where, updateProviderAddressDto);

      expect(providerAddressRepository.update).toHaveBeenCalledWith(
        where,
        expectedDto,
      );
      expect(result).toEqual(updateResult);
    });
  });

  describe('findOneWhere', () => {
    it('should find one reject reason by criteria', async () => {
      const options = { where: { id: '1' } };
      const mockAddress = new ProviderAddress();
      providerAddressRepository.findOne.mockResolvedValue(mockAddress);
      const result = await service.findOneWhere(options);
      expect(providerAddressRepository.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual(mockAddress);
    });
  });
});
