import { Test, TestingModule } from '@nestjs/testing';
import { TestFaqsController } from './test-faqs.controller';
import { TestFaqsService } from './test-faqs.service';
import { TestFaq } from './entities/test-faq.entity';
import response from '@/shared/response';
import { TestFaqDto } from './dto/create-test-faq.dto';
import { CONSTANT } from '@/shared/constants/message';
import { DEFAULT_STATUS } from '@/shared/constants/enum';

describe('TestFaqsController', () => {
  let controller: TestFaqsController;
  let testFaqsService: any;

  beforeEach(async () => {
    const testFaqsServiceMock = {
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findAll: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestFaqsController],
      providers: [
        {
          provide: TestFaqsService,
          useValue: testFaqsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<TestFaqsController>(TestFaqsController);
    testFaqsService = module.get<TestFaqsService>(TestFaqsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    let createTestFaqDto: TestFaqDto;

    beforeEach(() => {
      createTestFaqDto = new TestFaqDto();
      createTestFaqDto.faqs = [
        { question: 'Test', answer: 'Answer', order: 1 },
      ];
      createTestFaqDto.updated_at_ip = '127.0.0.1';
    });

    it('should create FAQ and delete old ones', async () => {
      // Mock the remove and create methods
      testFaqsService.create = jest.fn().mockResolvedValue(true);

      const result = await controller.create(createTestFaqDto);

      // Check if create is called with the right params
      expect(testFaqsService.create).toHaveBeenCalledWith(
        createTestFaqDto.faqs,
      );

      // Check the response
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Test FAQs Saved'),
          data: {},
        }),
      );
    });

    it('should create FAQ and delete old ones', async () => {
      // Mock the remove and create methods
      createTestFaqDto.delete_faqs = ['1'];
      testFaqsService.remove = jest.fn().mockResolvedValue(true);
      testFaqsService.create = jest.fn().mockResolvedValue(true);

      const result = await controller.create(createTestFaqDto);

      // Check if create is called with the right params
      expect(testFaqsService.create).toHaveBeenCalledWith(
        createTestFaqDto.faqs,
      );

      // Check the response
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Test FAQs Saved'),
          data: {},
        }),
      );
    });

    it('should handle errors during creation', async () => {
      const error = new Error('Database Error');
      testFaqsService.create = jest.fn().mockRejectedValue(error);

      const result = await controller.create(createTestFaqDto);

      // Check the failure response
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findAll', () => {
    it('should successfully retrieve test faq', async () => {
      const mockTestFaq = Array(10).fill(new TestFaq());
      const mockCount = 10;

      testFaqsService.findAll.mockResolvedValue([mockTestFaq, mockCount]); // Mock service response

      const result = await controller.findAll();

      expect(testFaqsService.findAll).toHaveBeenCalledWith({
        where: {
          status: DEFAULT_STATUS.active,
        },
        order: {
          order: 'ASC',
        },
        select: {
          id: true,
          question: true,
          answer: true,
          order: true,
          created_at: true,
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Test FAQs'),
          data: mockTestFaq,
        }),
      );
    });

    it('should return no records found when there are no Test FAQs', async () => {
      testFaqsService.findAll.mockResolvedValue([[], 0]);

      const result = await controller.findAll();
      expect(testFaqsService.findAll).toHaveBeenCalledWith({
        where: {
          status: DEFAULT_STATUS.active,
        },
        order: {
          order: 'ASC',
        },
        select: {
          id: true,
          question: true,
          answer: true,
          order: true,
          created_at: true,
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Test FAQs'),
          data: [],
        }),
      );
    });

    it('should handle errors during the fetch process', async () => {
      const errorMessage = 'Database error';
      testFaqsService.findAll.mockRejectedValue(new Error(errorMessage)); // Simulate an error

      const result = await controller.findAll();

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });
});
