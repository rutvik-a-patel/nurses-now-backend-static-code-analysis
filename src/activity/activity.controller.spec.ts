import { Test, TestingModule } from '@nestjs/testing';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { transformAndGroupActivities } from '@/shared/helpers/transform-activity';

// Mock the transform function
jest.mock('@/shared/helpers/transform-activity', () => ({
  transformAndGroupActivities: jest.fn((activities) => [
    {
      date: 'unknown',
      activities: activities,
    },
  ]),
}));

describe('ActivityController', () => {
  let controller: ActivityController;
  let activityService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityController],
      providers: [
        {
          provide: ActivityService,
          useValue: {
            findAllWithFilters: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ActivityController>(ActivityController);
    activityService = module.get<ActivityService>(ActivityService);
    jest.clearAllMocks(); // Clear mocks before each test
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllWithFilters', () => {
    const queryParams: QueryParamsDto = {
      limit: '10',
      offset: '0',
      search: '',
      order: { created_at: 'DESC' },
    };

    it('should return success message with activities list', async () => {
      const mockActivities = [
        {
          id: 1,
          action_by_type: 'user',
          activity_type: 'action',
          facility: 'Jow Facility',
          sub_title: 'Moe User did something.',
          title: 'Moe User performed an action.',
        },
      ];

      const transformedData = [
        {
          date: 'unknown',
          activities: mockActivities,
        },
      ];

      activityService.findAllWithFilters.mockResolvedValue([mockActivities, 1]);
      (transformAndGroupActivities as jest.Mock).mockReturnValue(
        transformedData,
      );

      const result = await controller.findAllWithFilters(queryParams);

      expect(transformAndGroupActivities).toHaveBeenCalledWith(mockActivities);
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Activity'),
          data: transformedData,
          total: 1,
          limit: +queryParams.limit,
          offset: +queryParams.offset,
        }),
      );
    });

    it('should return not found if there are no records', async () => {
      const emptyTransformedData = [];
      activityService.findAllWithFilters.mockResolvedValue([[], 0]);
      (transformAndGroupActivities as jest.Mock).mockReturnValue(
        emptyTransformedData,
      );

      const result = await controller.findAllWithFilters(queryParams);

      expect(transformAndGroupActivities).toHaveBeenCalledWith([]);
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Activity'),
          data: emptyTransformedData,
          total: 0,
          limit: +queryParams.limit,
          offset: +queryParams.offset,
        }),
      );
    });

    it('should handle failure case while processing', async () => {
      const error = new Error('error');
      activityService.findAllWithFilters.mockRejectedValue(error);

      const result = await controller.findAllWithFilters(queryParams);
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
