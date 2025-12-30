import { Test, TestingModule } from '@nestjs/testing';
import { ReferenceFormDesignService } from './reference-form-design.service';
import { ReferenceFormDesign } from './entities/reference-form-design.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReferenceFormOption } from '@/reference-form-option/entities/reference-form-option.entity';
import { ReferenceForm } from './entities/reference-form.entity';
import { Repository } from 'typeorm';
import {
  CreateOptionDto,
  CreateReferenceFormDesignDto,
  CreateReferenceFormDto,
} from './dto/create-reference-form-design.dto';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import parseSearchKeyword from '@/shared/helpers/parse-search-keyword';
import {
  UpdateOptionDto,
  UpdateReferenceFormDesignDto,
  UpdateReferenceFormDto,
} from './dto/update-reference-form-design.dto';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { ProviderProfessionalReference } from '@/provider-professional-reference/entities/provider-professional-reference.entity';

describe('ReferenceFormDesignService', () => {
  let service: ReferenceFormDesignService;
  let referenceFormDesignRepository: any;
  let referenceFormOptionRepository: any;
  let referenceFormRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferenceFormDesignService,
        {
          provide: getRepositoryToken(ReferenceFormDesign),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            softRemove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ReferenceFormOption),
          useValue: {
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProviderProfessionalReference),
          useValue: {
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ReferenceForm),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            softRemove: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              addOrderBy: jest.fn().mockReturnThis(),
              getCount: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              offset: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              getRawMany: jest.fn().mockResolvedValue([new ReferenceForm()]),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<ReferenceFormDesignService>(
      ReferenceFormDesignService,
    );

    referenceFormDesignRepository = module.get<Repository<ReferenceFormDesign>>(
      getRepositoryToken(ReferenceFormDesign),
    );
    referenceFormOptionRepository = module.get<Repository<ReferenceFormOption>>(
      getRepositoryToken(ReferenceFormOption),
    );
    referenceFormRepository = module.get<Repository<ReferenceForm>>(
      getRepositoryToken(ReferenceForm),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createReferenceForm', () => {
    it('should create a reference form', async () => {
      const createDto = new CreateReferenceFormDto();
      const mockForm = new ReferenceForm();
      referenceFormRepository.save.mockResolvedValue(mockForm);

      const result = await service.createReferenceForm(createDto);

      expect(referenceFormRepository.save).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockForm);
    });
  });

  describe('createReferenceFormSection', () => {
    it('should create a reference form section', async () => {
      const createDto = new CreateReferenceFormDesignDto();
      const mockForm = new ReferenceFormDesign();
      referenceFormDesignRepository.save.mockResolvedValue(mockForm);

      const result = await service.createReferenceFormSection(createDto);

      expect(referenceFormDesignRepository.save).toHaveBeenCalledWith(
        createDto,
      );
      expect(result).toEqual(mockForm);
    });
  });

  describe('findOneWhere', () => {
    it('should find one form', async () => {
      const option = { where: { id: '1' } };
      const mockForm = new ReferenceForm();
      referenceFormRepository.findOne.mockResolvedValue(mockForm);

      const result = await service.findOneWhere(option);

      expect(referenceFormRepository.findOne).toHaveBeenCalledWith(option);
      expect(result).toEqual(mockForm);
    });
  });

  describe('getAllContacts', () => {
    let mockQueryBuilder;
    beforeEach(() => {
      mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([new ReferenceForm()]),
      };

      // Setup mock for createQueryBuilder to return the mock query builder
      referenceFormRepository.createQueryBuilder = jest.fn(
        () => mockQueryBuilder,
      );
    });

    it('should return all forms based on query parameters without search', async () => {
      const queryParams = new QueryParamsDto(); // No search parameter set
      queryParams.order = { created: 'ASC' };
      const mockForms = [new ReferenceForm(), new ReferenceForm()]; // Ensure this matches your expected output
      const count = mockForms.length;
      mockQueryBuilder.getRawMany.mockResolvedValue(mockForms);
      mockQueryBuilder.getCount.mockResolvedValue(count);

      const result = await service.findAll(queryParams);

      expect(result).toEqual([mockForms, count]);
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
      expect(mockQueryBuilder.where).not.toHaveBeenCalled(); // Ensure 'where' was not called since no search param
    });

    it('should apply search filter when search parameter is provided', async () => {
      const queryParams = new QueryParamsDto();
      queryParams.order = { total_questions: 'ASC' };
      queryParams.search = 'test'; // Setting a search parameter
      const mockForms = [new ReferenceForm(), new ReferenceForm()];
      const count = mockForms.length;
      mockQueryBuilder.getRawMany.mockResolvedValue(mockForms);
      mockQueryBuilder.getCount.mockResolvedValue(count);

      await service.findAll(queryParams);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        `LOWER(rf.name) ILIKE :search`,
        { search: `%${parseSearchKeyword(queryParams.search)}%` },
      );
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove reference form', async () => {
      const mockForm = new ReferenceForm();
      referenceFormRepository.softRemove.mockResolvedValue(mockForm);

      const result = await service.remove(mockForm);

      expect(referenceFormRepository.softRemove).toHaveBeenCalledWith(mockForm);
      expect(result).toEqual(mockForm);
    });
  });

  describe('createOption', () => {
    it('should create a option', async () => {
      const createDto = [new CreateOptionDto()];
      const mockForm = [new ReferenceFormOption()];
      referenceFormOptionRepository.save.mockResolvedValue(mockForm);

      const result = await service.createOption(createDto);

      expect(referenceFormOptionRepository.save).toHaveBeenCalledWith(
        createDto,
      );
      expect(result).toEqual(mockForm);
    });
  });

  describe('createReferenceFormDesign', () => {
    it('should create a reference form design with options', async () => {
      const createDto = new CreateReferenceFormDesignDto();
      const mockForm = new ReferenceForm();

      // Mock the createReferenceFormSection to return an object with an id
      const mockReferenceFormSection = new ReferenceFormDesign();
      jest
        .spyOn(service, 'createReferenceFormSection')
        .mockResolvedValue(mockReferenceFormSection);

      const mockOptionResult = new ReferenceFormOption();
      referenceFormOptionRepository.save.mockResolvedValue(mockOptionResult);

      await service.createReferenceFormDesign(mockForm, [createDto]);

      expect(service.createReferenceFormSection).toHaveBeenCalledWith(
        expect.objectContaining({
          reference_form: mockForm.id,
          ...createDto,
        }),
      );
      expect(referenceFormOptionRepository.save).toHaveBeenCalledWith([]);
    });
    it('should create a reference form design with options', async () => {
      const mockOption = [new CreateOptionDto()];
      const createDto = new CreateReferenceFormDesignDto();
      createDto.options = mockOption;
      const mockForm = new ReferenceForm();

      // Mock the createReferenceFormSection to return an object with an id
      const mockReferenceFormSection = new ReferenceFormDesign();
      jest
        .spyOn(service, 'createReferenceFormSection')
        .mockResolvedValue(mockReferenceFormSection);

      const mockOptionResult = new ReferenceFormOption();
      referenceFormOptionRepository.save.mockResolvedValue(mockOptionResult);

      await service.createReferenceFormDesign(mockForm, [createDto]);

      expect(service.createReferenceFormSection).toHaveBeenCalledWith(
        expect.objectContaining({
          reference_form: mockForm.id,
          ...createDto,
        }),
      );
      expect(referenceFormOptionRepository.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            reference_form_design: mockReferenceFormSection.id,
          }),
        ]),
      );
    });
  });

  describe('findOneDesign', () => {
    it('should find one form design', async () => {
      const option = { where: { id: '1' } };
      const mockForm = new ReferenceFormDesign();
      referenceFormDesignRepository.find.mockResolvedValue(mockForm);

      const result = await service.findDesign(option);

      expect(referenceFormDesignRepository.find).toHaveBeenCalledWith(option);
      expect(result).toEqual(mockForm);
    });
  });

  describe('updateReferenceForm', () => {
    it('should update a reference form and handle deletions and updates correctly', async () => {
      const referenceForm = new ReferenceForm();
      referenceForm.id = '1';
      const updateReferenceFormDto = new UpdateReferenceFormDto();
      updateReferenceFormDto.name = 'Updated Form';
      updateReferenceFormDto.status = DEFAULT_STATUS.active;

      const updateReferenceFormDesignDto = new UpdateReferenceFormDesignDto();
      updateReferenceFormDesignDto.options = [
        new UpdateOptionDto(),
        new UpdateOptionDto(),
      ];
      updateReferenceFormDesignDto.name = 'Section 1';

      // Mocking the update method of referenceFormRepository
      referenceFormRepository.update.mockResolvedValue({});

      await service.updateReferenceForm(referenceForm, updateReferenceFormDto);

      // Check if update was called for updating the reference form
      expect(referenceFormRepository.update).toHaveBeenCalledWith(
        referenceForm.id,
        {
          name: updateReferenceFormDto.name,
          status: updateReferenceFormDto.status,
        },
      );
    });

    it('should update a reference form and handle deletions and updates correctly', async () => {
      const referenceForm = new ReferenceForm();
      referenceForm.id = '1';
      const updateReferenceFormDto = new UpdateReferenceFormDto();
      updateReferenceFormDto.delete_question = ['1', '2'];
      updateReferenceFormDto.delete_option = ['1', '2'];
      updateReferenceFormDto.name = 'Updated Form';
      updateReferenceFormDto.status = DEFAULT_STATUS.active;

      const updateReferenceFormDesignDto = new UpdateReferenceFormDesignDto();

      updateReferenceFormDesignDto.name = 'Section 1';

      updateReferenceFormDto.reference_form = [updateReferenceFormDesignDto];

      // Mocking the findOneDesign method to return mock questions
      const mockQuestions = [
        { id: '1', reference_form_option: [] },
        { id: '2', reference_form_option: [] },
      ];
      jest.spyOn(service, 'findDesign').mockResolvedValue(mockQuestions as any);

      // Mocking the softRemove method of referenceFormDesignRepository
      referenceFormDesignRepository.softRemove.mockResolvedValue(mockQuestions);

      // Mocking the update method of referenceFormOptionRepository
      referenceFormOptionRepository.update.mockResolvedValue({});

      // Mocking the update method of referenceFormRepository
      referenceFormRepository.update.mockResolvedValue({});

      // Mocking the save method of referenceFormDesignRepository
      const mockFormData = new ReferenceFormDesign();
      mockFormData.id = '1';
      referenceFormDesignRepository.save.mockResolvedValue(mockFormData);

      await service.updateReferenceForm(referenceForm, updateReferenceFormDto);

      // Check if softRemove was called with the right questions
      expect(referenceFormDesignRepository.softRemove).toHaveBeenCalledWith(
        mockQuestions,
      );

      // Check if update was called for updating the reference form
      expect(referenceFormRepository.update).toHaveBeenCalledWith(
        referenceForm.id,
        {
          name: updateReferenceFormDto.name,
          status: updateReferenceFormDto.status,
        },
      );

      // Check if save was called for new reference form sections
      expect(referenceFormDesignRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...updateReferenceFormDesignDto,
          reference_form: { id: referenceForm.id },
        }),
      );
    });

    it('should update a reference form and handle deletions and updates correctly', async () => {
      const referenceForm = new ReferenceForm();
      referenceForm.id = '1';
      const updateReferenceFormDto = new UpdateReferenceFormDto();
      updateReferenceFormDto.delete_question = ['1', '2'];
      updateReferenceFormDto.delete_option = ['1', '2'];
      updateReferenceFormDto.name = 'Updated Form';
      updateReferenceFormDto.status = DEFAULT_STATUS.active;

      const updateReferenceFormDesignDto = new UpdateReferenceFormDesignDto();
      updateReferenceFormDesignDto.options = [
        new UpdateOptionDto(),
        new UpdateOptionDto(),
      ];
      updateReferenceFormDesignDto.name = 'Section 1';

      updateReferenceFormDto.reference_form = [updateReferenceFormDesignDto];

      // Mocking the findOneDesign method to return mock questions
      const mockQuestions = [
        { id: '1', reference_form_option: [] },
        { id: '2', reference_form_option: [] },
      ];
      jest.spyOn(service, 'findDesign').mockResolvedValue(mockQuestions as any);

      // Mocking the softRemove method of referenceFormDesignRepository
      referenceFormDesignRepository.softRemove.mockResolvedValue(mockQuestions);

      // Mocking the update method of referenceFormOptionRepository
      referenceFormOptionRepository.update.mockResolvedValue({});

      // Mocking the update method of referenceFormRepository
      referenceFormRepository.update.mockResolvedValue({});

      // Mocking the save method of referenceFormDesignRepository
      const mockFormData = new ReferenceFormDesign();
      mockFormData.id = '1';
      referenceFormDesignRepository.save.mockResolvedValue(mockFormData);

      // Mocking the save method of referenceFormOptionRepository
      referenceFormOptionRepository.save.mockResolvedValue({});

      await service.updateReferenceForm(referenceForm, updateReferenceFormDto);

      // Check if softRemove was called with the right questions
      expect(referenceFormDesignRepository.softRemove).toHaveBeenCalledWith(
        mockQuestions,
      );

      // Check if update was called for updating the reference form
      expect(referenceFormRepository.update).toHaveBeenCalledWith(
        referenceForm.id,
        {
          name: updateReferenceFormDto.name,
          status: updateReferenceFormDto.status,
        },
      );

      // Check if save was called for new reference form sections
      expect(referenceFormDesignRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...updateReferenceFormDesignDto,
          reference_form: { id: referenceForm.id },
        }),
      );

      // Check if save was called for new options
      updateReferenceFormDesignDto.options.forEach((option) => {
        expect(referenceFormOptionRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            ...option,
            reference_form_design: { id: mockFormData.id },
          }),
        );
      });
    });
  });
});
