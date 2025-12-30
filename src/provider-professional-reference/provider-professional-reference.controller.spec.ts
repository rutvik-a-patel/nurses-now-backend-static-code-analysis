import { Test, TestingModule } from '@nestjs/testing';
import { ProviderProfessionalReferenceController } from './provider-professional-reference.controller';
import { ProviderProfessionalReferenceService } from './provider-professional-reference.service';
import { ProviderProfessionalReference } from './entities/provider-professional-reference.entity';
import { CONSTANT } from '@/shared/constants/message';
import response from '@/shared/response';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { IsNull } from 'typeorm';
import { CreateProviderProfessionalReferenceDto } from './dto/create-provider-professional-reference.dto';
import { UpdateProviderProfessionalReferenceDto } from './dto/update-provider-professional-reference.dto';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';

// Mock the sendEmailHelper
jest.mock('@/shared/helpers/send-email-helper', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({}),
}));

describe('ProviderProfessionalReferenceController', () => {
  let controller: ProviderProfessionalReferenceController;
  let service: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProviderProfessionalReferenceController],
      providers: [
        {
          provide: ProviderProfessionalReferenceService,
          useValue: {
            findOneWhere: jest.fn(),
            remove: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            findOneReferenceForm: jest.fn(),
          },
        },
        {
          provide: EncryptDecryptService,
          useValue: {
            encrypt: jest.fn(),
            decrypt: jest.fn(),
          },
        },
        {
          provide: NotificationService,
          useValue: {},
        },
        {
          provide: FirebaseNotificationService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ProviderProfessionalReferenceController>(
      ProviderProfessionalReferenceController,
    );
    service = module.get<ProviderProfessionalReferenceService>(
      ProviderProfessionalReferenceService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    const id = '1';
    const req: any = { user: { id: '1' } };
    it('should return the reference if found', async () => {
      const data = new ProviderProfessionalReference();
      service.findOneWhere.mockResolvedValue(data);

      const result = await controller.findOne(id, req);

      expect(service.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: id,
          provider: {
            id: req.user.id,
          },
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Professional Reference'),
          data: data,
        }),
      );
    });

    it('should return a bad request if the reference is not found', async () => {
      const id = '2';
      service.findOneWhere.mockResolvedValue(null);

      const result = await controller.findOne(id, req);

      expect(service.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: id,
          provider: {
            id: req.user.id,
          },
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Professional Reference'),
          data: {},
        }),
      );
    });

    it('should handle errors during the retrieval process', async () => {
      const id = '3';
      const error = new Error('Database Error');
      service.findOneWhere.mockRejectedValue(error);

      const result = await controller.findOne(id, req);

      expect(service.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: id,
          provider: {
            id: req.user.id,
          },
        },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('remove', () => {
    const req: any = { user: { id: '1' } };
    const id = '1';
    const deleteDto = new DeleteDto();
    deleteDto.deleted_at_ip = '192.168.1.1';
    it('should return a success response when a reference is successfully deleted', async () => {
      service.remove.mockResolvedValue({ affected: 1 }); // Simulate successful deletion

      const result = await controller.remove(id, deleteDto, req);

      expect(service.remove).toHaveBeenCalledWith(
        {
          id: id,
          provider: {
            id: req.user.id,
          },
          deleted_at: IsNull(),
        },
        deleteDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_DELETED('Professional Reference'),
          data: {},
        }),
      );
    });

    it('should return a not found response when no reference is deleted', async () => {
      service.remove.mockResolvedValue({ affected: 0 }); // Simulate no records affected

      const result = await controller.remove(id, deleteDto, req);

      expect(service.remove).toHaveBeenCalledWith(
        {
          id: id,
          provider: {
            id: req.user.id,
          },
          deleted_at: IsNull(),
        },
        deleteDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Professional Reference'),
          data: {},
        }),
      );
    });

    it('should handle errors during the deletion process', async () => {
      const error = new Error('Database error');

      service.remove.mockRejectedValue(error); // Simulate an error

      const result = await controller.remove(id, deleteDto, req);

      expect(service.remove).toHaveBeenCalledWith(
        {
          id: id,
          provider: {
            id: req.user.id,
          },
          deleted_at: IsNull(),
        },
        deleteDto,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findAll', () => {
    const req: any = { user: { id: '1' } };
    it('should successfully retrieve reference', async () => {
      const mockData = Array(10).fill(new ProviderProfessionalReference());
      const mockCount = 10;

      service.findAll.mockResolvedValue([mockData, mockCount]); // Mock service response

      const result = await controller.findAll(req);

      expect(service.findAll).toHaveBeenCalledWith({
        where: {
          provider: {
            id: req.user.id,
          },
        },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Professional Reference'),
          data: mockData,
        }),
      );
    });

    it('should return no records found when there are no reference', async () => {
      service.findAll.mockResolvedValue([[], 0]);

      const result = await controller.findAll(req);
      expect(service.findAll).toHaveBeenCalledWith({
        where: {
          provider: {
            id: req.user.id,
          },
        },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Professional Reference'),
          data: [],
        }),
      );
    });

    it('should handle errors during the fetch process', async () => {
      const errorMessage = 'Database error';
      service.findAll.mockRejectedValue(new Error(errorMessage)); // Simulate an error

      const result = await controller.findAll(req);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('create', () => {
    const createProviderProfessionalReferenceDto =
      new CreateProviderProfessionalReferenceDto();
    createProviderProfessionalReferenceDto.email = 'test@example.com';
    createProviderProfessionalReferenceDto.mobile_no = '1234567890';
    createProviderProfessionalReferenceDto.name = 'Test Reference';
    createProviderProfessionalReferenceDto.send_form_by = 'email' as any;

    const req: any = {
      user: {
        id: '1',
        email: 'user@example.com',
        mobile_no: '0987654321',
      },
    };

    it('should successfully create a reference', async () => {
      // Mock the findOneReferenceForm call
      service.findOneReferenceForm.mockResolvedValue({
        id: 'reference-form-id',
      });

      const mockCreatedData = {
        id: '123',
        name: 'Test Reference',
        email: 'test@example.com',
        provider: { id: '1' }, // This will be deleted
      };
      service.create.mockResolvedValue(mockCreatedData);

      const result = await controller.create(
        createProviderProfessionalReferenceDto,
        req,
      );

      expect(service.findOneReferenceForm).toHaveBeenCalledWith({
        where: { status: DEFAULT_STATUS.active },
      });
      expect(service.create).toHaveBeenCalledWith(
        createProviderProfessionalReferenceDto,
      );

      // After calling delete data.provider, the result should not have provider property
      const expectedData = {
        id: '123',
        name: 'Test Reference',
        email: 'test@example.com',
      };

      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Professional Reference'),
          data: expectedData,
        }),
      );
    });

    it('should handle errors during reference creation', async () => {
      // Mock the findOneReferenceForm call
      service.findOneReferenceForm.mockResolvedValue({
        id: 'reference-form-id',
      });

      const error = new Error('Database Error');
      service.create.mockRejectedValue(error); // Simulate an error during the findOne operation

      const result = await controller.create(
        createProviderProfessionalReferenceDto,
        req,
      );

      expect(service.findOneReferenceForm).toHaveBeenCalledWith({
        where: { status: DEFAULT_STATUS.active },
      });
      expect(service.create).toHaveBeenCalledWith(
        createProviderProfessionalReferenceDto,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('update', () => {
    const id = '1';
    const updateProviderProfessionalReferenceDto =
      new UpdateProviderProfessionalReferenceDto();
    const req: any = { user: { id: '1' } };
    it('should return a bad request if the reference does not exist', async () => {
      service.findOneWhere.mockResolvedValue(null);

      const result = await controller.update(
        id,
        updateProviderProfessionalReferenceDto,
        req,
      );

      expect(service.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: id,
          provider: {
            id: req.user.id,
          },
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Professional Reference'),
          data: {},
        }),
      );
    });

    it('should successfully update the reference', async () => {
      service.findOneWhere.mockResolvedValueOnce(
        new ProviderProfessionalReference(),
      );

      service.update.mockResolvedValue({ affected: 1 });

      const result = await controller.update(
        id,
        updateProviderProfessionalReferenceDto,
        req,
      );

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Professional Reference'),
          data: {},
        }),
      );
    });

    it('should return an error if no records were updated', async () => {
      service.findOneWhere.mockResolvedValueOnce(
        new ProviderProfessionalReference(),
      );
      service.update.mockResolvedValue({ affected: 0 });

      const result = await controller.update(
        id,
        updateProviderProfessionalReferenceDto,
        req,
      );

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Professional Reference'),
          data: {},
        }),
      );
    });

    it('should handle errors during the update process', async () => {
      const id = '1';
      const error = new Error('Unexpected Error');

      service.findOneWhere.mockRejectedValue(error);

      const result = await controller.update(
        id,
        updateProviderProfessionalReferenceDto,
        req,
      );

      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
