import { Test, TestingModule } from '@nestjs/testing';
import { TimeEntryApprovalService } from './time-entry-approval.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TimeEntryApproval } from './entities/time-entry-approval.entity';
import { Repository } from 'typeorm';
import { UpdateTimeEntryApprovalDto } from './dto/update-time-entry-approval.dto';

describe('TimeEntryApprovalService', () => {
  let service: TimeEntryApprovalService;
  let timeEntryRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeEntryApprovalService,
        {
          provide: getRepositoryToken(TimeEntryApproval),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TimeEntryApprovalService>(TimeEntryApprovalService);
    timeEntryRepository = module.get<Repository<TimeEntryApproval>>(
      getRepositoryToken(TimeEntryApproval),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneWhere', () => {
    it('should find one dnr by criteria', async () => {
      const options = { where: { value: 'CN' } };
      const dnr = new TimeEntryApproval();
      timeEntryRepository.findOne.mockResolvedValue(dnr);
      const result = await service.findOneWhere(options);
      expect(timeEntryRepository.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual(dnr);
    });
  });

  describe('findAll', () => {
    it('should return a list of lob and count', async () => {
      const options = {};
      const dnr = [new TimeEntryApproval(), new TimeEntryApproval()];
      const count = dnr.length;
      timeEntryRepository.find.mockResolvedValue([dnr, count]);
      const result = await service.findAll(options);
      expect(timeEntryRepository.find).toHaveBeenCalledWith(options);
      expect(result).toEqual([dnr, count]);
    });
  });

  describe('update', () => {
    it('should update an dnr and return the result', async () => {
      const updateTimeEntryApprovalDto = new UpdateTimeEntryApprovalDto();
      const id = '1';
      const updateResult = { affected: 1 };

      timeEntryRepository.update.mockResolvedValue(updateResult);

      const result = await service.updateWhere(
        { id },
        updateTimeEntryApprovalDto,
      );
      expect(result).toEqual(updateResult);
    });
  });
});
