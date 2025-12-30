import { Test, TestingModule } from '@nestjs/testing';
import { FacilityGeneralSettingController } from './facility-general-setting.controller';
import { FacilityGeneralSettingService } from './facility-general-setting.service';
import { FacilityGeneralSetting } from './entities/facility-general-setting.entity';
import { FACILITY_GENERAL_SETTING_TYPE } from '@/shared/constants/enum';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { UpdateFacilityGeneralSettingDto } from './dto/update-facility-general-setting.dto';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('FacilityGeneralSettingController', () => {
  let controller: FacilityGeneralSettingController;
  let service: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacilityGeneralSettingController],
      providers: [
        {
          provide: FacilityGeneralSettingService,
          useValue: {
            findOneWhere: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: AccessControlGuard,
          useValue: {
            canActivate: jest.fn(() => true),
          },
        },
      ],
    })
      .overrideGuard(AccessControlGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<FacilityGeneralSettingController>(
      FacilityGeneralSettingController,
    );
    service = module.get<FacilityGeneralSettingService>(
      FacilityGeneralSettingService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should successfully retrieve setting', async () => {
      const setting = [new FacilityGeneralSetting()];

      service.findAll.mockResolvedValue(setting); // Mock service response

      const result = await controller.findAll(
        FACILITY_GENERAL_SETTING_TYPE.schedule,
      );

      expect(service.findAll).toHaveBeenCalledWith({
        where: { type: FACILITY_GENERAL_SETTING_TYPE.schedule },
        order: { created_at: 'ASC' },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Facility General Settings'),
          data: setting,
        }),
      );
    });

    it('should handle errors during the fetch process', async () => {
      const errorMessage = 'Database error';
      service.findAll.mockRejectedValue(new Error(errorMessage)); // Simulate an error

      const result = await controller.findAll(
        FACILITY_GENERAL_SETTING_TYPE.schedule,
      );

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('update', () => {
    const updateFacilityGeneralSettingDto =
      new UpdateFacilityGeneralSettingDto();
    it('should return a bad request if the setting does not exist', async () => {
      const id = '1';
      updateFacilityGeneralSettingDto.is_active = true;

      service.findOneWhere.mockResolvedValue(null);

      const result = await controller.update(
        id,
        updateFacilityGeneralSettingDto,
      );

      expect(service.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility General Settings'),
          data: null,
        }),
      );
    });

    it('should successfully update the setting', async () => {
      const id = '1';
      updateFacilityGeneralSettingDto.is_active = true;

      service.findOneWhere.mockResolvedValueOnce(new FacilityGeneralSetting());

      service.update.mockResolvedValue({ affected: 1 });

      const result = await controller.update(
        id,
        updateFacilityGeneralSettingDto,
      );

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Facility General Settings'),
          data: {},
        }),
      );
    });

    it('should return an error if no records were updated', async () => {
      const id = '1';

      service.findOneWhere.mockResolvedValueOnce(new FacilityGeneralSetting());

      service.update.mockResolvedValue({ affected: 0 });

      const result = await controller.update(
        id,
        updateFacilityGeneralSettingDto,
      );

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility General Settings'),
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
        updateFacilityGeneralSettingDto,
      );

      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
