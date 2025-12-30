import { Test, TestingModule } from '@nestjs/testing';
import { AutoSchedulingSettingController } from './auto-scheduling-setting.controller';
import { AutoSchedulingSettingService } from './auto-scheduling-setting.service';
import { AutoSchedulingSetting } from './entities/auto-scheduling-setting.entity';
import { CONSTANT } from '@/shared/constants/message';
import response from '@/shared/response';
import { UpdateAutoSchedulingSettingDto } from './dto/update-auto-scheduling-setting.dto';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('AutoSchedulingSettingController', () => {
  let controller: AutoSchedulingSettingController;
  let service: any;

  beforeEach(async () => {
    const serviceMock = {
      find: jest.fn(),
      update: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AutoSchedulingSettingController],
      providers: [
        {
          provide: AutoSchedulingSettingService,
          useValue: serviceMock,
        },
        {
          provide: AccessControlGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
      ],
    })
      .overrideGuard(AccessControlGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<AutoSchedulingSettingController>(
      AutoSchedulingSettingController,
    );
    controller = module.get<AutoSchedulingSettingController>(
      AutoSchedulingSettingController,
    );
    service = module.get<AutoSchedulingSettingService>(
      AutoSchedulingSettingService,
    );

    service.find = jest
      .fn()
      .mockResolvedValue([new AutoSchedulingSetting()]) as jest.MockedFunction<
      typeof service.find
    >;
    service.update = jest
      .fn()
      .mockResolvedValue({ affected: 1 }) as jest.MockedFunction<
      typeof service.update
    >;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('find', () => {
    it('should return setting list successfully', async () => {
      const mockSetting = Array(5).fill(new AutoSchedulingSetting());
      service.find.mockResolvedValue(mockSetting);

      const result = await controller.find();

      expect(service.find).toHaveBeenCalledWith({
        select: {
          id: true,
          cancel_request_expiry: true,
          check_distance_time: true,
          facility_cancel_time: true,
          post_shift_to_open: true,
          provider_radius: true,
          running_late_ai_time: true,
          running_late_request_expiry: true,
          send_another_request: true,
          bulk_scheduling_duration: true,
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Record'),
          data: mockSetting[0],
        }),
      );
    });

    it('should handle errors when fetching settings fails', async () => {
      const errorMessage = 'Database error';
      service.find.mockRejectedValue(new Error(errorMessage));

      const result = await controller.find();

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('updateCertificate', () => {
    it('should return a bad request if the certificate does not exist', async () => {
      const id = '1';
      const updateAutoSchedulingSettingDto =
        new UpdateAutoSchedulingSettingDto();

      service.find.mockResolvedValue(null);

      const result = await controller.update(
        id,
        updateAutoSchedulingSettingDto,
      );

      expect(service.find).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Setting'),
          data: {},
        }),
      );
    });

    it('should successfully update the certificate', async () => {
      const id = '1';
      const updateAutoSchedulingSettingDto =
        new UpdateAutoSchedulingSettingDto();

      service.find.mockResolvedValueOnce([new AutoSchedulingSetting()]); // Mock finding the certificate

      service.update.mockResolvedValue({ affected: 1 });

      const result = await controller.update(
        id,
        updateAutoSchedulingSettingDto,
      );

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Setting'),
          data: {},
        }),
      );
    });

    it('should return an error if no records were updated', async () => {
      const id = '1';
      const updateAutoSchedulingSettingDto =
        new UpdateAutoSchedulingSettingDto();

      service.find.mockResolvedValueOnce([new AutoSchedulingSetting()]); // Mock finding the certificate

      service.update.mockResolvedValue({ affected: 0 });

      const result = await controller.update(
        id,
        updateAutoSchedulingSettingDto,
      );

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Setting'),
          data: {},
        }),
      );
    });

    it('should handle errors during the update process', async () => {
      const id = '1';
      const updateAutoSchedulingSettingDto =
        new UpdateAutoSchedulingSettingDto();
      const error = new Error('Unexpected Error');

      service.find.mockRejectedValue(error);

      const result = await controller.update(
        id,
        updateAutoSchedulingSettingDto,
      );

      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
