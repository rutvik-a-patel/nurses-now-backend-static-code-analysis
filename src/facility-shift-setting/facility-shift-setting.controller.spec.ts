import { Test, TestingModule } from '@nestjs/testing';
import { FacilityShiftSettingController } from './facility-shift-setting.controller';
import { FacilityShiftSettingService } from './facility-shift-setting.service';
import { CreateFacilityShiftSettingDto } from './dto/create-facility-shift-setting.dto';
import { FacilityShiftSetting } from './entities/facility-shift-setting.entity';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { UpdateFacilityShiftSettingDto } from './dto/update-facility-shift-setting.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { TimingSettingDto } from './dto/facility-setting-filter.dto';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('FacilityShiftSettingController', () => {
  let controller: FacilityShiftSettingController;
  let facilityShiftSettingService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacilityShiftSettingController],
      providers: [
        {
          provide: FacilityShiftSettingService,
          useValue: {
            create: jest.fn(),
            checkName: jest.fn(),
            findAll: jest.fn(),
            findOneWhere: jest.fn(),
            updateWhere: jest.fn(),
            remove: jest.fn(),
            findAllShiftTimeWithCode: jest.fn(),
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

    controller = module.get<FacilityShiftSettingController>(
      FacilityShiftSettingController,
    );
    facilityShiftSettingService = module.get<FacilityShiftSettingService>(
      FacilityShiftSettingService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createShiftSetting', () => {
    const createFacilityShiftSettingDto = new CreateFacilityShiftSettingDto();
    it('should create shift setting', async () => {
      const mockSetting = new FacilityShiftSetting();
      facilityShiftSettingService.checkName.mockResolvedValue(mockSetting);

      const result = await controller.createShiftSetting(
        createFacilityShiftSettingDto,
      );
      expect(facilityShiftSettingService.checkName).toHaveBeenCalledWith(
        createFacilityShiftSettingDto.name,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Shift Timing'),
          data: {},
        }),
      );
    });

    it('should create shift setting', async () => {
      const mockSetting = new FacilityShiftSetting();
      facilityShiftSettingService.checkName.mockResolvedValue(null);
      facilityShiftSettingService.create.mockResolvedValue(mockSetting);

      const result = await controller.createShiftSetting(
        createFacilityShiftSettingDto,
      );
      expect(facilityShiftSettingService.checkName).toHaveBeenCalledWith(
        createFacilityShiftSettingDto.name,
      );
      expect(facilityShiftSettingService.create).toHaveBeenCalledWith(
        createFacilityShiftSettingDto,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Shift Timing'),
          data: mockSetting,
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      facilityShiftSettingService.checkName.mockRejectedValue(error);

      const result = await controller.createShiftSetting(
        createFacilityShiftSettingDto,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findAll', () => {
    const queryParamsDto = new TimingSettingDto();
    it('should return not found if list is empty', async () => {
      queryParamsDto.search = 'test';
      facilityShiftSettingService.findAllShiftTimeWithCode.mockResolvedValue([
        [],
        0,
      ]);

      const result = await controller.findAll(queryParamsDto);
      expect(
        facilityShiftSettingService.findAllShiftTimeWithCode,
      ).toHaveBeenCalledWith(queryParamsDto);
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift Timing'),
          total: 0,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: [],
        }),
      );
    });

    it('should return shift setting list', async () => {
      queryParamsDto.search = 'test';
      facilityShiftSettingService.findAllShiftTimeWithCode.mockResolvedValue([
        [new FacilityShiftSetting()],
        1,
      ]);

      const result = await controller.findAll(queryParamsDto);
      expect(
        facilityShiftSettingService.findAllShiftTimeWithCode,
      ).toHaveBeenCalledWith(queryParamsDto);
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Shift Timing'),
          total: 1,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: [new FacilityShiftSetting()],
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      facilityShiftSettingService.findAll.mockRejectedValue(error);

      const result = await controller.findAll(queryParamsDto);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findOne', () => {
    const id = '1';
    it('should return not found if data not found', async () => {
      facilityShiftSettingService.findOneWhere.mockResolvedValue(null);

      const result = await controller.findOne(id);
      expect(facilityShiftSettingService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift Timing'),
          data: {},
        }),
      );
    });

    it('should return shift setting details', async () => {
      facilityShiftSettingService.findOneWhere.mockResolvedValue(
        new FacilityShiftSetting(),
      );

      const result = await controller.findOne(id);
      expect(facilityShiftSettingService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Shift Timing'),
          data: new FacilityShiftSetting(),
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      facilityShiftSettingService.findOneWhere.mockRejectedValue(error);

      const result = await controller.findOne(id);
      expect(facilityShiftSettingService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('update', () => {
    const id = '1';
    const updateFacilityShiftSettingDto = new UpdateFacilityShiftSettingDto();
    it('should return not found if data not found', async () => {
      facilityShiftSettingService.findOneWhere.mockResolvedValue(null);

      const result = await controller.update(id, updateFacilityShiftSettingDto);
      expect(facilityShiftSettingService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift Timing'),
          data: {},
        }),
      );
    });

    it('should return record no found if data not updated', async () => {
      const mockSetting = new FacilityShiftSetting();
      facilityShiftSettingService.findOneWhere.mockResolvedValue(mockSetting);
      facilityShiftSettingService.checkName.mockResolvedValue(
        new FacilityShiftSetting(),
      );

      const result = await controller.update(id, updateFacilityShiftSettingDto);
      expect(facilityShiftSettingService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(facilityShiftSettingService.checkName).toHaveBeenCalledWith(
        mockSetting.name,
        mockSetting.id,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Shift Timing'),
          data: {},
        }),
      );
    });

    it('should return record no found if data not updated', async () => {
      updateFacilityShiftSettingDto.name = 'test';
      const mockSetting = new FacilityShiftSetting();
      facilityShiftSettingService.findOneWhere.mockResolvedValue(mockSetting);
      facilityShiftSettingService.checkName.mockResolvedValue(null);
      facilityShiftSettingService.updateWhere.mockResolvedValue({
        affected: 0,
      });

      const result = await controller.update(id, updateFacilityShiftSettingDto);
      expect(facilityShiftSettingService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(facilityShiftSettingService.checkName).toHaveBeenCalledWith(
        updateFacilityShiftSettingDto.name,
        mockSetting.id,
      );
      expect(facilityShiftSettingService.updateWhere).toHaveBeenCalledWith(
        { id },
        updateFacilityShiftSettingDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift Timing'),
          data: {},
        }),
      );
    });

    it('should return success message if data updated', async () => {
      updateFacilityShiftSettingDto.name = 'test';
      const mockSetting = new FacilityShiftSetting();
      facilityShiftSettingService.findOneWhere.mockResolvedValue(mockSetting);
      facilityShiftSettingService.checkName.mockResolvedValue(null);
      facilityShiftSettingService.updateWhere.mockResolvedValue({
        affected: 1,
      });

      const result = await controller.update(id, updateFacilityShiftSettingDto);
      expect(facilityShiftSettingService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(facilityShiftSettingService.checkName).toHaveBeenCalledWith(
        updateFacilityShiftSettingDto.name,
        mockSetting.id,
      );
      expect(facilityShiftSettingService.updateWhere).toHaveBeenCalledWith(
        { id },
        updateFacilityShiftSettingDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Shift Timing'),
          data: {},
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      facilityShiftSettingService.findOneWhere.mockRejectedValue(error);

      const result = await controller.update(id, updateFacilityShiftSettingDto);
      expect(facilityShiftSettingService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('remove', () => {
    const id = '1';
    const deleteDto = new DeleteDto();
    it('should return record no found if data not removed', async () => {
      facilityShiftSettingService.remove.mockResolvedValue({
        affected: 0,
      });

      const result = await controller.remove(id, deleteDto);
      expect(facilityShiftSettingService.remove).toHaveBeenCalledWith(
        id,
        deleteDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Shift Timing'),
          data: {},
        }),
      );
    });

    it('should return success message if data removed', async () => {
      facilityShiftSettingService.remove.mockResolvedValue({
        affected: 1,
      });

      const result = await controller.remove(id, deleteDto);
      expect(facilityShiftSettingService.remove).toHaveBeenCalledWith(
        id,
        deleteDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_DELETED('Shift Timing'),
          data: {},
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      facilityShiftSettingService.remove.mockRejectedValue(error);

      const result = await controller.remove(id, deleteDto);
      expect(facilityShiftSettingService.remove).toHaveBeenCalledWith(
        id,
        deleteDto,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
