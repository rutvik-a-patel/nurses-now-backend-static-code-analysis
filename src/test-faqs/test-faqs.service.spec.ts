import { Test, TestingModule } from '@nestjs/testing';
import { TestFaqsService } from './test-faqs.service';
import { TestFaq } from './entities/test-faq.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreateTestFaqDto } from './dto/create-test-faq.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';

describe('TestFaqsService', () => {
  let service: TestFaqsService;
  let testFaqRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestFaqsService,
        {
          provide: getRepositoryToken(TestFaq),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TestFaqsService>(TestFaqsService);
    testFaqRepository = module.get<Repository<TestFaq>>(
      getRepositoryToken(TestFaq),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a new Test FAQs', async () => {
      const createTestFaqDto = new CreateTestFaqDto();
      const mockRejectReason = new TestFaq();
      testFaqRepository.save.mockResolvedValue(mockRejectReason);
      const result = await service.create([createTestFaqDto]);
      expect(testFaqRepository.save).toHaveBeenCalledWith([createTestFaqDto]);
      expect(result).toEqual(mockRejectReason);
    });
  });

  describe('findOne', () => {
    it('should find one test faqs by criteria', async () => {
      const options = { where: { id: '1' } };
      const mockRejectReason = new TestFaq();
      testFaqRepository.findOne.mockResolvedValue(mockRejectReason);
      const result = await service.findOne(options);
      expect(testFaqRepository.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual(mockRejectReason);
    });
  });

  describe('findAll', () => {
    it('should return a list of reject reasons and count', async () => {
      const options = {};
      const mockRejectReasons = [new TestFaq(), new TestFaq()];
      const count = mockRejectReasons.length;
      testFaqRepository.findAndCount.mockResolvedValue([
        mockRejectReasons,
        count,
      ]);
      const result = await service.findAll(options);
      expect(testFaqRepository.findAndCount).toHaveBeenCalledWith(options);
      expect(result).toEqual([mockRejectReasons, count]);
    });
  });

  describe('remove', () => {
    it('should mark a reject reason as deleted', async () => {
      const deleteDto = new DeleteDto();
      const updateResult: any = { affected: 1 };
      testFaqRepository.update.mockResolvedValue(updateResult);

      const result = await service.remove({ id: '1' }, deleteDto);
      expect(testFaqRepository.update).toHaveBeenCalledWith(
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
