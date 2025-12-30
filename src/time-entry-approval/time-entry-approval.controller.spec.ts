import { Test, TestingModule } from '@nestjs/testing';
import { TimeEntryApprovalController } from './time-entry-approval.controller';
import { TimeEntryApprovalService } from './time-entry-approval.service';
import { CONSTANT } from '@/shared/constants/message';
import { TimeEntryApproval } from './entities/time-entry-approval.entity';
import response from '@/shared/response';
import { UpdateTimeEntryApprovalDto } from './dto/update-time-entry-approval.dto';
import { DnrReason } from '@/dnr-reason/entities/dnr-reason.entity';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('TimeEntryApprovalController', () => {
  let controller: TimeEntryApprovalController;
  let service: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimeEntryApprovalController],
      providers: [
        {
          provide: TimeEntryApprovalService,
          useValue: {
            findAll: jest.fn(),
            updateWhere: jest.fn(),
            findOneWhere: jest.fn(),
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

    controller = module.get<TimeEntryApprovalController>(
      TimeEntryApprovalController,
    );
    service = module.get<TimeEntryApprovalService>(TimeEntryApprovalService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllSettings', () => {
    it('should successfully retrieve all settings', async () => {
      const mockData = Array(10).fill(new TimeEntryApproval());

      service.findAll.mockResolvedValue(mockData); // Mock service response

      const result = await controller.getAllSettings();

      expect(service.findAll).toHaveBeenCalledWith({
        select: {
          id: true,
          key: true,
          name: true,
          order: true,
          value: true,
        },
        order: { order: 'ASC' },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Time entry setting'),
          data: mockData,
        }),
      );
    });

    it('should handle errors during the fetch process', async () => {
      const errorMessage = 'Database error';
      service.findAll.mockRejectedValue(new Error(errorMessage)); // Simulate an error

      const result = await controller.getAllSettings();

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('update', () => {
    const updateTimeEntryApprovalDto = new UpdateTimeEntryApprovalDto();
    it('should return a bad request if the setting does not exist', async () => {
      const id = '1';

      service.findOneWhere.mockResolvedValue(null);

      const result = await controller.updateSetting(
        id,
        updateTimeEntryApprovalDto,
      );

      expect(service.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Time entry setting'),
          data: {},
        }),
      );
    });

    it('should successfully update the lob', async () => {
      const id = '1';

      service.findOneWhere.mockResolvedValueOnce(new DnrReason());

      service.updateWhere.mockResolvedValue({ affected: 1 });

      const result = await controller.updateSetting(
        id,
        updateTimeEntryApprovalDto,
      );

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Time entry setting'),
          data: {},
        }),
      );
    });

    it('should return an error if no records were updated', async () => {
      const id = '1';

      service.findOneWhere.mockResolvedValueOnce(new TimeEntryApproval());

      service.updateWhere.mockResolvedValue({ affected: 0 });

      const result = await controller.updateSetting(
        id,
        updateTimeEntryApprovalDto,
      );

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Time entry setting'),
          data: {},
        }),
      );
    });

    it('should handle errors during the update process', async () => {
      const id = '1';
      const error = new Error('Unexpected Error');

      service.findOneWhere.mockRejectedValue(error);

      const result = await controller.updateSetting(
        id,
        updateTimeEntryApprovalDto,
      );

      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
