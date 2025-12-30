import { Test, TestingModule } from '@nestjs/testing';
import { FacilityProfileSettingController } from './facility-profile-setting.controller';
import { FacilityProfileSettingService } from './facility-profile-setting.service';
import { UpdateFacilityProfileSettingDto } from './dto/update-facility-profile-setting.dto';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { FacilityProfileSetting } from './entities/facility-profile-setting.entity';

describe('FacilityProfileSettingController', () => {
  let controller: FacilityProfileSettingController;
  let service: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacilityProfileSettingController],
      providers: [
        {
          provide: FacilityProfileSettingService,
          useValue: {
            findOneWhere: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FacilityProfileSettingController>(
      FacilityProfileSettingController,
    );
    service = module.get<FacilityProfileSettingService>(
      FacilityProfileSettingService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('update', () => {
    const updateFacilityProfileSettingDto =
      new UpdateFacilityProfileSettingDto();
    it('should return a bad request if the setting does not exist', async () => {
      const id = '1';

      service.findOneWhere.mockResolvedValue(null);

      const result = await controller.update(
        id,
        updateFacilityProfileSettingDto,
      );

      expect(service.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility Profile Setting'),
          data: {},
        }),
      );
    });

    it('should successfully update the setting', async () => {
      const id = '1';

      service.findOneWhere.mockResolvedValueOnce(new FacilityProfileSetting());

      service.update.mockResolvedValue({ affected: 1 });

      const result = await controller.update(
        id,
        updateFacilityProfileSettingDto,
      );

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Facility Profile Setting'),
          data: {},
        }),
      );
    });

    it('should return an error if no records were updated', async () => {
      const id = '1';

      service.findOneWhere.mockResolvedValueOnce(new FacilityProfileSetting());

      service.update.mockResolvedValue({ affected: 0 });

      const result = await controller.update(
        id,
        updateFacilityProfileSettingDto,
      );

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND(
            'Facility Profile Setting',
          ),
          data: {},
        }),
      );
    });

    it('should handle errors during the update process', async () => {
      const id = '1';
      const error = new Error('Unexpected Error');

      service.findOneWhere.mockRejectedValue(error);

      const result = await controller.update(
        id,
        updateFacilityProfileSettingDto,
      );

      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findAll', () => {
    it('should successfully retrieve dnr', async () => {
      const mockData = Array(10).fill(new FacilityProfileSetting());

      service.findAll.mockResolvedValue(mockData); // Mock service response

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith();
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Facility Profile Setting'),
          data: mockData,
        }),
      );
    });

    it('should handle errors during the fetch process', async () => {
      const errorMessage = 'Database error';
      service.findAll.mockRejectedValue(new Error(errorMessage)); // Simulate an error

      const result = await controller.findAll();

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });
});
