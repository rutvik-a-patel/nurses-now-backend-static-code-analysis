import { Test, TestingModule } from '@nestjs/testing';
import { EDocResponseService } from './e-doc-response.service';
import { EDocResponse } from './entities/e-doc-response.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { CreateEDocResponseDto } from './dto/create-e-doc-response.dto';
import { UpdateEDocResponseDto } from './dto/update-e-doc-response.dto';

describe('EDocResponseService', () => {
  let service: EDocResponseService;
  let eDocResponseRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EDocResponseService,
        {
          provide: getRepositoryToken(EDocResponse),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EDocResponseService>(EDocResponseService);
    eDocResponseRepository = module.get<Repository<EDocResponse>>(
      getRepositoryToken(EDocResponse),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createEDocResponseDto = new CreateEDocResponseDto();
    it('should create e-doc response', async () => {
      eDocResponseRepository.save.mockResolvedValue(new EDocResponse());

      const result = await service.create(createEDocResponseDto);
      expect(eDocResponseRepository.save).toHaveBeenCalledWith(
        createEDocResponseDto,
      );
      expect(result).toEqual(new EDocResponse());
    });
  });

  describe('findOneWhere', () => {
    const options: FindOneOptions<EDocResponse> = { where: { id: '1' } };
    it('should find one e-doc response', async () => {
      eDocResponseRepository.findOne.mockResolvedValue(new EDocResponse());

      const result = await service.findOneWhere(options);
      expect(eDocResponseRepository.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual(new EDocResponse());
    });
  });

  describe('updateWhere', () => {
    const options: FindOptionsWhere<EDocResponse> = { id: '1' };
    const updateEDocResponseDto = new UpdateEDocResponseDto();
    it('should update e-doc response', async () => {
      eDocResponseRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateWhere(options, updateEDocResponseDto);
      expect(eDocResponseRepository.update).toHaveBeenCalledWith(
        options,
        updateEDocResponseDto,
      );
      expect(result).toEqual({ affected: 1 });
    });
  });
});
