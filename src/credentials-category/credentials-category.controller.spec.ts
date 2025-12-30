import { Test, TestingModule } from '@nestjs/testing';
import { CredentialsCategoryController } from './credentials-category.controller';
import { CredentialsCategoryService } from './credentials-category.service';
import { CredentialsCategory } from './entities/credentials-category.entity';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { UpdateCredentialsCategoryDto } from './dto/update-credentials-category.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { CreateCredentialsCategoryDto } from './dto/create-credentials-category.dto';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('CredentialsCategoryController', () => {
  let controller: CredentialsCategoryController;
  let credentialsCategoryService: any;

  beforeEach(async () => {
    const credentialsCategoryServiceMock = {
      create: jest.fn(),
      findOneWhere: jest.fn(),
      update: jest.fn(),
      checkRequirementExist: jest.fn(),
      remove: jest.fn(),
      findAll: jest.fn(),
      checkName: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CredentialsCategoryController],
      providers: [
        {
          provide: CredentialsCategoryService,
          useValue: credentialsCategoryServiceMock,
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

    controller = module.get<CredentialsCategoryController>(
      CredentialsCategoryController,
    );
    credentialsCategoryService = module.get<CredentialsCategoryService>(
      CredentialsCategoryService,
    );

    credentialsCategoryService.findOneWhere = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof credentialsCategoryService.findOneWhere
    >;
    credentialsCategoryService.create = jest
      .fn()
      .mockResolvedValue(new CredentialsCategory()) as jest.MockedFunction<
      typeof credentialsCategoryService.create
    >;
    credentialsCategoryService.update = jest
      .fn()
      .mockResolvedValue({ affected: 1 }) as jest.MockedFunction<
      typeof credentialsCategoryService.update
    >;
    credentialsCategoryService.findAll = jest
      .fn()
      .mockResolvedValue([
        [new CredentialsCategory()],
        1,
      ]) as jest.MockedFunction<typeof credentialsCategoryService.findAll>;
    credentialsCategoryService.remove = jest
      .fn()
      .mockResolvedValue({ affected: 1 }) as jest.MockedFunction<
      typeof credentialsCategoryService.remove
    >;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createCredentialsCategoryDto = new CreateCredentialsCategoryDto();
    createCredentialsCategoryDto.name = 'Test Certificate';
    it('should return a bad request if the certificate already exists', async () => {
      credentialsCategoryService.checkName.mockResolvedValue(
        new CredentialsCategory(),
      ); // Simulate finding an existing certificate

      const result = await controller.create(createCredentialsCategoryDto);

      expect(credentialsCategoryService.checkName).toHaveBeenCalledWith(
        createCredentialsCategoryDto.name,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Credential Category'),
          data: {},
        }),
      );
    });

    it('should create provider credential category', async () => {
      const mockCategory = new CredentialsCategory();
      credentialsCategoryService.checkName.mockResolvedValue(null);

      credentialsCategoryService.create.mockResolvedValue(mockCategory);

      const result = await controller.create(createCredentialsCategoryDto);
      expect(credentialsCategoryService.checkName).toHaveBeenCalledWith(
        createCredentialsCategoryDto.name,
      );
      expect(credentialsCategoryService.create).toHaveBeenCalledWith(
        createCredentialsCategoryDto,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Credential Category'),
          data: mockCategory,
        }),
      );
    });

    it('should handle errors during creation', async () => {
      const error = new Error('Database Error');
      credentialsCategoryService.checkName.mockRejectedValue(error);

      const result = await controller.create(createCredentialsCategoryDto);
      expect(credentialsCategoryService.checkName).toHaveBeenCalledWith(
        createCredentialsCategoryDto.name,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findOne', () => {
    const id = '1';
    it('should return the Credential Category if found', async () => {
      const mockCategory = new CredentialsCategory();

      credentialsCategoryService.findOneWhere.mockResolvedValue(mockCategory);

      const result = await controller.findOne(id);

      expect(credentialsCategoryService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Credential Category'),
          data: mockCategory,
        }),
      );
    });

    it('should return a bad request if the Credential Category is not found', async () => {
      credentialsCategoryService.findOneWhere.mockResolvedValue(null);

      const result = await controller.findOne(id);

      expect(credentialsCategoryService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Credential Category'),
          data: {},
        }),
      );
    });

    it('should handle errors during the retrieval process', async () => {
      const error = new Error('Database Error');
      credentialsCategoryService.findOneWhere.mockRejectedValue(error);

      const result = await controller.findOne(id);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('update', () => {
    const id = '1';
    it('should return bad request if not Credential Category found', async () => {
      const updateCredentialsCategoryDto = new UpdateCredentialsCategoryDto();
      credentialsCategoryService.findOneWhere.mockResolvedValue(null);

      const result = await controller.update(id, updateCredentialsCategoryDto);

      expect(credentialsCategoryService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Credential Category'),
          data: {},
        }),
      );
    });

    it('should return record not found if no Credential Category updated', async () => {
      const updateCredentialsCategoryDto = new UpdateCredentialsCategoryDto();
      const mockRejectReason = new CredentialsCategory();
      credentialsCategoryService.findOneWhere.mockResolvedValue(
        mockRejectReason,
      );
      credentialsCategoryService.checkName.mockResolvedValueOnce(null);
      credentialsCategoryService.update.mockResolvedValue({ affected: 0 });

      const result = await controller.update(id, updateCredentialsCategoryDto);

      expect(credentialsCategoryService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(credentialsCategoryService.checkName).toHaveBeenCalledWith(
        updateCredentialsCategoryDto.name,
      );
      expect(credentialsCategoryService.update).toHaveBeenCalledWith(
        id,
        updateCredentialsCategoryDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Credential Category'),
          data: {},
        }),
      );
    });

    it('should return success message if Credential Category updated', async () => {
      const updateCredentialsCategoryDto = new UpdateCredentialsCategoryDto();
      const mockRejectReason = new CredentialsCategory();
      credentialsCategoryService.findOneWhere.mockResolvedValue(
        mockRejectReason,
      );
      credentialsCategoryService.update.mockResolvedValue({ affected: 1 });

      const result = await controller.update(id, updateCredentialsCategoryDto);

      expect(credentialsCategoryService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(credentialsCategoryService.update).toHaveBeenCalledWith(
        id,
        updateCredentialsCategoryDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Credential Category'),
          data: {},
        }),
      );
    });

    it('should return a bad request if another certificate with the same name exists', async () => {
      const id = '1';
      const updateCredentialsCategoryDto = new UpdateCredentialsCategoryDto();
      updateCredentialsCategoryDto.name = 'Existing Name';

      credentialsCategoryService.findOneWhere.mockResolvedValueOnce(
        new CredentialsCategory(),
      ); // Mock finding the CredentialsCategory to update
      credentialsCategoryService.checkName.mockResolvedValueOnce(
        new CredentialsCategory(),
      ); // Mock finding another certificate with the same name

      const result = await controller.update(id, updateCredentialsCategoryDto);

      expect(credentialsCategoryService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: id,
        },
      });

      expect(credentialsCategoryService.checkName).toHaveBeenCalledWith(
        updateCredentialsCategoryDto.name,
      );

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Credential Category'),
          data: {},
        }),
      );
    });

    it('should return success message if Credential Category updated', async () => {
      const updateCredentialsCategoryDto = new UpdateCredentialsCategoryDto();
      const error = new Error('Database error');
      credentialsCategoryService.findOneWhere.mockRejectedValue(error);
      const result = await controller.update(id, updateCredentialsCategoryDto);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('remove', () => {
    const id = '1';
    it('should return a success response when a Credential Category is successfully deleted', async () => {
      const deleteDto = new DeleteDto();
      deleteDto.deleted_at_ip = '127.0.0.1';

      credentialsCategoryService.checkRequirementExist.mockResolvedValue(true);

      const result = await controller.remove(id, deleteDto);

      expect(
        credentialsCategoryService.checkRequirementExist,
      ).toHaveBeenCalledWith(id);
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.CANNOT_DELETE('Category'),
          data: {},
        }),
      );
    });

    it('should return a not found response when no Credential Category is deleted', async () => {
      const deleteDto = new DeleteDto();
      deleteDto.deleted_at_ip = '127.0.0.1';

      credentialsCategoryService.checkRequirementExist.mockResolvedValue(false);
      credentialsCategoryService.remove.mockResolvedValue({ affected: 0 }); // Simulate no records affected

      const result = await controller.remove(id, deleteDto);

      expect(
        credentialsCategoryService.checkRequirementExist,
      ).toHaveBeenCalledWith(id);

      expect(credentialsCategoryService.remove).toHaveBeenCalledWith(
        id,
        deleteDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Credential Category'),
          data: {},
        }),
      );
    });

    it('should return a not found response when no Credential Category is deleted', async () => {
      const deleteDto = new DeleteDto();
      deleteDto.deleted_at_ip = '127.0.0.1';

      credentialsCategoryService.checkRequirementExist.mockResolvedValue(false);
      credentialsCategoryService.remove.mockResolvedValue({ affected: 1 }); // Simulate no records affected

      const result = await controller.remove(id, deleteDto);

      expect(
        credentialsCategoryService.checkRequirementExist,
      ).toHaveBeenCalledWith(id);

      expect(credentialsCategoryService.remove).toHaveBeenCalledWith(
        id,
        deleteDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_DELETED('Credential Category'),
          data: {},
        }),
      );
    });

    it('should handle errors during the deletion process', async () => {
      const deleteDto = new DeleteDto();
      deleteDto.deleted_at_ip = '127.0.0.1';
      const error = new Error('Database error');

      credentialsCategoryService.remove.mockRejectedValue(error); // Simulate an error

      const result = await controller.remove(id, deleteDto);

      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
