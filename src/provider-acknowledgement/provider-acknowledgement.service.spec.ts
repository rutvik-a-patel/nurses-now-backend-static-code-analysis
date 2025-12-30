import { Test, TestingModule } from '@nestjs/testing';
import { ProviderAcknowledgementService } from './provider-acknowledgement.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SubAcknowledgement } from './entities/sub-acknowledgement.entity';
import { ProviderAcknowledgement } from './entities/provider-acknowledgement.entity';
import { Repository } from 'typeorm';
import {
  AcknowledgementQuestion,
  CreateProviderAcknowledgementDto,
} from './dto/create-provider-acknowledgement.dto';

describe('ProviderAcknowledgementService', () => {
  let service: ProviderAcknowledgementService;
  let subAcknowledgementRepository: any;
  let providerAcknowledgementRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderAcknowledgementService,
        {
          provide: getRepositoryToken(SubAcknowledgement),
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProviderAcknowledgement),
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProviderAcknowledgementService>(
      ProviderAcknowledgementService,
    );
    subAcknowledgementRepository = module.get<Repository<SubAcknowledgement>>(
      getRepositoryToken(SubAcknowledgement),
    );
    providerAcknowledgementRepository = module.get<
      Repository<ProviderAcknowledgement>
    >(getRepositoryToken(ProviderAcknowledgement));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAcknowledgementResponse', () => {
    const acknowledgementQuestion = new AcknowledgementQuestion();
    it('should create new acknowledgement response', async () => {
      subAcknowledgementRepository.save.mockResolvedValue(
        new SubAcknowledgement(),
      );
      const result = await service.createAcknowledgementResponse(
        acknowledgementQuestion,
      );
      expect(subAcknowledgementRepository.save).toHaveBeenCalledWith({
        generalSettingSubSection:
          acknowledgementQuestion.acknowledgementSetting,
        response: acknowledgementQuestion.response,
        remark: acknowledgementQuestion.remark,
      });
      expect(result).toEqual(new SubAcknowledgement());
    });
  });

  describe('createProviderAcknowledgement', () => {
    const createProviderAcknowledgementDto =
      new CreateProviderAcknowledgementDto();
    it('should create new provider acknowledgement', async () => {
      providerAcknowledgementRepository.save.mockResolvedValue(
        new SubAcknowledgement(),
      );
      const result = await service.createProviderAcknowledgement(
        createProviderAcknowledgementDto,
      );
      expect(providerAcknowledgementRepository.save).toHaveBeenCalledWith(
        createProviderAcknowledgementDto,
      );
      expect(result).toEqual(new SubAcknowledgement());
    });
  });
});
