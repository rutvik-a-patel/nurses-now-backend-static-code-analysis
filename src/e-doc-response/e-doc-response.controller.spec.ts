jest.mock('@/shared/helpers/s3-delete-file', () => ({
  __esModule: true, // This helps Jest understand that the module is an ES module
  default: jest.fn().mockResolvedValue(true), // Mocking the default export as a function
}));

import { Test, TestingModule } from '@nestjs/testing';
import { EDocResponseController } from './e-doc-response.controller';
import { EDocResponseService } from './e-doc-response.service';
import { CreateEDocResponseDto } from './dto/create-e-doc-response.dto';
import { EDocResponse } from './entities/e-doc-response.entity';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { UpdateEDocResponseDto } from './dto/update-e-doc-response.dto';
import s3DeleteFile from '@/shared/helpers/s3-delete-file';
import { ProviderCredentialsService } from '@/provider-credentials/provider-credentials.service';
import { Provider } from '@/provider/entities/provider.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('EDocResponseController', () => {
  let controller: EDocResponseController;
  let eDocResponseService: any;
  let deleteFile: any;
  let providerCredentialsService: any;
  let providerRepository: any;

  beforeEach(async () => {
    const providerCredentialsServiceMock = {
      getCredentialsProgress: jest.fn().mockResolvedValue(80),
    };
    const providerRepositoryMock = {
      update: jest.fn().mockResolvedValue({}),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EDocResponseController],
      providers: [
        {
          provide: EDocResponseService,
          useValue: {
            create: jest.fn(),
            findOneWhere: jest.fn(),
            updateWhere: jest.fn(),
          },
        },
        {
          provide: ProviderCredentialsService,
          useValue: providerCredentialsServiceMock,
        },
        {
          provide: getRepositoryToken(Provider),
          useValue: providerRepositoryMock,
        },
      ],
    }).compile();

    controller = module.get<EDocResponseController>(EDocResponseController);
    eDocResponseService = module.get<EDocResponseService>(EDocResponseService);
    providerCredentialsService = module.get<ProviderCredentialsService>(
      ProviderCredentialsService,
    );
    providerRepository = module.get(getRepositoryToken(Provider));
    deleteFile = s3DeleteFile as jest.MockedFunction<typeof s3DeleteFile>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const req: any = { user: { id: '1' } };
    const createEDocResponseDto = new CreateEDocResponseDto();
    it('should create response for e-doc successfully', async () => {
      eDocResponseService.create.mockResolvedValue(new EDocResponse());

      const result = await controller.create(createEDocResponseDto, req);
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('E Doc Uploaded'),
          data: new EDocResponse(),
        }),
      );
      expect(
        providerCredentialsService.getCredentialsProgress,
      ).toHaveBeenCalledWith(req.user);
      expect(providerRepository.update).toHaveBeenCalledWith(req.user.id, {
        credentials_completion_ratio: 80,
      });
    });

    it('should handle failure error', async () => {
      const error = new Error('error');
      eDocResponseService.create.mockRejectedValue(error);

      const result = await controller.create(createEDocResponseDto, req);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('update', () => {
    const id = '1';
    const updateEDocResponseDto = new UpdateEDocResponseDto();
    it('should return bad request if data not found', async () => {
      eDocResponseService.findOneWhere.mockResolvedValue(null);

      const result = await controller.update(id, updateEDocResponseDto);
      expect(eDocResponseService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('E Doc Response'),
          data: {},
        }),
      );
    });

    it('should update record', async () => {
      const mockResponse = new EDocResponse();
      mockResponse.document = 'img.png';
      eDocResponseService.findOneWhere.mockResolvedValue(mockResponse);
      eDocResponseService.updateWhere.mockResolvedValue({ affected: 0 });

      const result = await controller.update(id, updateEDocResponseDto);
      expect(eDocResponseService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(deleteFile).toHaveBeenCalledWith(mockResponse.document);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('E Doc Response'),
          data: {},
        }),
      );
    });

    it('should update record', async () => {
      const mockResponse = new EDocResponse();
      mockResponse.document = 'img.png';
      eDocResponseService.findOneWhere.mockResolvedValue(mockResponse);
      eDocResponseService.updateWhere.mockResolvedValue({ affected: 1 });

      const result = await controller.update(id, updateEDocResponseDto);
      expect(eDocResponseService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(deleteFile).toHaveBeenCalledWith(mockResponse.document);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('E Doc Uploaded'),
          data: {},
        }),
      );
    });

    it('should handle failure error', async () => {
      const error = new Error('error');
      eDocResponseService.findOneWhere.mockRejectedValue(error);

      const result = await controller.update(id, updateEDocResponseDto);
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
