import { Test, TestingModule } from '@nestjs/testing';
import { FacilityDocumentController } from './facility-document.controller';
import { FacilityDocumentService } from './facility-document.service';
import { CreateFacilityDocumentCategoryDto } from './dto/create-facility-document-category.dto';
import { FacilityDocumentCategory } from './entities/facility-document-category.entity';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { CreateFacilityDocumentDto } from './dto/create-facility-document.dto';
import { FacilityDocument } from './entities/facility-document.entity';
import { UpdateFacilityDocumentCategoryDto } from './dto/update-facility-document-category.dto';
import { UpdateFacilityDocumentDto } from './dto/update-facility-document.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';

describe('FacilityDocumentController', () => {
  let controller: FacilityDocumentController;
  let facilityDocumentService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacilityDocumentController],
      providers: [
        {
          provide: FacilityDocumentService,
          useValue: {
            checkCategoryName: jest.fn(),
            createCategory: jest.fn(),
            checkName: jest.fn(),
            create: jest.fn(),
            findAll: jest.fn(),
            findOneCategory: jest.fn(),
            updateCategory: jest.fn(),
            findOneDocument: jest.fn(),
            updateDocument: jest.fn(),
            removeCategory: jest.fn(),
            removeDocument: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FacilityDocumentController>(
      FacilityDocumentController,
    );
    facilityDocumentService = module.get<FacilityDocumentService>(
      FacilityDocumentService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createCategory', () => {
    const createFacilityDocumentCategoryDto =
      new CreateFacilityDocumentCategoryDto();
    it('should bad request if category already exist', async () => {
      facilityDocumentService.checkCategoryName.mockResolvedValue(
        new FacilityDocumentCategory(),
      );

      const result = await controller.createCategory(
        createFacilityDocumentCategoryDto,
      );
      expect(facilityDocumentService.checkCategoryName).toHaveBeenCalledWith(
        createFacilityDocumentCategoryDto.name,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Category'),
          data: {},
        }),
      );
    });
    it('should create new category successfully', async () => {
      facilityDocumentService.checkCategoryName.mockResolvedValue(null);
      facilityDocumentService.createCategory.mockResolvedValue(
        new FacilityDocumentCategory(),
      );

      const result = await controller.createCategory(
        createFacilityDocumentCategoryDto,
      );
      expect(facilityDocumentService.checkCategoryName).toHaveBeenCalledWith(
        createFacilityDocumentCategoryDto.name,
      );
      expect(facilityDocumentService.createCategory).toHaveBeenCalledWith(
        createFacilityDocumentCategoryDto,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Document Category'),
          data: new FacilityDocumentCategory(),
        }),
      );
    });

    it('should handle failure case while processing', async () => {
      const error = new Error('error');
      facilityDocumentService.checkCategoryName.mockRejectedValue(error);

      const result = await controller.createCategory(
        createFacilityDocumentCategoryDto,
      );
      expect(facilityDocumentService.checkCategoryName).toHaveBeenCalledWith(
        createFacilityDocumentCategoryDto.name,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('create', () => {
    const createFacilityDocumentDto = new CreateFacilityDocumentDto();
    it('should return bad request if document already exist', async () => {
      facilityDocumentService.checkName.mockResolvedValue(
        new FacilityDocument(),
      );

      const result = await controller.create(createFacilityDocumentDto);
      expect(facilityDocumentService.checkName).toHaveBeenCalledWith(
        createFacilityDocumentDto.name,
        createFacilityDocumentDto.facility_document_category,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Document'),
          data: {},
        }),
      );
    });

    it('should create new Document successfully', async () => {
      facilityDocumentService.checkName.mockResolvedValue(null);

      facilityDocumentService.create.mockResolvedValue(new FacilityDocument());

      const result = await controller.create(createFacilityDocumentDto);
      expect(facilityDocumentService.checkName).toHaveBeenCalledWith(
        createFacilityDocumentDto.name,
        createFacilityDocumentDto.facility_document_category,
      );
      expect(facilityDocumentService.create).toHaveBeenCalledWith(
        createFacilityDocumentDto,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Document'),
          data: new FacilityDocument(),
        }),
      );
    });

    it('should handle failure case while processing', async () => {
      const error = new Error('error');
      facilityDocumentService.checkName.mockRejectedValue(error);

      const result = await controller.create(createFacilityDocumentDto);
      expect(facilityDocumentService.checkName).toHaveBeenCalledWith(
        createFacilityDocumentDto.name,
        createFacilityDocumentDto.facility_document_category,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findAll', () => {
    it('should return success message with document list', async () => {
      facilityDocumentService.findAll.mockResolvedValue([
        new FacilityDocumentCategory(),
      ]);

      const result = await controller.findAll();
      expect(facilityDocumentService.findAll).toHaveBeenCalledWith({
        relations: {
          facility_document: true,
        },
        select: {
          id: true,
          name: true,
          created_at: true,
          facility_document: {
            id: true,
            name: true,
            is_required: true,
            created_at: true,
          },
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Documents'),
          data: [new FacilityDocument()],
        }),
      );
    });

    it('should return not found if there is no data', async () => {
      facilityDocumentService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();
      expect(facilityDocumentService.findAll).toHaveBeenCalledWith({
        relations: {
          facility_document: true,
        },
        select: {
          id: true,
          name: true,
          created_at: true,
          facility_document: {
            id: true,
            name: true,
            is_required: true,
            created_at: true,
          },
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Documents'),
          data: [],
        }),
      );
    });

    it('should handle failure case while processing', async () => {
      const error = new Error('error');
      facilityDocumentService.findAll.mockRejectedValue(error);

      const result = await controller.findAll();
      expect(facilityDocumentService.findAll).toHaveBeenCalledWith({
        relations: {
          facility_document: true,
        },
        select: {
          id: true,
          name: true,
          created_at: true,
          facility_document: {
            id: true,
            name: true,
            is_required: true,
            created_at: true,
          },
        },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('updateCategory', () => {
    const id = '1';
    const updateFacilityDocumentCategoryDto =
      new UpdateFacilityDocumentCategoryDto();
    it('should return bad request if record not found', async () => {
      facilityDocumentService.findOneCategory.mockResolvedValue(null);

      const result = await controller.updateCategory(
        id,
        updateFacilityDocumentCategoryDto,
      );
      expect(facilityDocumentService.findOneCategory).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Category'),
          data: {},
        }),
      );
    });

    it('should return bad request if record not found', async () => {
      facilityDocumentService.findOneCategory.mockResolvedValue(
        new FacilityDocumentCategory(),
      );
      const updateCategoryMock = new FacilityDocumentCategory();
      updateCategoryMock.id = '2';
      facilityDocumentService.checkCategoryName.mockResolvedValue(
        new FacilityDocumentCategory(),
      );

      const result = await controller.updateCategory(
        id,
        updateFacilityDocumentCategoryDto,
      );
      expect(facilityDocumentService.findOneCategory).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Category'),
          data: {},
        }),
      );
    });

    it('should return not found if record not updated', async () => {
      facilityDocumentService.findOneCategory.mockResolvedValue(
        new FacilityDocumentCategory(),
      );
      const updateCategoryMock = new FacilityDocumentCategory();
      updateCategoryMock.id = '1';
      facilityDocumentService.checkCategoryName.mockResolvedValue(
        updateCategoryMock,
      );
      facilityDocumentService.updateCategory.mockResolvedValue({ affected: 0 });

      const result = await controller.updateCategory(
        id,
        updateFacilityDocumentCategoryDto,
      );
      expect(facilityDocumentService.findOneCategory).toHaveBeenCalledWith({
        where: { id },
      });
      expect(facilityDocumentService.checkCategoryName).toHaveBeenCalledWith(
        updateFacilityDocumentCategoryDto.name,
      );
      expect(facilityDocumentService.updateCategory).toHaveBeenCalledWith(
        { id },
        updateFacilityDocumentCategoryDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Category'),
          data: {},
        }),
      );
    });

    it('should return success message if record updated', async () => {
      facilityDocumentService.findOneCategory.mockResolvedValue(
        new FacilityDocumentCategory(),
      );
      const updateCategoryMock = new FacilityDocumentCategory();
      updateCategoryMock.id = '1';
      facilityDocumentService.checkCategoryName.mockResolvedValue(
        updateCategoryMock,
      );
      facilityDocumentService.updateCategory.mockResolvedValue({ affected: 1 });

      const result = await controller.updateCategory(
        id,
        updateFacilityDocumentCategoryDto,
      );
      expect(facilityDocumentService.findOneCategory).toHaveBeenCalledWith({
        where: { id },
      });
      expect(facilityDocumentService.checkCategoryName).toHaveBeenCalledWith(
        updateFacilityDocumentCategoryDto.name,
      );
      expect(facilityDocumentService.updateCategory).toHaveBeenCalledWith(
        { id },
        updateFacilityDocumentCategoryDto,
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
      facilityDocumentService.findOneCategory.mockRejectedValue(error);

      const result = await controller.updateCategory(
        id,
        updateFacilityDocumentCategoryDto,
      );
      expect(facilityDocumentService.findOneCategory).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('update', () => {
    const id = '1';
    const updateFacilityDocumentDto = new UpdateFacilityDocumentDto();
    it('should return bad request if record not found', async () => {
      facilityDocumentService.findOneDocument.mockResolvedValue(null);

      const result = await controller.update(id, updateFacilityDocumentDto);
      expect(facilityDocumentService.findOneDocument).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Document'),
          data: {},
        }),
      );
    });

    it('should return bad request if record not found', async () => {
      facilityDocumentService.findOneDocument.mockResolvedValue(
        new FacilityDocument(),
      );
      const mockDocument = new FacilityDocument();
      mockDocument.id = '2';
      facilityDocumentService.checkName.mockResolvedValue(mockDocument);

      const result = await controller.update(id, updateFacilityDocumentDto);
      expect(facilityDocumentService.findOneDocument).toHaveBeenCalledWith({
        where: { id },
      });
      expect(facilityDocumentService.checkName).toHaveBeenCalledWith(
        updateFacilityDocumentDto.name,
        updateFacilityDocumentDto.facility_document_category,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Document'),
          data: {},
        }),
      );
    });

    it('should return not found if record not updated', async () => {
      facilityDocumentService.findOneDocument.mockResolvedValue(
        new FacilityDocument(),
      );
      const mockDocument = new FacilityDocument();
      mockDocument.id = '1';
      facilityDocumentService.checkName.mockResolvedValue(mockDocument);

      facilityDocumentService.updateDocument.mockResolvedValue({ affected: 0 });

      const result = await controller.update(id, updateFacilityDocumentDto);
      expect(facilityDocumentService.findOneDocument).toHaveBeenCalledWith({
        where: { id },
      });
      expect(facilityDocumentService.checkName).toHaveBeenCalledWith(
        updateFacilityDocumentDto.name,
        updateFacilityDocumentDto.facility_document_category,
      );
      expect(facilityDocumentService.updateDocument).toHaveBeenCalledWith(
        { id },
        updateFacilityDocumentDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Document'),
          data: {},
        }),
      );
    });

    it('should return success message if record updated', async () => {
      facilityDocumentService.findOneDocument.mockResolvedValue(
        new FacilityDocument(),
      );
      const mockDocument = new FacilityDocument();
      mockDocument.id = '1';
      facilityDocumentService.checkName.mockResolvedValue(mockDocument);

      facilityDocumentService.updateDocument.mockResolvedValue({ affected: 1 });

      const result = await controller.update(id, updateFacilityDocumentDto);
      expect(facilityDocumentService.findOneDocument).toHaveBeenCalledWith({
        where: { id },
      });
      expect(facilityDocumentService.checkName).toHaveBeenCalledWith(
        updateFacilityDocumentDto.name,
        updateFacilityDocumentDto.facility_document_category,
      );
      expect(facilityDocumentService.updateDocument).toHaveBeenCalledWith(
        { id },
        updateFacilityDocumentDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Document'),
          data: {},
        }),
      );
    });

    it('should handle failure case while processing', async () => {
      const error = new Error('error');
      facilityDocumentService.findOneDocument.mockRejectedValue(error);

      const result = await controller.update(id, updateFacilityDocumentDto);
      expect(facilityDocumentService.findOneDocument).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('removeCategory', () => {
    const id = '1';
    const deleteDto = new DeleteDto();
    it('should return bad request if record not found', async () => {
      facilityDocumentService.findOneCategory.mockResolvedValue(null);

      const result = await controller.removeCategory(id, deleteDto);
      expect(facilityDocumentService.findOneCategory).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Category'),
          data: {},
        }),
      );
    });

    it('should return not found if record not deleted', async () => {
      facilityDocumentService.findOneCategory.mockResolvedValue(
        new FacilityDocumentCategory(),
      );
      facilityDocumentService.removeCategory.mockResolvedValue({ affected: 0 });

      const result = await controller.removeCategory(id, deleteDto);
      expect(facilityDocumentService.findOneCategory).toHaveBeenCalledWith({
        where: { id },
      });
      expect(facilityDocumentService.removeCategory).toHaveBeenCalledWith(
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

    it('should return success message if record deleted', async () => {
      facilityDocumentService.findOneCategory.mockResolvedValue(
        new FacilityDocumentCategory(),
      );
      facilityDocumentService.removeCategory.mockResolvedValue({ affected: 1 });

      const result = await controller.removeCategory(id, deleteDto);
      expect(facilityDocumentService.findOneCategory).toHaveBeenCalledWith({
        where: { id },
      });
      expect(facilityDocumentService.removeCategory).toHaveBeenCalledWith(
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
      facilityDocumentService.findOneCategory.mockRejectedValue(error);

      const result = await controller.removeCategory(id, deleteDto);
      expect(facilityDocumentService.findOneCategory).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('remove', () => {
    const id = '1';
    const deleteDto = new DeleteDto();
    it('should return bad request if record not found', async () => {
      facilityDocumentService.findOneDocument.mockResolvedValue(null);

      const result = await controller.remove(id, deleteDto);
      expect(facilityDocumentService.findOneDocument).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Document'),
          data: {},
        }),
      );
    });

    it('should return not found if record not deleted', async () => {
      facilityDocumentService.findOneDocument.mockResolvedValue(
        new FacilityDocument(),
      );
      facilityDocumentService.removeDocument.mockResolvedValue({ affected: 0 });

      const result = await controller.remove(id, deleteDto);
      expect(facilityDocumentService.findOneDocument).toHaveBeenCalledWith({
        where: { id },
      });
      expect(facilityDocumentService.removeDocument).toHaveBeenCalledWith(
        { id },
        deleteDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Document'),
          data: {},
        }),
      );
    });

    it('should return success message if record deleted', async () => {
      facilityDocumentService.findOneDocument.mockResolvedValue(
        new FacilityDocument(),
      );
      facilityDocumentService.removeDocument.mockResolvedValue({ affected: 1 });

      const result = await controller.remove(id, deleteDto);
      expect(facilityDocumentService.findOneDocument).toHaveBeenCalledWith({
        where: { id },
      });
      expect(facilityDocumentService.removeDocument).toHaveBeenCalledWith(
        { id },
        deleteDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_DELETED('Document'),
          data: {},
        }),
      );
    });

    it('should handle failure case while processing', async () => {
      const error = new Error('error');
      facilityDocumentService.findOneDocument.mockRejectedValue(error);

      const result = await controller.remove(id, deleteDto);
      expect(facilityDocumentService.findOneDocument).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
