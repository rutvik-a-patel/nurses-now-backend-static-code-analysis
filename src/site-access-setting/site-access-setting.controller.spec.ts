jest.mock('@/shared/helpers/s3-delete-file', () => ({
  __esModule: true, // This helps Jest understand that the module is an ES module
  default: jest.fn().mockResolvedValue(true), // Mocking the default export as a function
}));

import { Test, TestingModule } from '@nestjs/testing';
import { SiteAccessSettingController } from './site-access-setting.controller';
import { SiteAccessSettingService } from './site-access-setting.service';
import { DnrReason } from '@/dnr-reason/entities/dnr-reason.entity';
import { CONSTANT } from '@/shared/constants/message';
import response from '@/shared/response';
import s3DeleteFile from '@/shared/helpers/s3-delete-file';
import { CreateSiteAccessSettingDto } from './dto/create-site-access-setting.dto';
import { SiteAccessSetting } from './entities/site-access-setting.entity';

describe('SiteAccessSettingController', () => {
  let controller: SiteAccessSettingController;
  let service: any;
  let deleteFile: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SiteAccessSettingController],
      providers: [
        {
          provide: SiteAccessSettingService,
          useValue: { findOneWhere: jest.fn(), create: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<SiteAccessSettingController>(
      SiteAccessSettingController,
    );
    service = module.get<SiteAccessSettingService>(SiteAccessSettingService);
    deleteFile = s3DeleteFile as jest.MockedFunction<typeof s3DeleteFile>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a bad request if the setting does not exist', async () => {
      service.findOneWhere.mockResolvedValue(null);

      const result = await controller.findOne();

      expect(service.findOneWhere).toHaveBeenCalledWith({
        where: {},
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Site Setting'),
          data: {},
        }),
      );
    });

    it('should successfully update the lob', async () => {
      service.findOneWhere.mockResolvedValueOnce(new DnrReason());

      const result = await controller.findOne();

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Site Setting'),
          data: {},
        }),
      );
    });

    it('should handle errors during the update process', async () => {
      const error = new Error('Unexpected Error');

      service.findOneWhere.mockRejectedValue(error);

      const result = await controller.findOne();

      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('create', () => {
    const createSiteAccessSettingDto = new CreateSiteAccessSettingDto();
    createSiteAccessSettingDto.id = '1';
    createSiteAccessSettingDto.image = 'logo.png';
    const setting = new SiteAccessSetting();
    setting.image = 'logo1.png';
    it('should return a bad request if the setting does not exist', async () => {
      service.findOneWhere.mockResolvedValue(setting);
      service.create.mockResolvedValue();

      const result = await controller.create(createSiteAccessSettingDto);

      expect(service.findOneWhere).toHaveBeenCalledWith({
        where: {},
      });
      expect(deleteFile).toHaveBeenCalledWith(setting.image);
      expect(service.create).toHaveBeenCalledWith(createSiteAccessSettingDto);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Site Setting Saved'),
          data: {},
        }),
      );
    });

    it('should handle errors during the update process', async () => {
      const error = new Error('Unexpected Error');

      service.findOneWhere.mockRejectedValue(error);

      const result = await controller.create(createSiteAccessSettingDto);

      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
