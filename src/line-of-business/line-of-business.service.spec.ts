import { Test, TestingModule } from '@nestjs/testing';
import { LineOfBusinessService } from './line-of-business.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LineOfBusiness } from './entities/line-of-business.entity';
import { CreateLineOfBusinessDto } from './dto/create-line-of-business.dto';
import { IsNull, Repository } from 'typeorm';
import { UpdateLineOfBusinessDto } from './dto/update-line-of-business.dto';
import { Facility } from '@/facility/entities/facility.entity';

describe('LineOfBusinessService', () => {
  let service: LineOfBusinessService;
  let lobRepository: any;
  const mockQueryBuilder: any = {
    where: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getRawOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LineOfBusinessService,
        {
          provide: getRepositoryToken(LineOfBusiness),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              getOne: jest.fn().mockResolvedValue(new LineOfBusiness()),
              orWhere: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockResolvedValue(new LineOfBusiness()),
            })),
          },
        },
        {
          provide: getRepositoryToken(Facility),
          useValue: {
            countBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LineOfBusinessService>(LineOfBusinessService);
    lobRepository = module.get<Repository<LineOfBusiness>>(
      getRepositoryToken(LineOfBusiness),
    );
    lobRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a new line of business', async () => {
      const createLineOfBusinessDto = new CreateLineOfBusinessDto();
      const lob = new LineOfBusiness();
      lobRepository.save.mockResolvedValue(lob);
      const result = await service.create(createLineOfBusinessDto);
      expect(lobRepository.save).toHaveBeenCalledWith(createLineOfBusinessDto);
      expect(result).toEqual(lob);
    });
  });

  describe('findOneWhere', () => {
    it('should find one lob by criteria', async () => {
      const options = { where: { name: 'CN' } };
      const lob = new LineOfBusiness();
      lobRepository.findOne.mockResolvedValue(lob);
      const result = await service.findOneWhere(options);
      expect(lobRepository.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual(lob);
    });
  });

  describe('checkName', () => {
    it('should return lob data if name exists', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(new LineOfBusiness());
      const result = await service.checkName('CertificateName', 'CRE');
      expect(result).toEqual(new LineOfBusiness());
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'LOWER(lob.name) = LOWER(:name) OR LOWER(lob.work_comp_code) = LOWER(:work_comp_code)',
        {
          name: 'CertificateName',
          work_comp_code: 'CRE',
        },
      );
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return a list of lob and count', async () => {
      const options = {};
      const lob = [new LineOfBusiness(), new LineOfBusiness()];
      const count = lob.length;
      lobRepository.findAndCount.mockResolvedValue([lob, count]);
      const result = await service.findAll(options);
      expect(lobRepository.findAndCount).toHaveBeenCalledWith(options);
      expect(result).toEqual([lob, count]);
    });
  });

  describe('update', () => {
    it('should update an certificate and return the result', async () => {
      const updateCertificateDto = new UpdateLineOfBusinessDto();
      const id = '1';
      const updateResult = { affected: 1 };
      const expectedDto = {
        ...updateCertificateDto,
        updated_at: expect.any(String), // Expect any string for the 'updated_at', or mock Date to control output
      };

      lobRepository.update.mockResolvedValue(updateResult);

      const result = await service.update(id, updateCertificateDto);

      expect(lobRepository.update).toHaveBeenCalledWith(id, expectedDto);
      expect(result).toEqual(updateResult);
    });
  });

  describe('remove', () => {
    it('should mark a certificate as deleted', async () => {
      const deleteDto = { deleted_at_ip: '127.0.0.1' };
      const updateResult: any = { affected: 1 };
      lobRepository.update.mockResolvedValue(updateResult);

      const result = await service.remove('1', deleteDto);
      expect(lobRepository.update).toHaveBeenCalledWith(
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
