import { Test, TestingModule } from '@nestjs/testing';
import { ProviderGeneralSettingController } from './provider-general-setting.controller';
import { ProviderGeneralSettingService } from './provider-general-setting.service';
import { ProviderGeneralSetting } from './entities/provider-general-setting.entity';
import { ProviderGeneralSettingSubSection } from './entities/provider-general-setting-sub-section.entity';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { ProviderGeneralSettingSection } from './entities/provider-general-setting-section.entity';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('ProviderGeneralSettingController', () => {
  let controller: ProviderGeneralSettingController;
  let providerGeneralSettingService: any;

  beforeEach(async () => {
    const providerGeneralSettingServiceMock = {
      findOneSectionWhere: jest.fn(),
      createSource: jest.fn(),
      findOneSourceName: jest.fn(),
      findOneSubSection: jest.fn(),
      updateSubSection: jest.fn(),
      findAllSectionWhere: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProviderGeneralSettingController],
      providers: [
        {
          provide: ProviderGeneralSettingService,
          useValue: providerGeneralSettingServiceMock,
        },
        {
          provide: getRepositoryToken(ProviderGeneralSettingSection),
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

    controller = module.get<ProviderGeneralSettingController>(
      ProviderGeneralSettingController,
    );
    providerGeneralSettingService = module.get<ProviderGeneralSettingService>(
      ProviderGeneralSettingService,
    );

    providerGeneralSettingService.findOneSectionWhere = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof providerGeneralSettingService.findOneSectionWhere
    >;
    providerGeneralSettingService.findOneSubSection = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof providerGeneralSettingService.findOneSubSection
    >;
    providerGeneralSettingService.findOneSourceName = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof providerGeneralSettingService.findOneSourceName
    >;
    providerGeneralSettingService.createSource = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof providerGeneralSettingService.createSource
    >;
    providerGeneralSettingService.updateSubSection = jest
      .fn()
      .mockResolvedValue({ affected: 1 }) as jest.MockedFunction<
      typeof providerGeneralSettingService.updateSubSection
    >;
    providerGeneralSettingService.findAllSectionWhere = jest
      .fn()
      .mockResolvedValue([new ProviderGeneralSetting()]) as jest.MockedFunction<
      typeof providerGeneralSettingService.findAllSectionWhere
    >;
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHeardPlaces', () => {
    it('should return the Heard places if found', async () => {
      const id = '1';
      const expectedProviderGeneralSettingSection =
        new ProviderGeneralSettingSection();
      expectedProviderGeneralSettingSection.id = id;
      expectedProviderGeneralSettingSection.name =
        'Test ProviderGeneralSettingSection';

      providerGeneralSettingService.findOneSectionWhere.mockResolvedValue(
        expectedProviderGeneralSettingSection,
      );

      const result = await controller.getHeardPlaces();

      expect(
        providerGeneralSettingService.findOneSectionWhere,
      ).toHaveBeenCalledWith({
        where: {
          key: 'heard_about_us',
          sub_section: {
            status: DEFAULT_STATUS.active,
          },
        },
        relations: {
          sub_section: true,
        },
        select: {
          id: true,
          name: true,
          sub_section: {
            id: true,
            name: true,
            has_remark: true,
            status: true,
          },
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Heard places'),
          data: expectedProviderGeneralSettingSection,
        }),
      );
    });

    it('should return a bad request if the Heard places is not found', async () => {
      providerGeneralSettingService.findOneSectionWhere.mockResolvedValue(null);

      const result = await controller.getHeardPlaces();

      expect(
        providerGeneralSettingService.findOneSectionWhere,
      ).toHaveBeenCalledWith({
        where: {
          key: 'heard_about_us',
          sub_section: {
            status: DEFAULT_STATUS.active,
          },
        },
        relations: {
          sub_section: true,
        },
        select: {
          id: true,
          name: true,
          sub_section: {
            id: true,
            name: true,
            has_remark: true,
            status: true,
          },
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Heard places'),
          data: {},
        }),
      );
    });

    it('should handle errors during the retrieval process', async () => {
      const error = new Error('Database Error');
      providerGeneralSettingService.findOneSectionWhere.mockRejectedValue(
        error,
      );

      const result = await controller.getHeardPlaces();

      expect(
        providerGeneralSettingService.findOneSectionWhere,
      ).toHaveBeenCalledWith({
        where: {
          key: 'heard_about_us',
          sub_section: {
            status: DEFAULT_STATUS.active,
          },
        },
        relations: {
          sub_section: true,
        },
        select: {
          id: true,
          name: true,
          sub_section: {
            id: true,
            name: true,
            has_remark: true,
            status: true,
          },
        },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getAcknowledgeMentQuestion', () => {
    it('should return the Acknowledgement Question if found', async () => {
      const id = '1';
      const expectedProviderGeneralSettingSection =
        new ProviderGeneralSettingSection();
      expectedProviderGeneralSettingSection.id = id;
      expectedProviderGeneralSettingSection.name =
        'Test ProviderGeneralSettingSection';
      expectedProviderGeneralSettingSection.sub_section = [
        new ProviderGeneralSettingSubSection(),
      ];

      providerGeneralSettingService.findOneSectionWhere.mockResolvedValue(
        expectedProviderGeneralSettingSection,
      );

      providerGeneralSettingService.findOneSubSection.mockResolvedValue({
        id: '12',
        name: 'Test SubSection',
      });

      const result = await controller.getAcknowledgeMentQuestion();

      expect(
        providerGeneralSettingService.findOneSectionWhere,
      ).toHaveBeenCalledWith({
        where: {
          key: 'acknowledgement_question',
          sub_section: {
            status: DEFAULT_STATUS.active,
          },
        },
        relations: {
          sub_section: true,
        },
        order: {
          sub_section: {
            order: 'ASC',
          },
        },
        select: {
          id: true,
          name: true,
          sub_section: {
            id: true,
            name: true,
            order: true,
            has_remark: true,
            status: true,
            placeholder: true,
            instruction: true,
          },
        },
      });

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Acknowledgement Question'),
          data: expectedProviderGeneralSettingSection,
        }),
      );
    });

    it('should return a bad request if the Acknowledgement Question is not found', async () => {
      providerGeneralSettingService.findOneSectionWhere.mockResolvedValue(null);

      providerGeneralSettingService.findOneSubSection.mockResolvedValue(null);
      const result = await controller.getAcknowledgeMentQuestion();

      expect(
        providerGeneralSettingService.findOneSectionWhere,
      ).toHaveBeenCalledWith({
        where: {
          key: 'acknowledgement_question',
          sub_section: {
            status: DEFAULT_STATUS.active,
          },
        },
        relations: {
          sub_section: true,
        },
        order: {
          sub_section: {
            order: 'ASC',
          },
        },
        select: {
          id: true,
          name: true,
          sub_section: {
            id: true,
            name: true,
            order: true,
            has_remark: true,
            status: true,
            placeholder: true,
            instruction: true,
          },
        },
      });

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND(
            'Acknowledgement Question',
          ),
          data: {},
        }),
      );
    });

    it('should handle errors during the retrieval process', async () => {
      const error = new Error('Database Error');
      providerGeneralSettingService.findOneSectionWhere.mockRejectedValue(
        error,
      );

      const result = await controller.getAcknowledgeMentQuestion();

      expect(
        providerGeneralSettingService.findOneSectionWhere,
      ).toHaveBeenCalledWith({
        where: {
          key: 'acknowledgement_question',
          sub_section: {
            status: DEFAULT_STATUS.active,
          },
        },
        relations: {
          sub_section: true,
        },
        order: {
          sub_section: {
            order: 'ASC',
          },
        },
        select: {
          id: true,
          name: true,
          sub_section: {
            id: true,
            name: true,
            order: true,
            has_remark: true,
            status: true,
            placeholder: true,
            instruction: true,
          },
        },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getAllGeneralSetting', () => {
    it('should return the All General Setting if found', async () => {
      providerGeneralSettingService.findAllSectionWhere.mockResolvedValue([
        new ProviderGeneralSetting(),
      ]);

      const result = await controller.getAllGeneralSetting();

      expect(
        providerGeneralSettingService.findAllSectionWhere,
      ).toHaveBeenCalledWith({
        relations: {
          sub_section: true,
        },
        order: {
          order: 'ASC',
          sub_section: {
            order: 'ASC',
          },
        },
        select: {
          id: true,
          name: true,
          order: true,
          sub_section: {
            id: true,
            name: true,
            order: true,
            placeholder: true,
            has_remark: true,
            status: true,
            type: true,
            created_at: true,
          },
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('General Setting'),
          data: [new ProviderGeneralSetting()],
        }),
      );
    });

    it('should return a bad request if the General Setting if not found', async () => {
      providerGeneralSettingService.findAllSectionWhere.mockResolvedValue(null);

      const result = await controller.getAllGeneralSetting();

      expect(
        providerGeneralSettingService.findAllSectionWhere,
      ).toHaveBeenCalledWith({
        relations: {
          sub_section: true,
        },
        order: {
          order: 'ASC',
          sub_section: {
            order: 'ASC',
          },
        },
        select: {
          id: true,
          name: true,
          order: true,
          sub_section: {
            id: true,
            name: true,
            order: true,
            placeholder: true,
            has_remark: true,
            status: true,
            type: true,
            created_at: true,
          },
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('General Setting'),
          data: [],
        }),
      );
    });

    it('should handle errors during the retrieval process', async () => {
      const error = new Error('Database Error');
      providerGeneralSettingService.findAllSectionWhere.mockRejectedValue(
        error,
      );

      const result = await controller.getAllGeneralSetting();

      expect(
        providerGeneralSettingService.findAllSectionWhere,
      ).toHaveBeenCalledWith({
        relations: {
          sub_section: true,
        },
        order: {
          order: 'ASC',
          sub_section: {
            order: 'ASC',
          },
        },
        select: {
          id: true,
          name: true,
          order: true,
          sub_section: {
            id: true,
            name: true,
            order: true,
            placeholder: true,
            has_remark: true,
            status: true,
            type: true,
            created_at: true,
          },
        },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('createSource', () => {
    it('should return a bad request if the source already exists', async () => {
      const createSourceDto = new CreateSourceDto();
      createSourceDto.name = 'Test Source';

      providerGeneralSettingService.findOneSourceName.mockResolvedValue(
        new ProviderGeneralSettingSubSection(),
      ); // Simulate finding an existing Source

      const result = await controller.createSource(createSourceDto);

      expect(
        providerGeneralSettingService.findOneSourceName,
      ).toHaveBeenCalledWith(createSourceDto.name);
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Source'),
          data: {},
        }),
      );
    });

    it('should successfully create a Source', async () => {
      const createSourceDto = new CreateSourceDto();
      createSourceDto.name = 'New Source';

      providerGeneralSettingService.findOneSourceName.mockResolvedValue(null); // No existing certificate found
      providerGeneralSettingService.findOneSectionWhere.mockResolvedValue({
        id: '12',
        sub_section: [new ProviderGeneralSettingSubSection()],
      }); // No existing source found
      providerGeneralSettingService.createSource.mockResolvedValue({
        id: '123',
        name: 'New Source',
      }); // Simulate successful source creation

      const result = await controller.createSource(createSourceDto);

      expect(providerGeneralSettingService.createSource).toHaveBeenCalledWith(
        createSourceDto,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Source Name'),
          data: { id: '123', name: 'New Source' },
        }),
      );
    });

    it('should handle errors during source creation', async () => {
      const createSourceDto = new CreateSourceDto();
      createSourceDto.name = 'Error Source';

      const error = new Error('Database Error');
      providerGeneralSettingService.findOneSourceName.mockRejectedValue(error); // Simulate an error during the findOne operation

      const result = await controller.createSource(createSourceDto);

      expect(
        providerGeneralSettingService.findOneSourceName,
      ).toHaveBeenCalledWith(createSourceDto.name);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('updateSetting', () => {
    it('should return a bad request if the Setting does not exist', async () => {
      const id = '1';
      const updateSettingDto = new UpdateSettingDto();
      updateSettingDto.status = DEFAULT_STATUS.in_active;

      providerGeneralSettingService.findOneSubSection.mockResolvedValue(null);

      const result = await controller.updateSetting(id, updateSettingDto);

      expect(
        providerGeneralSettingService.findOneSubSection,
      ).toHaveBeenCalledWith({
        where: { id: id },
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
      updateSettingDto.status = DEFAULT_STATUS.in_active;

      providerGeneralSettingService.findOneSubSection
        .mockResolvedValueOnce(new ProviderGeneralSettingSubSection())
        .mockResolvedValueOnce(null);

      providerGeneralSettingService.updateSubSection.mockResolvedValue({
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
      updateSettingDto.status = DEFAULT_STATUS.in_active;

      providerGeneralSettingService.findOneSubSection
        .mockResolvedValueOnce(new ProviderGeneralSettingSubSection())
        .mockResolvedValueOnce(null);

      providerGeneralSettingService.updateSubSection.mockResolvedValue({
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

      providerGeneralSettingService.findOneSubSection.mockRejectedValue(error);

      const result = await controller.updateSetting(id, updateSettingDto);

      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
