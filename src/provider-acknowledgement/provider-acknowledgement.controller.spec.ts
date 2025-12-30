import { Test, TestingModule } from '@nestjs/testing';
import { ProviderAcknowledgementController } from './provider-acknowledgement.controller';
import { ProviderAcknowledgementService } from './provider-acknowledgement.service';
import { ProviderService } from '@/provider/provider.service';
import {
  AcknowledgementQuestion,
  CreateProviderAcknowledgementDto,
} from './dto/create-provider-acknowledgement.dto';
import { Provider } from '@/provider/entities/provider.entity';
import { CONSTANT } from '@/shared/constants/message';
import response from '@/shared/response';
import { Not, IsNull } from 'typeorm';
import { SubAcknowledgement } from './entities/sub-acknowledgement.entity';

describe('ProviderAcknowledgementController', () => {
  let controller: ProviderAcknowledgementController;
  let providerAcknowledgementService: any;
  let providerService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProviderAcknowledgementController],
      providers: [
        {
          provide: ProviderAcknowledgementService,
          useValue: {
            createAcknowledgementResponse: jest.fn(),
            createProviderAcknowledgement: jest.fn(),
          },
        },
        {
          provide: ProviderService,
          useValue: {
            findOneWhere: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProviderAcknowledgementController>(
      ProviderAcknowledgementController,
    );
    providerAcknowledgementService = module.get<ProviderAcknowledgementService>(
      ProviderAcknowledgementService,
    );
    providerService = module.get<ProviderService>(ProviderService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('setAcknowledgement', () => {
    const req: any = { user: { id: '1' } };
    const createProviderAcknowledgementDto =
      new CreateProviderAcknowledgementDto();
    it('should return bad request if already exist', async () => {
      providerService.findOneWhere.mockResolvedValue(new Provider());
      const result = await controller.setAcknowledgement(
        req,
        createProviderAcknowledgementDto,
      );
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: { id: req.user.id, provider_acknowledgement: Not(IsNull()) },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ACKNOWLEDGEMENT_ALREADY_SUBMITTED,
          data: {},
        }),
      );
    });

    it('should create new acknowledgement', async () => {
      createProviderAcknowledgementDto.acknowledgementQuestions = [
        new AcknowledgementQuestion(),
      ];
      providerService.findOneWhere.mockResolvedValueOnce(null);
      providerAcknowledgementService.createAcknowledgementResponse.mockResolvedValue(
        new SubAcknowledgement(),
      );
      providerService.findOneWhere.mockResolvedValueOnce(new Provider());
      providerAcknowledgementService.createProviderAcknowledgement.mockResolvedValue(
        new SubAcknowledgement(),
      );

      const result = await controller.setAcknowledgement(
        req,
        createProviderAcknowledgementDto,
      );

      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: { id: req.user.id, provider_acknowledgement: Not(IsNull()) },
      });
      expect(
        providerAcknowledgementService.createAcknowledgementResponse,
      ).toHaveBeenCalledWith(new AcknowledgementQuestion());
      expect(providerService.findOneWhere).toHaveBeenNthCalledWith(2, {
        where: { id: req.user.id },
      });
      expect(
        providerAcknowledgementService.createProviderAcknowledgement,
      ).toHaveBeenCalledWith({
        ...createProviderAcknowledgementDto,
        subAcknowledgement: [new SubAcknowledgement()],
        provider: new Provider(),
      });

      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Acknowledgement submitted'),
          data: new SubAcknowledgement(),
        }),
      );
    });

    it('should handle errors during the process', async () => {
      const error = new Error('Database Error');
      providerService.findOneWhere.mockRejectedValue(error);

      const result = await controller.setAcknowledgement(
        req,
        createProviderAcknowledgementDto,
      );
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: { id: req.user.id, provider_acknowledgement: Not(IsNull()) },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
