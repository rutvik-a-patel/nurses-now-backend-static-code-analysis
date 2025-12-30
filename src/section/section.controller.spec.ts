import { Test, TestingModule } from '@nestjs/testing';
import { SectionController } from './section.controller';
import { SectionService } from './section.service';
import { Section } from './entities/section.entity';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';

describe('SectionController', () => {
  let controller: SectionController;
  let sectionService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SectionController],
      providers: [
        {
          provide: SectionService,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SectionController>(SectionController);
    sectionService = module.get<SectionService>(SectionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllSections', () => {
    it('should return section list', async () => {
      sectionService.findAll.mockResolvedValue([new Section()]);
      const result = await controller.getAllSections();
      expect(sectionService.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Section'),
          data: [new Section()],
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      sectionService.findAll.mockRejectedValue(error);

      const result = await controller.getAllSections();
      expect(sectionService.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
