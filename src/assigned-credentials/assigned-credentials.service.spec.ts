import { Test, TestingModule } from '@nestjs/testing';
import { AssignedCredentialsService } from './assigned-credentials.service';
import { Provider } from '@/provider/entities/provider.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AssignedCredential } from './entities/assigned-credential.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateAssignedCredentialDto } from './dto/create-assigned-credential.dto';
import { Activity } from '@/activity/entities/activity.entity';

describe('AssignedCredentialsService', () => {
  let service: AssignedCredentialsService;
  let providerRepository: any;
  let assignedCredentialRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignedCredentialsService,
        {
          provide: getRepositoryToken(Provider),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AssignedCredential),
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Activity),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AssignedCredentialsService>(
      AssignedCredentialsService,
    );
    providerRepository = module.get<Repository<Provider>>(
      getRepositoryToken(Provider),
    );
    assignedCredentialRepository = module.get<Repository<AssignedCredential>>(
      getRepositoryToken(AssignedCredential),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const id = '1';
    const createAssignedCredentialDto = new CreateAssignedCredentialDto();
    createAssignedCredentialDto.credential_id = ['1'];
    it('should assign credentials successfully', async () => {
      assignedCredentialRepository.save.mockResolvedValue(
        new AssignedCredential(),
      );

      const result = await service.create(createAssignedCredentialDto, id);
      expect(assignedCredentialRepository.save).toHaveBeenCalled();
      expect(result).toEqual(new AssignedCredential());
    });
  });

  describe('findOneProviderWhere', () => {
    const option: FindOneOptions<Provider> = { where: { id: '1' } };
    it('should assign credentials successfully', async () => {
      providerRepository.findOne.mockResolvedValue(new AssignedCredential());

      const result = await service.findOneProviderWhere(option);
      expect(providerRepository.findOne).toHaveBeenCalledWith(option);
      expect(result).toEqual(new AssignedCredential());
    });
  });
});
