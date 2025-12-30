import { Test, TestingModule } from '@nestjs/testing';
import { ProviderProfileSettingController } from './provider-profile-setting.controller';
import { ProviderProfileSettingService } from './provider-profile-setting.service';
import { ProviderProfileSetting } from './entities/provider-profile-setting.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProviderGeneralSettingSubSection } from '@/provider-general-setting/entities/provider-general-setting-sub-section.entity';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('ProviderProfileSettingController', () => {
  let controller: ProviderProfileSettingController;
  let providerProfileSettingService: any;

  beforeEach(async () => {
    const providerProfileSettingServiceMock = {
      findOneWhere: jest.fn(),
      updateSubSection: jest.fn(),
      findAll: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProviderProfileSettingController],
      providers: [
        {
          provide: ProviderProfileSettingService,
          useValue: providerProfileSettingServiceMock,
        },
        {
          provide: getRepositoryToken(ProviderProfileSetting),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ProviderGeneralSettingSubSection),
          useValue: {},
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

    controller = module.get<ProviderProfileSettingController>(
      ProviderProfileSettingController,
    );
    providerProfileSettingService = module.get<ProviderProfileSettingService>(
      ProviderProfileSettingService,
    );

    providerProfileSettingService.findOneWhere = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof providerProfileSettingService.findOneWhere
    >;
    providerProfileSettingService.updateSubSection = jest
      .fn()
      .mockResolvedValue({ affected: 1 }) as jest.MockedFunction<
      typeof providerProfileSettingService.updateSubSection
    >;
    providerProfileSettingService.findAll = jest
      .fn()
      .mockResolvedValue([
        [new ProviderProfileSetting()],
        1,
      ]) as jest.MockedFunction<typeof providerProfileSettingService.findAll>;
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return the All Provider Profile Setting if found', async () => {
      providerProfileSettingService.findAll.mockResolvedValue([
        new ProviderProfileSetting(),
      ]);

      const result = await controller.findAll();

      expect(providerProfileSettingService.findAll).toHaveBeenCalledWith({
        where: {
          section: {
            status: DEFAULT_STATUS.active,
          },
        },
        select: {
          id: true,
          name: true,
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Staff Profile Setting'),
          data: [new ProviderProfileSetting()],
        }),
      );
    });

    it('should return a bad request if the Provider Profile Setting if not found', async () => {
      providerProfileSettingService.findAll.mockResolvedValue(null);

      const result = await controller.findAll();

      expect(providerProfileSettingService.findAll).toHaveBeenCalledWith({
        where: {
          section: {
            status: DEFAULT_STATUS.active,
          },
        },
        select: {
          id: true,
          name: true,
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff Profile Setting'),
          data: [],
        }),
      );
    });

    it('should handle errors during the retrieval process', async () => {
      const error = new Error('Database Error');
      providerProfileSettingService.findAll.mockRejectedValue(error);

      const result = await controller.findAll();

      expect(providerProfileSettingService.findAll).toHaveBeenCalledWith({
        where: {
          section: {
            status: DEFAULT_STATUS.active,
          },
        },
        select: {
          id: true,
          name: true,
        },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findOneSetting', () => {
    it('should return one setting if found', async () => {
      providerProfileSettingService.findOneWhere.mockResolvedValue(
        new ProviderProfileSetting(),
      );

      const result = await controller.findOneSetting('1');

      expect(providerProfileSettingService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: '1',
        },
        relations: {
          section: {
            sub_section: true,
          },
        },
        order: {
          section: {
            order: 'ASC',
            sub_section: {
              order: 'ASC',
            },
          },
        },
        select: {
          id: true,
          name: true,
          section: {
            id: true,
            name: true,
            status: true,
            order: true,
            created_at: true,
            sub_section: {
              id: true,
              order: true,
              name: true,
              status: true,
              is_required: true,
              created_at: true,
            },
          },
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Staff Profile Setting'),
          data: new ProviderProfileSetting(),
        }),
      );
    });

    it('should return a bad request if the Setting if not found', async () => {
      providerProfileSettingService.findOneWhere.mockResolvedValue(null);

      const result = await controller.findOneSetting('1');

      expect(providerProfileSettingService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: '1',
        },
        relations: {
          section: {
            sub_section: true,
          },
        },
        order: {
          section: {
            order: 'ASC',
            sub_section: {
              order: 'ASC',
            },
          },
        },
        select: {
          id: true,
          name: true,
          section: {
            id: true,
            name: true,
            status: true,
            order: true,
            created_at: true,
            sub_section: {
              id: true,
              order: true,
              name: true,
              status: true,
              is_required: true,
              created_at: true,
            },
          },
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff Profile Setting'),
          data: {},
        }),
      );
    });

    it('should handle errors during the retrieval process', async () => {
      const error = new Error('Database Error');
      providerProfileSettingService.findOneWhere.mockRejectedValue(error);

      const result = await controller.findOneSetting('1');

      expect(providerProfileSettingService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: '1',
        },
        relations: {
          section: {
            sub_section: true,
          },
        },
        order: {
          section: {
            order: 'ASC',
            sub_section: {
              order: 'ASC',
            },
          },
        },
        select: {
          id: true,
          name: true,
          section: {
            id: true,
            name: true,
            status: true,
            order: true,
            created_at: true,
            sub_section: {
              id: true,
              order: true,
              name: true,
              status: true,
              is_required: true,
              created_at: true,
            },
          },
        },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('updateSetting', () => {
    it('should return a bad request if the Setting does not exist', async () => {
      const id = '1';
      const updateSettingDto = new UpdateSettingDto();

      providerProfileSettingService.findOneWhere.mockResolvedValue(null);

      const result = await controller.updateSetting(id, updateSettingDto);

      expect(providerProfileSettingService.findOneWhere).toHaveBeenCalledWith({
        where: {
          section: {
            sub_section: {
              id: id,
            },
          },
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Sub Section'),
          data: {},
        }),
      );
    });

    it('should successfully update the setting', async () => {
      const id = '1';
      const updateSettingDto = new UpdateSettingDto();

      providerProfileSettingService.findOneWhere
        .mockResolvedValueOnce(new ProviderProfileSetting())
        .mockResolvedValueOnce(null);

      providerProfileSettingService.updateSubSection.mockResolvedValue({
        affected: 1,
      });

      const result = await controller.updateSetting(id, updateSettingDto);

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Sub Section'),
          data: {},
        }),
      );
    });

    it('should return an error if no records were updated', async () => {
      const id = '1';
      const updateSettingDto = new UpdateSettingDto();

      providerProfileSettingService.findOneWhere
        .mockResolvedValueOnce(new ProviderProfileSetting())
        .mockResolvedValueOnce(null);

      providerProfileSettingService.updateSubSection.mockResolvedValue({
        affected: 0,
      });

      const result = await controller.updateSetting(id, updateSettingDto);

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Sub Section'),
          data: {},
        }),
      );
    });

    it('should handle errors during the update process', async () => {
      const id = '1';
      const updateSettingDto = new UpdateSettingDto();
      const error = new Error('Unexpected Error');

      providerProfileSettingService.findOneWhere.mockRejectedValue(error);

      const result = await controller.updateSetting(id, updateSettingDto);

      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getProfileSettingData', () => {
    it('should return one setting if found', async () => {
      providerProfileSettingService.findOneWhere.mockResolvedValue(
        new ProviderProfileSetting(),
      );

      const result = await controller.getProfileSettingData('Test Setting');

      expect(providerProfileSettingService.findOneWhere).toHaveBeenCalledWith({
        where: {
          key: 'Test Setting',
          section: {
            sub_section: {
              status: DEFAULT_STATUS.active,
            },
          },
        },
        relations: {
          section: {
            sub_section: true,
          },
        },
        order: {
          section: {
            order: 'ASC',
            sub_section: {
              order: 'ASC',
            },
          },
        },
        select: {
          id: true,
          name: true,
          section: {
            id: true,
            name: true,
            order: true,
            created_at: true,
            sub_section: {
              id: true,
              name: true,
              key: true,
              order: true,
              status: true,
              type: true,
              is_required: true,
            },
          },
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Staff Profile Setting'),
          data: new ProviderProfileSetting(),
        }),
      );
    });

    it('should return a bad request if the Setting if not found', async () => {
      providerProfileSettingService.findOneWhere.mockResolvedValue(null);

      const result = await controller.getProfileSettingData('Test Setting');

      expect(providerProfileSettingService.findOneWhere).toHaveBeenCalledWith({
        where: {
          key: 'Test Setting',
          section: {
            sub_section: {
              status: DEFAULT_STATUS.active,
            },
          },
        },
        relations: {
          section: {
            sub_section: true,
          },
        },
        order: {
          section: {
            order: 'ASC',
            sub_section: {
              order: 'ASC',
            },
          },
        },
        select: {
          id: true,
          name: true,
          section: {
            id: true,
            name: true,
            order: true,
            created_at: true,
            sub_section: {
              id: true,
              name: true,
              key: true,
              order: true,
              status: true,
              type: true,
              is_required: true,
            },
          },
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff Profile Setting'),
          data: {},
        }),
      );
    });

    it('should handle errors during the retrieval process', async () => {
      const error = new Error('Database Error');
      providerProfileSettingService.findOneWhere.mockRejectedValue(error);

      const result = await controller.getProfileSettingData('Test Setting');

      expect(providerProfileSettingService.findOneWhere).toHaveBeenCalledWith({
        where: {
          key: 'Test Setting',
          section: {
            sub_section: {
              status: DEFAULT_STATUS.active,
            },
          },
        },
        relations: {
          section: {
            sub_section: true,
          },
        },
        order: {
          section: {
            order: 'ASC',
            sub_section: {
              order: 'ASC',
            },
          },
        },
        select: {
          id: true,
          name: true,
          section: {
            id: true,
            name: true,
            order: true,
            created_at: true,
            sub_section: {
              id: true,
              name: true,
              key: true,
              order: true,
              status: true,
              type: true,
              is_required: true,
            },
          },
        },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
