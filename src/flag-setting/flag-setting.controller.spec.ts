import { Test, TestingModule } from '@nestjs/testing';
import { FlagSettingController } from './flag-setting.controller';
import { FlagSettingService } from './flag-setting.service';
import { CreateFlagSettingDto } from './dto/create-flag-setting.dto';
import { FlagSetting } from './entities/flag-setting.entity';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import { ILike } from 'typeorm';
import { UpdateFlagSettingDto } from './dto/update-flag-setting.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';

describe('FlagSettingController', () => {
  let controller: FlagSettingController;
  let flagSettingService: any;

  beforeEach(async () => {
    const flagSettingServiceMock = {
      checkName: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      findOneWhere: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlagSettingController],
      providers: [
        { provide: FlagSettingService, useValue: flagSettingServiceMock },
      ],
    }).compile();

    controller = module.get<FlagSettingController>(FlagSettingController);
    flagSettingService = module.get<FlagSettingService>(FlagSettingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createFlagSettingDto = new CreateFlagSettingDto();
    it('should return bad request if the flag name already exist', async () => {
      flagSettingService.checkName.mockResolvedValue(new FlagSetting());

      const result = await controller.create(createFlagSettingDto);
      expect(flagSettingService.checkName).toHaveBeenCalledWith(
        createFlagSettingDto.name,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Flag'),
          data: {},
        }),
      );
    });

    it('should create new flag setting successfully', async () => {
      const mockSetting = new FlagSetting();
      flagSettingService.checkName.mockResolvedValue(null);
      flagSettingService.create.mockResolvedValue(mockSetting);

      const result = await controller.create(createFlagSettingDto);
      expect(flagSettingService.checkName).toHaveBeenCalledWith(
        createFlagSettingDto.name,
      );
      expect(flagSettingService.create).toHaveBeenCalledWith(
        createFlagSettingDto,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Flag'),
          data: mockSetting,
        }),
      );
    });

    it('should handle failure cases while processing', async () => {
      const error = new Error('error');
      flagSettingService.checkName.mockRejectedValue(error);

      const result = await controller.create(createFlagSettingDto);
      expect(flagSettingService.checkName).toHaveBeenCalledWith(
        createFlagSettingDto.name,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findAll', () => {
    const queryParamsDto = new QueryParamsDto();
    it('should return not found if there is not record', async () => {
      queryParamsDto.search = 'test';
      const mockSettings = [];
      const count = mockSettings.length;

      flagSettingService.findAll.mockResolvedValue([mockSettings, count]);

      const result = await controller.findAll(queryParamsDto);
      expect(flagSettingService.findAll).toHaveBeenCalledWith({
        where: {
          name: ILike(`%${parseSearchKeyword(queryParamsDto.search)}%`),
        },
        order: queryParamsDto.order,
        take: +queryParamsDto.limit,
        skip: +queryParamsDto.offset,
      });
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Flags'),
          total: count,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: mockSettings,
        }),
      );
    });

    it('should return flag setting list', async () => {
      queryParamsDto.search = '';
      const mockSettings = [new FlagSetting()];
      const count = mockSettings.length;

      flagSettingService.findAll.mockResolvedValue([mockSettings, count]);

      const result = await controller.findAll(queryParamsDto);
      expect(flagSettingService.findAll).toHaveBeenCalledWith({
        order: queryParamsDto.order,
        take: +queryParamsDto.limit,
        skip: +queryParamsDto.offset,
      });
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Flags'),
          total: count,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: mockSettings,
        }),
      );
    });

    it('should handle failure case while processing', async () => {
      const error = new Error('error');

      flagSettingService.findAll.mockRejectedValue(error);

      const result = await controller.findAll(queryParamsDto);
      expect(flagSettingService.findAll).toHaveBeenCalledWith({
        order: queryParamsDto.order,
        take: +queryParamsDto.limit,
        skip: +queryParamsDto.offset,
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findOne', () => {
    const id = '1';
    it('should return bad request if data not found', async () => {
      flagSettingService.findOneWhere.mockResolvedValue(null);

      const result = await controller.findOne(id);
      expect(flagSettingService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Flag'),
          data: {},
        }),
      );
    });

    it('should return success response with data', async () => {
      const mockSetting = new FlagSetting();
      flagSettingService.findOneWhere.mockResolvedValue(mockSetting);

      const result = await controller.findOne(id);
      expect(flagSettingService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Flag'),
          data: mockSetting,
        }),
      );
    });

    it('should handle failure case while processing', async () => {
      const error = new Error('error');
      flagSettingService.findOneWhere.mockRejectedValue(error);

      const result = await controller.findOne(id);
      expect(flagSettingService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('update', () => {
    const id = '1';
    const updateFlagSettingDto = new UpdateFlagSettingDto();
    it('should return bad request if data not found', async () => {
      flagSettingService.findOneWhere.mockResolvedValue(null);

      const result = await controller.update(id, updateFlagSettingDto);
      expect(flagSettingService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Flag'),
          data: {},
        }),
      );
    });

    it('should return bad request if name already exist', async () => {
      const mockSetting = new FlagSetting();
      mockSetting.id = '2';
      flagSettingService.findOneWhere.mockResolvedValue(new FlagSetting());
      flagSettingService.checkName.mockResolvedValue(mockSetting);

      const result = await controller.update(id, updateFlagSettingDto);
      expect(flagSettingService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(flagSettingService.checkName).toHaveBeenCalledWith(
        updateFlagSettingDto.name,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Flag'),
          data: {},
        }),
      );
    });

    it('should return not found if data is not updated', async () => {
      flagSettingService.findOneWhere.mockResolvedValue(new FlagSetting());
      flagSettingService.checkName.mockResolvedValue(null);
      flagSettingService.update.mockResolvedValue({ affected: 0 });

      const result = await controller.update(id, updateFlagSettingDto);
      expect(flagSettingService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(flagSettingService.checkName).toHaveBeenCalledWith(
        updateFlagSettingDto.name,
      );
      expect(flagSettingService.update).toHaveBeenCalledWith(
        id,
        updateFlagSettingDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Flag'),
          data: {},
        }),
      );
    });

    it('should return success message if data updated', async () => {
      flagSettingService.findOneWhere.mockResolvedValue(new FlagSetting());
      flagSettingService.checkName.mockResolvedValue(null);
      flagSettingService.update.mockResolvedValue({ affected: 1 });

      const result = await controller.update(id, updateFlagSettingDto);
      expect(flagSettingService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(flagSettingService.checkName).toHaveBeenCalledWith(
        updateFlagSettingDto.name,
      );
      expect(flagSettingService.update).toHaveBeenCalledWith(
        id,
        updateFlagSettingDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Flag'),
          data: {},
        }),
      );
    });

    it('should handle failure case while processing', async () => {
      const error = new Error('error');
      flagSettingService.findOneWhere.mockRejectedValue(error);

      const result = await controller.update(id, updateFlagSettingDto);
      expect(flagSettingService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('remove', () => {
    const id = '1';
    const deleteDto = new DeleteDto();
    it('should return bad request if data not found', async () => {
      flagSettingService.findOneWhere.mockResolvedValue(null);

      const result = await controller.remove(id, deleteDto);
      expect(flagSettingService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Flag'),
          data: {},
        }),
      );
    });

    it('should return not found if data is not updated', async () => {
      flagSettingService.findOneWhere.mockResolvedValue(new FlagSetting());
      flagSettingService.remove.mockResolvedValue({ affected: 0 });

      const result = await controller.remove(id, deleteDto);
      expect(flagSettingService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(flagSettingService.remove).toHaveBeenCalledWith(id, deleteDto);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Flag'),
          data: {},
        }),
      );
    });

    it('should return success message if data updated', async () => {
      flagSettingService.findOneWhere.mockResolvedValue(new FlagSetting());
      flagSettingService.remove.mockResolvedValue({ affected: 1 });

      const result = await controller.remove(id, deleteDto);
      expect(flagSettingService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(flagSettingService.remove).toHaveBeenCalledWith(id, deleteDto);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_DELETED('Flag'),
          data: {},
        }),
      );
    });

    it('should handle failure case while processing', async () => {
      const error = new Error('error');
      flagSettingService.findOneWhere.mockRejectedValue(error);

      const result = await controller.remove(id, deleteDto);
      expect(flagSettingService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
