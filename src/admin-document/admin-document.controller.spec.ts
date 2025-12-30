import { Test, TestingModule } from '@nestjs/testing';
import { AdminDocumentController } from './admin-document.controller';
import { AdminDocumentService } from './admin-document.service';
import { CreateAdminDocumentDto } from './dto/create-admin-document.dto';
import { AdminDocument } from './entities/admin-document.entity';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { UpdateAdminDocumentDto } from './dto/update-admin-document.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { CATEGORY_TYPES } from '@/shared/constants/enum';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('AdminDocumentController', () => {
  let controller: AdminDocumentController;
  let adminDocumentService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminDocumentController],
      providers: [
        {
          provide: AdminDocumentService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOneWhere: jest.fn(),
            checkName: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            isAlreadyInUse: jest.fn(),
          },
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

    controller = module.get<AdminDocumentController>(AdminDocumentController);
    adminDocumentService =
      module.get<AdminDocumentService>(AdminDocumentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createAdminDocumentDto = new CreateAdminDocumentDto();
    it('should create new category', async () => {
      adminDocumentService.checkName.mockResolvedValue(new AdminDocument());

      const result = await controller.create(createAdminDocumentDto);
      expect(adminDocumentService.checkName).toHaveBeenCalledWith(
        createAdminDocumentDto.name,
        createAdminDocumentDto.category,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Category'),
          data: {},
        }),
      );
    });

    it('should create new category', async () => {
      adminDocumentService.checkName.mockResolvedValue(null);
      adminDocumentService.create.mockResolvedValue(new AdminDocument());

      const result = await controller.create(createAdminDocumentDto);
      expect(adminDocumentService.checkName).toHaveBeenCalledWith(
        createAdminDocumentDto.name,
        createAdminDocumentDto.category,
      );
      expect(adminDocumentService.create).toHaveBeenCalledWith(
        createAdminDocumentDto,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Category'),
          data: new AdminDocument(),
        }),
      );
    });

    it('should handle failure case while processing', async () => {
      const error = new Error('error');
      adminDocumentService.checkName.mockRejectedValue(error);

      const result = await controller.create(createAdminDocumentDto);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findAll', () => {
    it('should return success message with category list', async () => {
      adminDocumentService.findAll.mockResolvedValue([new AdminDocument()]);

      const result = await controller.findAll();
      expect(adminDocumentService.findAll).toHaveBeenCalledWith();
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Category'),
          data: [new AdminDocument()],
        }),
      );
    });

    it('should return not found if there was no record', async () => {
      adminDocumentService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();
      expect(adminDocumentService.findAll).toHaveBeenCalledWith();
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Category'),
          data: [],
        }),
      );
    });

    it('should handle failure case while processing', async () => {
      const error = new Error('error');
      adminDocumentService.findAll.mockRejectedValue(error);

      const result = await controller.findAll();
      expect(adminDocumentService.findAll).toHaveBeenCalledWith();
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('update', () => {
    const id = '1';
    const updateAdminDocumentDto = new UpdateAdminDocumentDto();
    it('should return bad request if category not found', async () => {
      adminDocumentService.findOneWhere.mockResolvedValue(null);

      const result = await controller.update(id, updateAdminDocumentDto);
      expect(adminDocumentService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Category'),
          data: {},
        }),
      );
    });

    it('should return not found if no record updated', async () => {
      const mockDocument = new AdminDocument();
      adminDocumentService.findOneWhere.mockResolvedValue(mockDocument);
      adminDocumentService.checkName.mockResolvedValue(new AdminDocument());

      const result = await controller.update(id, updateAdminDocumentDto);
      expect(adminDocumentService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(adminDocumentService.checkName).toHaveBeenCalledWith(
        mockDocument.name,
        mockDocument.category,
        mockDocument.id,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Category'),
          data: {},
        }),
      );
    });

    it('should return not found if no record updated', async () => {
      updateAdminDocumentDto.category = CATEGORY_TYPES.agency;
      updateAdminDocumentDto.name = 'test';
      const mockDocument = new AdminDocument();
      adminDocumentService.findOneWhere.mockResolvedValue(mockDocument);
      adminDocumentService.checkName.mockResolvedValue(null);
      adminDocumentService.update.mockResolvedValue({ affected: 0 });

      const result = await controller.update(id, updateAdminDocumentDto);
      expect(adminDocumentService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(adminDocumentService.checkName).toHaveBeenCalledWith(
        updateAdminDocumentDto.name,
        updateAdminDocumentDto.category,
        mockDocument.id,
      );
      expect(adminDocumentService.update).toHaveBeenCalledWith(
        { id },
        updateAdminDocumentDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Category'),
          data: {},
        }),
      );
    });

    it('should return update category successfully', async () => {
      const mockDocument = new AdminDocument();
      adminDocumentService.findOneWhere.mockResolvedValue(mockDocument);
      adminDocumentService.checkName.mockResolvedValue(null);
      adminDocumentService.update.mockResolvedValue({ affected: 1 });

      const result = await controller.update(id, updateAdminDocumentDto);
      expect(adminDocumentService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(adminDocumentService.checkName).toHaveBeenCalledWith(
        updateAdminDocumentDto.name,
        updateAdminDocumentDto.category,
        mockDocument.id,
      );
      expect(adminDocumentService.update).toHaveBeenCalledWith(
        { id },
        updateAdminDocumentDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Category'),
          data: {},
        }),
      );
    });

    it('should handle failure case while processing', async () => {
      const error = new Error('error');
      adminDocumentService.findOneWhere.mockRejectedValue(error);

      const result = await controller.update(id, updateAdminDocumentDto);
      expect(adminDocumentService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('remove', () => {
    const id = '1';
    const deleteDto = new DeleteDto();
    it('should return bad request if category not found', async () => {
      adminDocumentService.findOneWhere.mockResolvedValue(null);

      const result = await controller.remove(id, deleteDto);
      expect(adminDocumentService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Category'),
          data: {},
        }),
      );
    });

    it('should return not found if no record deleted', async () => {
      adminDocumentService.findOneWhere.mockResolvedValue(new AdminDocument());
      adminDocumentService.isAlreadyInUse.mockResolvedValue(false);
      adminDocumentService.remove.mockResolvedValue({ affected: 0 });

      const result = await controller.remove(id, deleteDto);
      expect(adminDocumentService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(adminDocumentService.remove).toHaveBeenCalledWith(
        { id },
        deleteDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Category'),
          data: {},
        }),
      );
    });

    it('should return remove category successfully', async () => {
      adminDocumentService.findOneWhere.mockResolvedValue(new AdminDocument());
      adminDocumentService.isAlreadyInUse.mockResolvedValue(false);
      adminDocumentService.remove.mockResolvedValue({ affected: 1 });

      const result = await controller.remove(id, deleteDto);
      expect(adminDocumentService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(adminDocumentService.remove).toHaveBeenCalledWith(
        { id },
        deleteDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_DELETED('Category'),
          data: {},
        }),
      );
    });

    it('should handle failure case while processing', async () => {
      const error = new Error('error');
      adminDocumentService.findOneWhere.mockRejectedValue(error);

      const result = await controller.remove(id, deleteDto);
      expect(adminDocumentService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
