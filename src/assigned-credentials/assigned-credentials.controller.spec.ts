import { Test, TestingModule } from '@nestjs/testing';
import { AssignedCredentialsController } from './assigned-credentials.controller';
import { AssignedCredentialsService } from './assigned-credentials.service';
import { CreateAssignedCredentialDto } from './dto/create-assigned-credential.dto';
import { Provider } from '@/provider/entities/provider.entity';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { AssignedCredential } from './entities/assigned-credential.entity';

describe('AssignedCredentialsController', () => {
  let controller: AssignedCredentialsController;
  let assignedCredentialsService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssignedCredentialsController],
      providers: [
        {
          provide: AssignedCredentialsService,
          useValue: {
            findOneProviderWhere: jest.fn(),
            create: jest.fn(),
            assignCredentialActivityLog: jest.fn(),
            assignCredentialActivityUpdateLog: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AssignedCredentialsController>(
      AssignedCredentialsController,
    );
    assignedCredentialsService = module.get<AssignedCredentialsService>(
      AssignedCredentialsService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('assignCredential', () => {
    const id = '1';
    const createAssignedCredentialDto = new CreateAssignedCredentialDto();
    const req: any = { user: { id: 'user1' } };
    it('should return bad request if provider not found', async () => {
      assignedCredentialsService.findOneProviderWhere.mockResolvedValue(null);

      const result = await controller.assignCredential(
        id,
        createAssignedCredentialDto,
        req,
      );
      expect(
        assignedCredentialsService.findOneProviderWhere,
      ).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        }),
      );
    });

    it('should return bad request if provider not found', async () => {
      const mockProvider = new Provider();
      assignedCredentialsService.findOneProviderWhere.mockResolvedValue(
        mockProvider,
      );
      assignedCredentialsService.create.mockResolvedValue(
        new AssignedCredential(),
      );

      const result = await controller.assignCredential(
        id,
        createAssignedCredentialDto,
        req,
      );
      expect(
        assignedCredentialsService.findOneProviderWhere,
      ).toHaveBeenCalledWith({ where: { id } });
      expect(assignedCredentialsService.create).toHaveBeenCalledWith(
        createAssignedCredentialDto,
        mockProvider.id,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Credential Assigned'),
          data: {},
        }),
      );
    });

    it('should return bad request if provider not found', async () => {
      const error = new Error('error');
      assignedCredentialsService.findOneProviderWhere.mockRejectedValue(error);

      const result = await controller.assignCredential(
        id,
        createAssignedCredentialDto,
        req,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
