import { Test, TestingModule } from '@nestjs/testing';
import { ColumnsPreferenceController } from './columns-preference.controller';
import { ColumnsPreferenceService } from './columns-preference.service';
import { ColumnsPreference } from './entities/columns-preference.entity';
import { UpdateColumnsPreferenceDto } from './dto/update-columns-preference.dto';
import { CONSTANT } from '@/shared/constants/message';
import response from '@/shared/response';
import { ShiftTableColumns } from '@/shared/constants/default-column-preference';

describe('ColumnsPreferenceController', () => {
  let controller: ColumnsPreferenceController;
  let columnsPreferenceService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColumnsPreferenceController],
      providers: [
        {
          provide: ColumnsPreferenceService,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ColumnsPreferenceController>(
      ColumnsPreferenceController,
    );
    columnsPreferenceService = module.get<ColumnsPreferenceService>(
      ColumnsPreferenceService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getColumnsPreference', () => {
    const req: any = { user: { id: '1' } };

    it('should return default columns when no preference exists', async () => {
      columnsPreferenceService.findOne.mockResolvedValue(null);

      const result = await controller.getColumnsPreference(req, 'shift');

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Columns Preference'),
          data: ShiftTableColumns,
        }),
      );
    });

    it('should return existing columns preference', async () => {
      const mockPreference = new ColumnsPreference();
      mockPreference.columns_config = {
        ...ShiftTableColumns,
      };
      columnsPreferenceService.findOne.mockResolvedValue(mockPreference);

      const result = await controller.getColumnsPreference(req, 'shift');

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Columns Preference'),
          data: mockPreference.columns_config,
        }),
      );
    });

    it('should handle errors and return failure response', async () => {
      const error = new Error('Database error');
      columnsPreferenceService.findOne.mockRejectedValue(error);

      const result = await controller.getColumnsPreference(req, 'shift');

      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('updateColumnsPreference', () => {
    const req: any = { user: { id: '1' } };
    const updateDto = new UpdateColumnsPreferenceDto();
    updateDto.columns_config = { ...ShiftTableColumns };

    it('should create new preference if none exists', async () => {
      columnsPreferenceService.findOne.mockResolvedValue(null);
      const mockCreatedPreference = new ColumnsPreference();
      mockCreatedPreference.columns_config = updateDto.columns_config;
      columnsPreferenceService.create.mockResolvedValue(mockCreatedPreference);

      const result = await controller.updateColumnsPreference(req, updateDto);

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Columns Preference'),
          data: updateDto.columns_config,
        }),
      );
    });

    it('should update existing preference', async () => {
      const existingPreference = new ColumnsPreference();
      existingPreference.id = '1';
      columnsPreferenceService.findOne.mockResolvedValue(existingPreference);

      const updatedPreference = new ColumnsPreference();
      updatedPreference.columns_config = updateDto.columns_config;
      columnsPreferenceService.update.mockResolvedValue(updatedPreference);

      const result = await controller.updateColumnsPreference(req, updateDto);

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Columns Preference'),
          data: updatedPreference.columns_config,
        }),
      );
    });

    it('should handle update failure', async () => {
      const existingPreference = new ColumnsPreference();
      existingPreference.id = '1';
      columnsPreferenceService.findOne.mockResolvedValue(existingPreference);
      columnsPreferenceService.update.mockResolvedValue(null);

      const result = await controller.updateColumnsPreference(req, updateDto);

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Columns Preference'),
          data: {},
        }),
      );
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Test error');
      columnsPreferenceService.findOne.mockRejectedValue(error);

      const result = await controller.updateColumnsPreference(req, updateDto);

      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
