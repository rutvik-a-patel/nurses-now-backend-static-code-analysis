import { Test, TestingModule } from '@nestjs/testing';
import { SubSectionController } from './sub-section.controller';
import { SubSectionService } from './sub-section.service';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { SubSection } from './entities/sub-section.entity';

describe('SubSectionController', () => {
  let controller: SubSectionController;
  let subSectionService: any;

  beforeEach(async () => {
    const subSectionServiceMock = {
      findAll: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubSectionController],
      providers: [
        {
          provide: SubSectionService,
          useValue: subSectionServiceMock,
        },
      ],
    }).compile();

    controller = module.get<SubSectionController>(SubSectionController);
    subSectionService = module.get<SubSectionService>(SubSectionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllSections', () => {
    const id = '1';
    it('should return bad request if record not found', async () => {
      subSectionService.findAll.mockResolvedValue(null);

      const result = await controller.getAllSections(id);
      expect(subSectionService.findAll).toHaveBeenCalledWith({
        where: { section: { id: id } },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Sub Section'),
          data: {},
        }),
      );
    });

    it('should return success message if record found', async () => {
      subSectionService.findAll.mockResolvedValue([new SubSection()]);

      const result = await controller.getAllSections(id);
      expect(subSectionService.findAll).toHaveBeenCalledWith({
        where: { section: { id: id } },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Section'),
          data: [new SubSection()],
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      subSectionService.findAll.mockRejectedValue(error);

      const result = await controller.getAllSections(id);
      expect(subSectionService.findAll).toHaveBeenCalledWith({
        where: { section: { id: id } },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
