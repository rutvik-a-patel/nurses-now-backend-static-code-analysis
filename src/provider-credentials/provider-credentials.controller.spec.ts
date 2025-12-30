import { Test, TestingModule } from '@nestjs/testing';
import { ProviderCredentialsController } from './provider-credentials.controller';
import { ProviderCredentialsService } from './provider-credentials.service';
import { ProviderCredential } from './entities/provider-credential.entity';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { CreateProviderCredentialDto } from './dto/create-provider-credential.dto';
import { UpdateProviderCredentialDto } from './dto/update-provider-credential.dto';
import { EDoc } from '@/e-docs/entities/e-doc.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Provider } from '@/provider/entities/provider.entity';
import { ProviderProfessionalReference } from '@/provider-professional-reference/entities/provider-professional-reference.entity';
import { ChatGateway } from '@/chat/chat.gateway';
import { ChatService } from '@/chat/chat.service';
import { Chat } from '@/chat/entities/chat.entity';
import { Department } from '@/department/entities/department.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { Media } from '@/media/entities/media.entity';
import { NotificationService } from '@/notification/notification.service';
import { Room } from '@/room/entities/room.entity';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import { Shift } from '@/shift/entities/shift.entity';
import { Token } from '@/token/entities/token.entity';
import { TokenService } from '@/token/token.service';
import { UserNotification } from '@/user-notification/entities/user-notification.entity';
import { UserNotificationService } from '@/user-notification/user-notification.service';
import { Notification } from '@/notification/entities/notification.entity';
import { Admin } from '@/admin/entities/admin.entity';
import { FacilityProviderService } from '@/facility-provider/facility-provider.service';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('ProviderCredentialsController', () => {
  let controller: ProviderCredentialsController;
  let providerCredentialsService: any;
  let _providerRepository: any;

  beforeEach(async () => {
    const providerCredentialsServiceMock = {
      create: jest.fn(),
      findOneWhere: jest.fn(),
      updateWhere: jest.fn(),
      getAllCredentialsCategory: jest.fn(),
      getOtherCredentialsData: jest.fn(),
      getOtherCredentialsCategory: jest.fn(),
      getEDocForProvider: jest.fn(),
      getCredentialsProgress: jest.fn().mockResolvedValue(1),
    };
    const providerRepositoryMock: any = {
      update: jest.fn().mockResolvedValue({}),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProviderCredentialsController],
      providers: [
        {
          provide: ProviderCredentialsService,
          useValue: providerCredentialsServiceMock,
        },
        {
          provide: getRepositoryToken(Provider),
          useValue: providerRepositoryMock,
        },
        {
          provide: getRepositoryToken(ProviderProfessionalReference),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Notification),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Token),
          useValue: {},
        },
        {
          provide: getRepositoryToken(UserNotification),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Chat),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Media),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Facility),
          useValue: {},
        },
        {
          provide: getRepositoryToken(FacilityUser),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Admin),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Department),
          useValue: {},
        },

        {
          provide: getRepositoryToken(Room),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Shift),
          useValue: {},
        },
        {
          provide: NotificationService,
          useValue: {},
        },
        {
          provide: FirebaseNotificationService,
          useValue: {},
        },
        {
          provide: TokenService,
          useValue: {},
        },
        {
          provide: UserNotificationService,
          useValue: {},
        },
        {
          provide: ChatGateway,
          useValue: {},
        },
        {
          provide: ChatService,
          useValue: {},
        },
        {
          provide: FacilityProviderService,
          useValue: {},
        },
        {
          provide: AccessControlGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
      ],
    })
      .overrideGuard(AccessControlGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get(ProviderCredentialsController);
    providerCredentialsService = module.get(ProviderCredentialsService);
    _providerRepository = module.get(getRepositoryToken(Provider));

    // All methods are already mocked in providerCredentialsServiceMock
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addCredentials', () => {
    const req: any = { user: { id: '1' } };
    const createProviderCredentialDto = new CreateProviderCredentialDto();
    it('should add new provider credential', async () => {
      const mockCredential = new ProviderCredential();
      providerCredentialsService.create.mockResolvedValue(mockCredential);

      const result = await controller.addCredentials(
        createProviderCredentialDto,
        req,
      );
      expect(providerCredentialsService.create).toHaveBeenCalledWith({
        ...createProviderCredentialDto,
        provider: req.user.id,
      });
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_ADDED('Credential'),
          data: mockCredential,
        }),
      );
    });

    it('should handle errors during creation', async () => {
      const error = new Error('Database Error');
      providerCredentialsService.create.mockRejectedValue(error);

      const result = await controller.addCredentials(
        createProviderCredentialDto,
        req,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getCredentialDetails', () => {
    const req: any = { user: { id: '1' } };
    const id = '1';
    const expectedSelect = {
      id: true,
      filename: true,
      original_filename: true,
      document_id: true,
      credential: true,
      license: true,
      issue_date: true,
      expiry_date: true,
      is_verified: true,
    };
    const expectedRelations = { credential: true };
    it('should return the credential if found', async () => {
      const mockCredential = new ProviderCredential();
      providerCredentialsService.findOneWhere.mockResolvedValue(mockCredential);
      const result = await controller.getCredentialDetails(id, req);
      expect(providerCredentialsService.findOneWhere).toHaveBeenCalledWith({
        relations: expectedRelations,
        where: {
          id: id,
          provider: {
            id: req.user.id,
          },
        },
        select: expectedSelect,
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Credential'),
          data: mockCredential,
        }),
      );
    });
    it('should return a bad request if the credential is not found', async () => {
      providerCredentialsService.findOneWhere.mockResolvedValue(null);
      const result = await controller.getCredentialDetails(id, req);
      expect(providerCredentialsService.findOneWhere).toHaveBeenCalledWith({
        relations: expectedRelations,
        where: {
          id: id,
          provider: {
            id: req.user.id,
          },
        },
        select: expectedSelect,
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Credential'),
          data: {},
        }),
      );
    });
    it('should handle errors during the retrieval process', async () => {
      const id = '3';
      const error = new Error('Database Error');
      providerCredentialsService.findOneWhere.mockRejectedValue(error);
      const result = await controller.getCredentialDetails(id, req);
      expect(providerCredentialsService.findOneWhere).toHaveBeenCalledWith({
        relations: expectedRelations,
        where: {
          id: id,
          provider: {
            id: req.user.id,
          },
        },
        select: expectedSelect,
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('updateCredential', () => {
    const req: any = { user: { id: '1' } };
    const id = '1';
    const updateProviderCredentialDto = new UpdateProviderCredentialDto();
    it('should return bad request if not credential found', async () => {
      providerCredentialsService.findOneWhere.mockResolvedValue(null);

      const result = await controller.updateCredential(
        id,
        req,
        updateProviderCredentialDto,
      );

      expect(providerCredentialsService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: id,
          provider: {
            id: req.user.id,
          },
        },
        relations: ['provider', 'credential'],
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Credential'),
          data: {},
        }),
      );
    });

    it('should return record not found if no credential updated', async () => {
      const mockCredential = {
        id: 'existing-id',
        provider: { id: '1' },
        credential: { id: 'cred-id' },
        name: 'existing name',
      };
      providerCredentialsService.findOneWhere.mockResolvedValue(mockCredential);
      providerCredentialsService.create.mockResolvedValue(null);

      const result = await controller.updateCredential(
        id,
        req,
        updateProviderCredentialDto,
      );

      expect(providerCredentialsService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: id,
          provider: {
            id: req.user.id,
          },
        },
        relations: ['provider', 'credential'],
      });
      const expectedPayload = {
        ...updateProviderCredentialDto,
        previous_document: mockCredential.id,
        provider: mockCredential.provider.id,
        credential: mockCredential.credential.id,
      };

      expect(providerCredentialsService.create).toHaveBeenCalledWith(
        expectedPayload,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Credential'),
          data: {},
        }),
      );
    });

    it('should return success message if credential updated', async () => {
      const mockCredential = {
        id: 'existing-id',
        provider: { id: '1' },
        credential: { id: 'cred-id' },
        name: 'existing name',
      };
      updateProviderCredentialDto.name = 'test';
      providerCredentialsService.findOneWhere.mockResolvedValue(mockCredential);
      providerCredentialsService.create.mockResolvedValue(mockCredential);

      const result = await controller.updateCredential(
        id,
        req,
        updateProviderCredentialDto,
      );

      expect(providerCredentialsService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: id,
          provider: {
            id: req.user.id,
          },
        },
        relations: ['provider', 'credential'],
      });
      const expectedPayload = {
        ...mockCredential,
        ...updateProviderCredentialDto,
        previous_document: mockCredential.id,
        provider: mockCredential.provider.id,
        credential: mockCredential.credential.id,
      };
      delete expectedPayload.id;
      expect(providerCredentialsService.create).toHaveBeenCalledWith(
        expectedPayload,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Credential'),
          data: {},
        }),
      );
    });

    it('should return success message if Education History updated', async () => {
      const error = new Error('Database error');
      providerCredentialsService.findOneWhere.mockRejectedValue(error);
      const result = await controller.updateCredential(
        id,
        req,
        updateProviderCredentialDto,
      );

      expect(providerCredentialsService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: id,
          provider: {
            id: req.user.id,
          },
        },
        relations: ['provider', 'credential'],
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getAllCredentialsCategory', () => {
    it('should return record not found if there is no any', async () => {
      const req: any = {
        user: {
          id: '1',
          certificate: { id: 'cert1' },
          speciality: { id: 'spec1' },
        },
      };
      providerCredentialsService.getAllCredentialsCategory.mockResolvedValue(
        null,
      );
      const result = await controller.getAllCredentialsCategory(req);
      expect(
        providerCredentialsService.getAllCredentialsCategory,
      ).toHaveBeenCalledWith(req.user);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Credential Categories'),
          data: [],
        }),
      );
    });
    it('should return all credential category list', async () => {
      const req: any = {
        user: {
          id: '1',
          certificate: { id: 'cert1' },
          speciality: { id: 'spec1' },
        },
      };
      const mockCredential = [new ProviderCredential()];
      providerCredentialsService.getAllCredentialsCategory.mockResolvedValue(
        mockCredential,
      );
      const result = await controller.getAllCredentialsCategory(req);
      expect(
        providerCredentialsService.getAllCredentialsCategory,
      ).toHaveBeenCalledWith(req.user);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Credential Categories'),
          data: mockCredential,
        }),
      );
    });
    it('should handle errors during creation', async () => {
      const req: any = {
        user: {
          id: '1',
          certificate: { id: 'cert1' },
          speciality: { id: 'spec1' },
        },
      };
      const error = new Error('Database Error');
      providerCredentialsService.getAllCredentialsCategory.mockRejectedValue(
        error,
      );
      const result = await controller.getAllCredentialsCategory(req);
      expect(result).toEqual(response.failureResponse(error));
    });
    it('should handle missing certificate gracefully', async () => {
      const req: any = {
        user: { id: '1' },
      };
      providerCredentialsService.getAllCredentialsCategory.mockResolvedValue(
        null,
      );
      const result = await controller.getAllCredentialsCategory(req);
      expect(
        providerCredentialsService.getAllCredentialsCategory,
      ).toHaveBeenCalledWith(req.user);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Credential Categories'),
          data: [],
        }),
      );
    });
  });

  describe('getAllCredentials', () => {
    const req: any = { user: { id: '1' } };
    it('should return record not found if there is no any', async () => {
      providerCredentialsService.getOtherCredentialsData.mockResolvedValue([]);

      const result = await controller.getAllCredentials(req);

      expect(
        providerCredentialsService.getOtherCredentialsData,
      ).toHaveBeenCalledWith(req.user.id);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Credentials'),
          data: [],
        }),
      );
    });

    it('should return all credential category list', async () => {
      const mockCredential = [new ProviderCredential()];
      providerCredentialsService.getOtherCredentialsData.mockResolvedValue(
        mockCredential,
      );

      const result = await controller.getAllCredentials(req);

      expect(
        providerCredentialsService.getOtherCredentialsData,
      ).toHaveBeenCalledWith(req.user.id);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Credentials'),
          data: mockCredential,
        }),
      );
    });

    it('should handle errors during creation', async () => {
      const error = new Error('Database Error');
      providerCredentialsService.getOtherCredentialsData.mockRejectedValue(
        error,
      );

      const result = await controller.getAllCredentials(req);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getOtherCredentials', () => {
    const search = 'test';
    it('should return record not found if there is no any', async () => {
      const req: any = {
        user: {
          id: '1',
          certificate: { id: 'cert1' },
          speciality: { id: '1' },
        },
      };
      providerCredentialsService.getOtherCredentialsCategory.mockResolvedValue(
        [],
      );
      const result = await controller.getOtherCredentials(req, search);
      expect(
        providerCredentialsService.getOtherCredentialsCategory,
      ).toHaveBeenCalledWith(req.user, search);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Other Credential'),
          data: [],
        }),
      );
    });
    it('should return all other credential category list', async () => {
      const req: any = {
        user: {
          id: '1',
          certificate: { id: 'cert1' },
          speciality: { id: '1' },
        },
      };
      const mockCredential = [new ProviderCredential()];
      providerCredentialsService.getOtherCredentialsCategory.mockResolvedValue(
        mockCredential,
      );
      const result = await controller.getOtherCredentials(req, search);
      expect(
        providerCredentialsService.getOtherCredentialsCategory,
      ).toHaveBeenCalledWith(req.user, search);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Other Credential'),
          data: mockCredential,
        }),
      );
    });
    it('should handle errors during creation', async () => {
      const req: any = {
        user: {
          id: '1',
          certificate: { id: 'cert1' },
          speciality: { id: '1' },
        },
      };
      const error = new Error('Database Error');
      providerCredentialsService.getOtherCredentialsCategory.mockRejectedValue(
        error,
      );
      const result = await controller.getOtherCredentials(req, search);
      expect(result).toEqual(response.failureResponse(error));
    });
    it('should handle missing certificate gracefully', async () => {
      const req: any = {
        user: { id: '1' },
        certificate: { id: 'cert1' },
        speciality: { id: '1' },
      };
      providerCredentialsService.getOtherCredentialsCategory.mockResolvedValue(
        [],
      );
      const result = await controller.getOtherCredentials(req, search);
      expect(
        providerCredentialsService.getOtherCredentialsCategory,
      ).toHaveBeenCalledWith(req.user, search);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Other Credential'),
          data: [],
        }),
      );
    });
    it('should handle missing search parameter', async () => {
      const req: any = {
        user: {
          id: '1',
          certificate: { id: 'cert1' },
          speciality: { id: '1' },
        },
      };
      providerCredentialsService.getOtherCredentialsCategory.mockResolvedValue(
        [],
      );
      const result = await controller.getOtherCredentials(req, undefined);
      expect(
        providerCredentialsService.getOtherCredentialsCategory,
      ).toHaveBeenCalledWith(req.user, undefined);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Other Credential'),
          data: [],
        }),
      );
    });
  });

  describe('getEDocForProvider', () => {
    const req: any = {
      user: {
        id: '1',
        certificate: { id: '1' },
        speciality: { id: '1' },
      },
    };
    it('should return bad request if data not found', async () => {
      providerCredentialsService.getEDocForProvider.mockResolvedValue([]);

      const result = await controller.getEDocForProvider(req);
      expect(
        providerCredentialsService.getEDocForProvider,
      ).toHaveBeenCalledWith(req.user);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('E Docs'),
          data: [],
        }),
      );
    });

    it('should return bad request if data not found', async () => {
      providerCredentialsService.getEDocForProvider.mockResolvedValue([
        new EDoc(),
      ]);

      const result = await controller.getEDocForProvider(req);
      expect(
        providerCredentialsService.getEDocForProvider,
      ).toHaveBeenCalledWith(req.user);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('E Docs'),
          data: [new EDoc()],
        }),
      );
    });

    it('should return bad request if data not found', async () => {
      const error = new Error('error');
      providerCredentialsService.getEDocForProvider.mockRejectedValue(error);

      const result = await controller.getEDocForProvider(req);
      expect(
        providerCredentialsService.getEDocForProvider,
      ).toHaveBeenCalledWith(req.user);
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
