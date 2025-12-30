import { Test, TestingModule } from '@nestjs/testing';
import { DnrReasonService } from './dnr-reason.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DnrReason } from './entities/dnr-reason.entity';
import { IsNull, Repository } from 'typeorm';
import { CreateDnrReasonDto } from './dto/create-dnr-reason.dto';
import { UpdateDnrReasonDto } from './dto/update-dnr-reason.dto';
import { DNR_TYPE } from '@/shared/constants/enum';

describe('DnrReasonService', () => {
  let service: DnrReasonService;
  let dnrRepository: any;
  const mockQueryBuilder: any = {
    where: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DnrReasonService,
        {
          provide: getRepositoryToken(DnrReason),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              getOne: jest.fn().mockResolvedValue(new DnrReason()),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<DnrReasonService>(DnrReasonService);
    dnrRepository = module.get<Repository<DnrReason>>(
      getRepositoryToken(DnrReason),
    );
    dnrRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a new dnr reason', async () => {
      const createDnrReasonDto = new CreateDnrReasonDto();
      const dnr = new DnrReason();
      dnrRepository.save.mockResolvedValue(dnr);
      const result = await service.create(createDnrReasonDto);
      expect(dnrRepository.save).toHaveBeenCalledWith(createDnrReasonDto);
      expect(result).toEqual(dnr);
    });
  });

  describe('findOneWhere', () => {
    it('should find one dnr by criteria', async () => {
      const options = { where: { reason: 'CN' } };
      const dnr = new DnrReason();
      dnrRepository.findOne.mockResolvedValue(dnr);
      const result = await service.findOneWhere(options);
      expect(dnrRepository.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual(dnr);
    });
  });

  describe('checkName', () => {
    it('should return dnr data if name exists', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(new DnrReason());
      const result = await service.checkName(
        'CertificateName',
        DNR_TYPE.clinical,
      );
      expect(result).toEqual(new DnrReason());
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'LOWER(dnr.reason) = LOWER(:name) AND dnr.reason_type = :type',
        {
          name: 'CertificateName',
          type: DNR_TYPE.clinical,
        },
      );
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return a list of lob and count', async () => {
      const options = {};
      const dnr = [new DnrReason(), new DnrReason()];
      const count = dnr.length;
      dnrRepository.findAndCount.mockResolvedValue([dnr, count]);
      const result = await service.findAll(options);
      expect(dnrRepository.findAndCount).toHaveBeenCalledWith(options);
      expect(result).toEqual([dnr, count]);
    });
  });

  describe('update', () => {
    it('should update an dnr and return the result', async () => {
      const updateDnrReasonDto = new UpdateDnrReasonDto();
      const id = '1';
      const updateResult = { affected: 1 };

      dnrRepository.update.mockResolvedValue(updateResult);

      const result = await service.updateWhere({ id }, updateDnrReasonDto);
      expect(result).toEqual(updateResult);
    });
  });

  describe('remove', () => {
    it('should mark a dnr as deleted', async () => {
      const deleteDto = { deleted_at_ip: '127.0.0.1' };
      const updateResult: any = { affected: 1 };
      dnrRepository.update.mockResolvedValue(updateResult);

      const result = await service.remove('1', deleteDto);
      expect(dnrRepository.update).toHaveBeenCalledWith(
        { id: '1', deleted_at: IsNull() },
        {
          ...deleteDto,
          deleted_at: expect.any(String),
        },
      );
      expect(result).toEqual({ affected: 1 });
    });
  });
});
