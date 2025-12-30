import { Test, TestingModule } from '@nestjs/testing';
import { ProviderAddressController } from './provider-address.controller';
import { ProviderAddressService } from './provider-address.service';
import { City } from '@/city/entities/city.entity';
import { Country } from '@/country/entities/country.entity';
import { State } from '@/state/entities/state.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProviderAddress } from './entities/provider-address.entity';

describe('ProviderAddressController', () => {
  let controller: ProviderAddressController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProviderAddressController],
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
        {
          provide: getRepositoryToken(Country),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(State),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(City),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProviderAddressController>(
      ProviderAddressController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
