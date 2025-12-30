import { Test, TestingModule } from '@nestjs/testing';
import { ReferenceFormGlobalSettingController } from './reference-form-global-setting.controller';
import { ReferenceFormGlobalSettingService } from './reference-form-global-setting.service';

describe('ReferenceFormGlobalSettingController', () => {
  let controller: ReferenceFormGlobalSettingController;
  let _referenceFormGlobalSettingService: any;

  beforeEach(async () => {
    const referenceFormGlobalSettingServiceMock = {
      create: jest.fn(),
      findOne: jest.fn(),
      findOneWhere: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReferenceFormGlobalSettingController],
      providers: [
        {
          provide: ReferenceFormGlobalSettingService,
          useValue: referenceFormGlobalSettingServiceMock,
        },
      ],
    }).compile();

    controller = module.get<ReferenceFormGlobalSettingController>(
      ReferenceFormGlobalSettingController,
    );

    _referenceFormGlobalSettingService =
      module.get<ReferenceFormGlobalSettingService>(
        ReferenceFormGlobalSettingService,
      );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
