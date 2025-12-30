import { Test, TestingModule } from '@nestjs/testing';
import { ReferFacilityService } from './refer-facility.service';
import { ReferFacility } from './entities/refer-facility.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReferFacilityDto } from './dto/create-refer-facility.dto';

describe('ReferFacilityService', () => {
  let service: ReferFacilityService;
  let referFacilityRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferFacilityService,
        {
          provide: getRepositoryToken(ReferFacility),
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReferFacilityService>(ReferFacilityService);
    referFacilityRepository = module.get<Repository<ReferFacility>>(
      getRepositoryToken(ReferFacility),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createReferFacilityDto = new CreateReferFacilityDto();
    it('should create new refer facility entry', async () => {
      referFacilityRepository.save.mockResolvedValue(new ReferFacility());

      const result = await service.create(createReferFacilityDto);
      expect(referFacilityRepository.save).toHaveBeenCalledWith(
        createReferFacilityDto,
      );
      expect(result).toEqual(new ReferFacility());
    });
  });
});
