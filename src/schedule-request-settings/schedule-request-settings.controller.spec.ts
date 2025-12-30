import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleRequestSettingsController } from './schedule-request-settings.controller';
import { ScheduleRequestSettingsService } from './schedule-request-settings.service';
import { ScheduleRequestSetting } from './entities/schedule-request-setting.entity';
import { CONSTANT } from '@/shared/constants/message';
import response from '@/shared/response';
import { UpdateScheduleRequestSettingDto } from './dto/update-schedule-request-setting.dto';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('ScheduleRequestSettingsController', () => {
  let controller: ScheduleRequestSettingsController;
  let service: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleRequestSettingsController],
      providers: [
        {
          provide: ScheduleRequestSettingsService,
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

    controller = module.get<ScheduleRequestSettingsController>(
      ScheduleRequestSettingsController,
    );
    service = module.get<ScheduleRequestSettingsService>(
      ScheduleRequestSettingsService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should successfully retrieve dnr', async () => {
      const data = [new ScheduleRequestSetting()];

      service.findAll.mockResolvedValue(data); // Mock service response

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith({
        order: { order: 'ASC' },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Schedule request setting'),
          data: data,
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

  describe('update', () => {
    const updateScheduleRequestSettingDto =
      new UpdateScheduleRequestSettingDto();
    it('should return a bad request if the lob does not exist', async () => {
      const id = '1';
      updateScheduleRequestSettingDto.value = 'Updated Name';

      service.findOneWhere.mockResolvedValue(null);

      const result = await controller.update(
        id,
        updateScheduleRequestSettingDto,
      );

      expect(service.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Schedule request setting'),
          data: {},
        }),
      );
    });

    it('should successfully update the lob', async () => {
      const id = '1';
      updateScheduleRequestSettingDto.value = 'Updated Name';

      service.findOneWhere.mockResolvedValueOnce(new ScheduleRequestSetting());

      service.update.mockResolvedValue({ affected: 1 });

      const result = await controller.update(
        id,
        updateScheduleRequestSettingDto,
      );

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Schedule request setting'),
          data: {},
        }),
      );
    });

    it('should return an error if no records were updated', async () => {
      const id = '1';

      service.findOneWhere.mockResolvedValueOnce(new ScheduleRequestSetting());

      service.update.mockResolvedValue({ affected: 0 });

      const result = await controller.update(
        id,
        updateScheduleRequestSettingDto,
      );

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Schedule request setting'),
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
        updateScheduleRequestSettingDto,
      );

      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
