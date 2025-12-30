import { Test, TestingModule } from '@nestjs/testing';
import { ReferenceFormDesignController } from './reference-form-design.controller';
import { ReferenceFormDesignService } from './reference-form-design.service';
import { ReferenceFormDesign } from './entities/reference-form-design.entity';
import { ReferenceForm } from './entities/reference-form.entity';
import { CreateReferenceFormDto } from './dto/create-reference-form-design.dto';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { UpdateReferenceFormDto } from './dto/update-reference-form-design.dto';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('ReferenceFormDesignController', () => {
  let controller: ReferenceFormDesignController;
  let referenceFormDesignService: any;

  beforeEach(async () => {
    const referenceFormDesignServiceMock = {
      createReferenceForm: jest.fn(),
      createReferenceFormDesign: jest.fn(),
      findOneWhere: jest.fn(),
      updateReferenceForm: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findAll: jest.fn(),
      isFormInUse: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReferenceFormDesignController],
      providers: [
        {
          provide: ReferenceFormDesignService,
          useValue: referenceFormDesignServiceMock,
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

    controller = module.get<ReferenceFormDesignController>(
      ReferenceFormDesignController,
    );
    referenceFormDesignService = module.get<ReferenceFormDesignService>(
      ReferenceFormDesignService,
    );

    referenceFormDesignService.findOneWhere = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof referenceFormDesignService.findOneWhere
    >;
    referenceFormDesignService.createReferenceForm = jest
      .fn()
      .mockResolvedValue(new ReferenceForm()) as jest.MockedFunction<
      typeof referenceFormDesignService.createReferenceForm
    >;
    referenceFormDesignService.createReferenceFormDesign = jest
      .fn()
      .mockResolvedValue(new ReferenceFormDesign()) as jest.MockedFunction<
      typeof referenceFormDesignService.createReferenceFormDesign
    >;
    referenceFormDesignService.updateReferenceForm = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof referenceFormDesignService.updateReferenceForm
    >;
    referenceFormDesignService.update = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof referenceFormDesignService.update
    >;
    referenceFormDesignService.findAll = jest
      .fn()
      .mockResolvedValue([[new ReferenceForm()], 1]) as jest.MockedFunction<
      typeof referenceFormDesignService.findAll
    >;
    referenceFormDesignService.remove = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof referenceFormDesignService.remove
    >;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create new reference form design', async () => {
      const createReferenceFormDto = new CreateReferenceFormDto();
      const mockDesign = new ReferenceForm();
      const mockForm = createReferenceFormDto.reference_form;
      referenceFormDesignService.createReferenceForm.mockResolvedValue(
        mockDesign,
      );

      const result = await controller.create(createReferenceFormDto);
      expect(
        referenceFormDesignService.createReferenceForm,
      ).toHaveBeenCalledWith(createReferenceFormDto);
      expect(
        referenceFormDesignService.createReferenceFormDesign,
      ).toHaveBeenCalledWith(mockDesign, mockForm);
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Reference Form'),
          data: mockDesign,
        }),
      );
    });

    it('should handle errors during creation', async () => {
      const createReferenceFormDto = new CreateReferenceFormDto();
      const error = new Error('Database Error');
      referenceFormDesignService.createReferenceForm.mockRejectedValue(error);

      const result = await controller.create(createReferenceFormDto);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('update', () => {
    const id = '1';
    it('should return bad request if reference form not found', async () => {
      const updateReferenceFormDto = new UpdateReferenceFormDto();
      referenceFormDesignService.findOneWhere.mockResolvedValue(null);

      const result = await controller.updateReferenceForm(
        id,
        updateReferenceFormDto,
      );

      expect(referenceFormDesignService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Reference Form'),
          data: {},
        }),
      );
    });

    it('should return success message if form updated', async () => {
      const updateReferenceFormDto = new UpdateReferenceFormDto();
      updateReferenceFormDto.name = 'Updated Form Name';
      const mockForm = new ReferenceForm();
      referenceFormDesignService.findOneWhere.mockResolvedValueOnce(mockForm);

      referenceFormDesignService.updateReferenceForm.mockResolvedValue(
        undefined,
      );

      const result = await controller.updateReferenceForm(
        id,
        updateReferenceFormDto,
      );

      expect(referenceFormDesignService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(
        referenceFormDesignService.updateReferenceForm,
      ).toHaveBeenCalledWith(mockForm, updateReferenceFormDto);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Reference Form'),
          data: {},
        }),
      );
    });

    it('should handle errors during process', async () => {
      const updateReferenceFormDto = new UpdateReferenceFormDto();
      const error = new Error('Database error');
      referenceFormDesignService.findOneWhere.mockRejectedValue(error);
      const result = await controller.updateReferenceForm(
        id,
        updateReferenceFormDto,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findOne', () => {
    const id = '1';
    it('should return the Reference Form if found', async () => {
      const mockDesign = new ReferenceForm();

      referenceFormDesignService.findOneWhere.mockResolvedValue(mockDesign);

      const result = await controller.findOne(id);

      expect(referenceFormDesignService.findOneWhere).toHaveBeenCalledWith({
        relations: {
          reference_form_design: {
            reference_form_option: true,
          },
        },
        where: { id: id },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Reference Form'),
          data: mockDesign,
        }),
      );
    });

    it('should return a bad request if the Reference Form is not found', async () => {
      referenceFormDesignService.findOneWhere.mockResolvedValue(null);

      const result = await controller.findOne(id);

      expect(referenceFormDesignService.findOneWhere).toHaveBeenCalledWith({
        relations: {
          reference_form_design: {
            reference_form_option: true,
          },
        },
        where: { id: id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Reference Form'),
          data: {},
        }),
      );
    });

    it('should handle errors during the retrieval process', async () => {
      const error = new Error('Database Error');
      referenceFormDesignService.findOneWhere.mockRejectedValue(error);

      const result = await controller.findOne(id);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findAll', () => {
    const queryParamsDto = new QueryParamsDto();
    it('should successfully retrieve Reference Form', async () => {
      const mockDesign = Array(10).fill(new ReferenceForm());
      const mockCount = 10;

      referenceFormDesignService.findAll.mockResolvedValue([
        mockDesign,
        mockCount,
      ]); // Mock service response

      const result = await controller.findAll(queryParamsDto);

      expect(referenceFormDesignService.findAll).toHaveBeenCalledWith(
        queryParamsDto,
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Reference Form'),
          total: mockCount,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: mockDesign,
        }),
      );
    });

    it('should return no records found when there are no Reference Form', async () => {
      referenceFormDesignService.findAll.mockResolvedValue([[], 0]);

      const result = await controller.findAll(queryParamsDto);
      expect(referenceFormDesignService.findAll).toHaveBeenCalledWith(
        queryParamsDto,
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Reference Form'),
          total: 0,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: [],
        }),
      );
    });

    it('should handle errors during the fetch process', async () => {
      const errorMessage = 'Database error';
      referenceFormDesignService.findAll.mockRejectedValue(
        new Error(errorMessage),
      ); // Simulate an error

      const result = await controller.findAll(queryParamsDto);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('remove', () => {
    const id = '1';
    it('should return bad request if Reference Form not found', async () => {
      referenceFormDesignService.findOneWhere.mockResolvedValue(null);
      const result = await controller.deleteReferenceForm(id);

      expect(referenceFormDesignService.findOneWhere).toHaveBeenCalledWith({
        relations: {
          reference_form_design: {
            reference_form_option: true,
          },
        },
        where: { id: id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Reference Form'),
          data: {},
        }),
      );
    });

    it('should return success message when Reference Form deleted', async () => {
      const mockForm = new ReferenceForm();

      referenceFormDesignService.findOneWhere.mockResolvedValue(mockForm);
      referenceFormDesignService.isFormInUse.mockResolvedValue(false);
      referenceFormDesignService.remove.mockResolvedValue({ affected: 1 });

      const result = await controller.deleteReferenceForm(id);

      expect(referenceFormDesignService.findOneWhere).toHaveBeenCalledWith({
        relations: {
          reference_form_design: {
            reference_form_option: true,
          },
        },
        where: { id: id },
      });
      expect(referenceFormDesignService.remove).toHaveBeenCalledWith(mockForm);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_DELETED('Reference Form'),
          data: {},
        }),
      );
    });

    it('should handle errors during the deletion process', async () => {
      const error = new Error('Database error');

      referenceFormDesignService.findOneWhere.mockRejectedValue(error); // Simulate an error

      const result = await controller.deleteReferenceForm(id);

      expect(result).toEqual(response.failureResponse(error));
    });
  });
});
